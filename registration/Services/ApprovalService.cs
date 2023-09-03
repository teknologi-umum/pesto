using System.Text.Json;
using Registration.Models;
using StackExchange.Redis;

namespace Registration.Services;

public class ApprovalService
{
    private readonly IConnectionMultiplexer _redis;

    public ApprovalService(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    /// <summary>
    ///     Approve the user from the waiting list into the proper registered user.
    /// </summary>
    /// <param name="userToken">User object including the generated token</param>
    /// <param name="cancellationToken"></param>
    public async Task ApproveUserAsync(UserToken userToken, CancellationToken cancellationToken)
    {
        var registeredUser = new RegisteredUser(
            userToken.Email,
            userToken.Limit,
            revoked: false);

        var serializedUser = JsonSerializer.Serialize(registeredUser);
        var db = _redis.GetDatabase();
        await db.StringSetAsync(
            userToken.Token,
            serializedUser,
            expiry: null);
    }

    /// <summary>
    ///     Revoke a user from the list of registered users.
    /// </summary>
    /// <param name="userToken">User object including the generated token</param>
    /// <param name="cancellationToken"></param>
    public async Task RevokeUserAsync(UserToken userToken, CancellationToken cancellationToken)
    {
        var registeredUser = new RegisteredUser(
            userToken.Email,
            userToken.Limit,
            revoked: true);

        var serializedUser = JsonSerializer.Serialize(registeredUser);
        var db = _redis.GetDatabase();
        await db.StringSetAsync(
            userToken.Token,
            serializedUser,
            expiry: null);
    }

    /// <summary>
    ///     Get a user by their token.
    /// </summary>
    /// <param name="token"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    /// <exception cref="UserNotExistsException">Will be thrown if the user does not exists</exception>
    public async Task<RegisteredUser> GetUserByTokenAsync(string token, CancellationToken cancellationToken)
    {
        var db = _redis.GetDatabase();
        var registeredUser = await db.StringGetAsync(token);

        if (!registeredUser.HasValue) throw new UserNotExistsException(token);

        var user = JsonSerializer.Deserialize<RegisteredUser>(registeredUser.ToString());

        if (user is null) throw new UserNotExistsException(token);

        return user;
    }
}