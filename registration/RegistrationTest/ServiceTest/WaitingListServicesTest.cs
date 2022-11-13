using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;
using FluentAssertions;
using Registration.Models;
using Registration.Services;
using StackExchange.Redis;

namespace RegistrationTest.ServiceTest;

[ExcludeFromCodeCoverage]
[TestCaseOrderer("RegistrationTest.AlphabeticalOrderer", "RegistrationTest")]
public class WaitingListServicesTest
{
    [Fact]
    public async void ShouldAbleToCleanUsers()
    {
        var redisMultiplexer = await ConnectionMultiplexer.ConnectAsync("localhost:6379");
        var waitingListService = new WaitingListService(redisMultiplexer);
        
        ImmutableList<User> listOfUser =
            (await waitingListService.GetUsersAsync(CancellationToken.None)).ToImmutableList();
        foreach (var user in listOfUser)
        {
            await waitingListService.RemoveUserAsync(user,CancellationToken.None);
        }
    }
    [Fact]
    public async void ShouldBeAbleToAddAndQueryAndDeleteUsers()
    {
        var redisMultiplexer = await ConnectionMultiplexer.ConnectAsync("localhost:6379");

        var waitingListService = new WaitingListService(redisMultiplexer);
        User user1 = new User()
        {
            Building = "teknum",
            Calls = 10,
            Email = "raymond@gmail.com",
            Name = "Raymond"
        };
        User user2 = new User()
        {
            Building = "teknum2",
            Calls = 10,
            Email = "raymond3@gmail.com",
            Name = "Raymond"
        };
        User user3 = new User()
        {
            Building = "teknum3",
            Calls = 10,
            Email = "raymond2@gmail.com",
            Name = "Raymond"
        };
        await waitingListService.PutUserAsync(user1, CancellationToken.None);
        await waitingListService.PutUserAsync(user2, CancellationToken.None);
        await waitingListService.PutUserAsync(user3, CancellationToken.None);


        ImmutableList<User> listOfUser =
            (await waitingListService.GetUsersAsync(CancellationToken.None)).ToImmutableList();

        listOfUser.Count.Should().Be(3);

        await waitingListService.RemoveUserAsync(user1, CancellationToken.None);

        listOfUser =
            (await waitingListService.GetUsersAsync(CancellationToken.None)).ToImmutableList();

        listOfUser.Count.Should().Be(2);
        listOfUser.Find(user => user.Email.Equals(user1.Email)).Should().BeNull();
        
        await waitingListService.RemoveUserAsync(user2, CancellationToken.None);
        await waitingListService.RemoveUserAsync(user3, CancellationToken.None);
        
        listOfUser =
            (await waitingListService.GetUsersAsync(CancellationToken.None)).ToImmutableList();

        listOfUser.Count.Should().Be(0);
    }
    [Fact]
    public async void ShouldPreventDuplicateEmail()
    {
        var redisMultiplexer = await ConnectionMultiplexer.ConnectAsync("localhost:6379");

        var waitingListService = new WaitingListService(redisMultiplexer);
        User user1 = new User()
        {
            Building = "teknum",
            Calls = 10,
            Email = "raymondwp@gmail.com",
            Name = "Raymond"
        };
        User user2 = new User()
        {
            Building = "teknum2",
            Calls = 10,
            Email = "raymondwp@gmail.com",
            Name = "Raymond"
        };

        await waitingListService.PutUserAsync(user1, CancellationToken.None);

        await Assert.ThrowsAsync<EmailExistsException>( async () =>
        {
            await waitingListService.PutUserAsync(user2, CancellationToken.None);
        });
    }
}