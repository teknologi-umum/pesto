using System.Text.Json;
using Registration.Models;
using StackExchange.Redis;

namespace Registration.Services;

public class WaitingListService
{
    private readonly IConnectionMultiplexer _redis;

    public WaitingListService(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    /// <summary>
    ///     Put a user into the waiting list.
    /// </summary>
    /// <param name="user">User</param>
    /// <param name="cancellationToken"></param>
    /// <exception cref="EmailExistsException">Thrown if user already registered before</exception>
    public async Task PutUserAsync(User user, CancellationToken cancellationToken)
    {
        var waitingListUsers = await GetUsersAsync(cancellationToken);

        // Check if the user's email already exists on the waiting list
        var emailExists = (from waitingListUser in waitingListUsers
                           where waitingListUser.Email.Equals(user.Email)
                           select true)
            .FirstOrDefault(false);

        if (emailExists) throw new EmailExistsException(user.Email);

        var serializedUser = JsonSerializer.Serialize(user);
        var db = _redis.GetDatabase();
        await db.ListRightPushAsync("waiting-list", serializedUser);
    }

    /// <summary>
    ///     Get all users from the waiting list
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    public async Task<IEnumerable<User>> GetUsersAsync(CancellationToken cancellationToken)
    {
        var db = _redis.GetDatabase();
        var waitingList = await db.ListRangeAsync("waiting-list");

        var users = new List<User>();
        foreach (var value in waitingList)
        {
            if (!value.HasValue) continue;

            var user = JsonSerializer.Deserialize<User>(value.ToString());
            if (user is null)
            {
                continue;
            }

            users.Add(user);
        }

        return users;
    }

    /// <summary>
    ///     Removes a user from the waiting list.
    /// </summary>
    /// <param name="user"></param>
    /// <param name="cancellationToken"></param>
    public async Task RemoveUserAsync(User user, CancellationToken cancellationToken)
    {
        var waitingListUsers = await GetUsersAsync(cancellationToken);

        // Filter out user
        var filteredWaitingListUsers = from waitingListUser in waitingListUsers
                                       where waitingListUser.Email != user.Email
                                       select waitingListUser;

        var db = _redis.GetDatabase();
        await db.KeyDeleteAsync("waiting-list");

        foreach (var value in filteredWaitingListUsers)
        {
            if (value is null) continue;

            var serializedUser = JsonSerializer.Serialize(value);
            await db.ListRightPushAsync("waiting-list", serializedUser);
        }
    }
}