using System.Diagnostics.CodeAnalysis;
using FluentAssertions;
using Registration.Models;
using Registration.Services;
using StackExchange.Redis;

namespace RegistrationTest.ServiceTest;

[ExcludeFromCodeCoverage]
[TestCaseOrderer("RegistrationTest.AlphabeticalOrderer", "RegistrationTest")]
public class ApprovalServicesTest
{
    [Fact]
    public async void ShouldAbleToApproveAndRevokeUser()
    {
        const string email = "raymondwx@gmail.com";
        const int calls = 10;
        const string token = "123123123";
        User user = new User()
        {
            Building = "teknum",
            Calls = calls,
            Email = email,
            Name = "Raymond"
        };
        var redisMultiplexer = await ConnectionMultiplexer.ConnectAsync("localhost:6379");
        var waitingListService = new WaitingListService(redisMultiplexer);
        var approvalService = new ApprovalService(redisMultiplexer);
        
        await waitingListService.PutUserAsync(user, CancellationToken.None);
        
        await approvalService.ApproveUserAsync(new UserToken() { Email = email, Limit = calls, Token = token },
            CancellationToken.None);
        
        await approvalService.RevokeUserAsync(new UserToken() { Email = email, Limit = calls, Token = token },
            CancellationToken.None);

        // cleanup
        await waitingListService.RemoveUserAsync(user, CancellationToken.None);
    }

    [Fact]
    public async void ShouldReturnUserByToken()
    {
        const string email = "raymondwx@gmail.com";
        const int calls = 10;
        const string token = "123123123";
        User user = new User()
        {
            Building = "teknum",
            Calls = calls,
            Email = email,
            Name = "Raymond"
        };
        var redisMultiplexer = await ConnectionMultiplexer.ConnectAsync("localhost:6379");
        var waitingListService = new WaitingListService(redisMultiplexer);
        var approvalService = new ApprovalService(redisMultiplexer);
        
        await waitingListService.PutUserAsync(user, CancellationToken.None);
        
        await approvalService.ApproveUserAsync(new UserToken() { Email = email, Limit = calls, Token = token },
            CancellationToken.None);

        RegisteredUser registeredUser = await approvalService.GetUserByTokenAsync(token, CancellationToken.None);
        registeredUser.UserEmail.Should().Be(email);
        
        // cleanup
        await waitingListService.RemoveUserAsync(user, CancellationToken.None);
    }
}