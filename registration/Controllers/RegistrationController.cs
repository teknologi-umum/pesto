using Microsoft.AspNetCore.Mvc;
using Registration.Models;
using Registration.Services;
using Sentry;
using User = Registration.Models.User;

namespace Registration.Controllers;

[ApiController]
public class RegistrationController : ControllerBase
{
    private readonly ApprovalService _approvalService;
    private readonly IHub _sentryHub;
    private readonly TrialService _trialService;
    private readonly WaitingListService _waitingListService;

    public RegistrationController(WaitingListService waitingListService, ApprovalService approvalService,
                                  TrialService trialService, IHub sentryHub)
    {
        _waitingListService = waitingListService;
        _approvalService = approvalService;
        _trialService = trialService;
        _sentryHub = sentryHub;
    }

    /// <summary>
    ///     Register a user into waiting list
    /// </summary>
    /// <param name="user"></param>
    /// <param name="cancellationToken"></param>
    /// <returns>Nothing</returns>
    /// <response code="201">User successfully registered</response>
    /// <response code="204">User already registered, but no worries</response>
    [HttpPost, Route("/api/register")]
    public async Task<IActionResult> RegisterAsync([FromBody] User user, CancellationToken cancellationToken)
    {
        try
        {
            var childSpan = _sentryHub.GetSpan()?.StartChild("waiting_list.put_user");
            await _waitingListService.PutUserAsync(user, cancellationToken);
            childSpan?.Finish();

            return Created(new Uri("/register"), value: null);
        }
        catch (EmailExistsException)
        {
            return Accepted();
        }
    }

    /// <summary>
    ///     List users on the waiting list
    /// </summary>
    /// <returns></returns>
    [HttpGet, Route("/api/pending")]
    public async Task<IActionResult> PendingAsync(CancellationToken cancellationToken)
    {
        var childSpan = _sentryHub.GetSpan()?.StartChild("waiting_list.get_users");
        var waitingList = await _waitingListService.GetUsersAsync(cancellationToken);
        childSpan?.Finish(SpanStatus.Ok);

        return Ok(waitingList);
    }

    /// <summary>
    ///     Approve user from the waiting list
    /// </summary>
    /// <param name="userToken"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    /// <response code="400">User does not exists</response>
    /// <response code="200">Successfully registered a user</response>
    [HttpPut, Route("/api/approve")]
    public async Task<IActionResult> ApproveAsync([FromBody] UserToken userToken, CancellationToken cancellationToken)
    {
        var childSpan = _sentryHub.GetSpan()?.StartChild("waiting_list.get_users");
        var waitingList = await _waitingListService.GetUsersAsync(cancellationToken);
        childSpan?.Finish(SpanStatus.Ok);

        // Check if email exists on the waiting list
        var user = (from x in waitingList
                    where x.Email.Equals(userToken.Email)
                    select x).FirstOrDefault();

        if (user is null)
        {
            return BadRequest("Email does not exists");
        }

        childSpan = _sentryHub.GetSpan()?.StartChild("approval.approve_user");
        await _approvalService.ApproveUserAsync(userToken, cancellationToken);
        childSpan?.Finish();

        childSpan = _sentryHub.GetSpan()?.StartChild("waiting_list.remove_user");
        await _waitingListService.RemoveUserAsync(user, cancellationToken);
        childSpan?.Finish();

        return Ok();
    }

    /// <summary>
    ///     Revoke registered user
    /// </summary>
    /// <param name="userToken"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    /// <response code="400">User does not exists</response>
    /// <response code="200">Successfully revoked a user</response>
    [HttpPut, Route("/api/revoke")]
    public async Task<IActionResult> RevokeAsync([FromBody] UserToken userToken, CancellationToken cancellationToken)
    {
        try
        {
            var childSpan = _sentryHub.GetSpan()?.StartChild("approval.get_user_by_token");
            var registeredUser = await _approvalService.GetUserByTokenAsync(userToken.Token, cancellationToken);
            childSpan?.Finish();

            childSpan = _sentryHub.GetSpan()?.StartChild("approval.revoke_user");
            await _approvalService.RevokeUserAsync(
                new UserToken { Email = registeredUser.UserEmail, Token = userToken.Token, Limit = 0 },
                cancellationToken);

            childSpan?.Finish();

            return Ok();
        }
        catch (UserNotExistsException)
        {
            return BadRequest("User does not exists");
        }
    }

    /// <summary>
    ///     Create a temporary token for a trial user
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    [HttpPost, Route("/api/trial")]
    public async Task<IActionResult> TrialAsync(CancellationToken cancellationToken)
    {
        var childSpan = _sentryHub.GetSpan()?.StartChild("trial.create_token");
        var token = await _trialService.CreateTokenAsync(cancellationToken);
        childSpan?.Finish();

        return Ok(token);
    }
}