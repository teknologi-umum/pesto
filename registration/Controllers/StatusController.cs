using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;

namespace Registration.Controllers;

[ApiController]
public class StatusController : ControllerBase
{
    private readonly IConnectionMultiplexer _redis;

    public StatusController(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    /// <summary>
    /// Health check
    /// </summary>
    /// <returns>Empty body</returns>
    /// <response code="200"></response>
    [HttpGet]
    [Route("/healthz")]
    public async Task<IActionResult> Status(CancellationToken cancellationToken)
    {
        var db = _redis.GetDatabase();
        await db.PingAsync();

        return Ok();
    }
}