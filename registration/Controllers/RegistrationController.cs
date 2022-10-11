using Microsoft.AspNetCore.Mvc;
using Registration.Models;
using Registration.Services;
using StackExchange.Redis;

namespace Registration.Controllers;

[ApiController]
public class RegistrationController : ControllerBase
{
    private readonly IConnectionMultiplexer _redis;
    private readonly WaitingListService _waitingListService;
    private readonly ApprovalService _approvalService;

    public RegistrationController(IConnectionMultiplexer redis, WaitingListService waitingListService, ApprovalService approvalService)
    {
        _redis = redis;
        _waitingListService = waitingListService;
        _approvalService = approvalService;
    }

    /// <summary>
    /// Register a user into waiting list
    /// </summary>
    /// <param name="user"></param>
    /// <returns>Nothing</returns>
    /// <response code="201">User successfully registered</response>
    /// <response code="204">User already registered, but no worries</response>
    [HttpPost]
    [Route("/api/register")]
    public async Task<IActionResult> RegisterAsync([FromBody] User user, CancellationToken cancellationToken)
    {
        try
        {
            await _waitingListService.PutUserAsync(user, cancellationToken);

            return Created(new Uri("/register"), null);
        }
        catch (EmailExistsException)
        {
            return Accepted();
        }
    }

    /// <summary>
    /// List users on the waiting list
    /// </summary>
    /// <returns></returns>
    [HttpGet]
    [Route("/api/pending")]
    public async Task<IActionResult> PendingAsync(CancellationToken cancellationToken)
    {
        var waitingList = await _waitingListService.GetUsersAsync(cancellationToken);

        return Ok(waitingList);
    }

    /// <summary>
    /// Approve user from the waiting list
    /// </summary>
    /// <param name="userToken"></param>
    /// <returns></returns>
    /// <response code="400">User does not exists</response>
    /// <response code="200">Successfully registered a user</response>
    [HttpPut]
    [Route("/api/approve")]
    public async Task<IActionResult> ApproveAsync([FromBody] UserToken userToken, CancellationToken cancellationToken)
    {
        var waitingList = await _waitingListService.GetUsersAsync(cancellationToken);

        // Check if email exists on the waiting list
        var user = (from x in waitingList
                    where x.Email.Equals(userToken.Email)
                    select x).FirstOrDefault();

        if (user is null)
        {
            return BadRequest("Email does not exists");
        }

        await _approvalService.ApproveUserAsync(userToken, cancellationToken);
        await _waitingListService.RemoveUserAsync(user, cancellationToken);

        return Ok();
    }

    /// <summary>
    /// Revoke registered user
    /// </summary>
    /// <param name="userToken"></param>
    /// <returns></returns>
    /// <response code="400">User does not exists</response>
    /// <response code="200">Successfully revoked a user</response>
    [HttpPut]
    [Route("/api/revoke")]
    public async Task<IActionResult> RevokeAsync([FromBody] UserToken userToken, CancellationToken cancellationToken)
    {
        try
        {
            var registeredUser = await _approvalService.GetUserByTokenAsync(userToken.Token, cancellationToken);
            await _approvalService.RevokeUserAsync(
                new UserToken { Email = registeredUser.UserEmail, Token = userToken.Token, Limit = 0 },
                CancellationToken.None);

            return Ok();
        }
        catch (UserNotExistsException)
        {
            return BadRequest("User does not exists");
        }
    }
}
