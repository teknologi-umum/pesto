﻿using System.Text;
using System.Text.Json;
using Registration.Models;
using StackExchange.Redis;

namespace Registration.Services;

public class TrialService
{
    private readonly char[] _characters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".ToCharArray();

    private readonly Random _random = new((int)DateTime.Now.Ticks);
    private readonly IConnectionMultiplexer _redis;

    public TrialService(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    /// <summary>
    ///     Create a random token string for users to use.
    ///     The token will expired in 24 hours.
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    public async Task<string> CreateTokenAsync(CancellationToken cancellationToken)
    {
        var token = "TRIAL-" + RandomString(64 - 6);
        var userEmail = "trial-" + RandomString(20) + "@pesto.teknologiumum.com";
        var registeredUser = new RegisteredUser(
            userEmail,
            monthlyLimit: 10,
            revoked: false);

        var serializedUser = JsonSerializer.Serialize(registeredUser);

        var db = _redis.GetDatabase();
        await db.StringSetAsync(
            token,
            serializedUser,
            TimeSpan.FromHours(24),
            When.Always);

        return token;
    }

    private string RandomString(int size)
    {
        var builder = new StringBuilder();
        for (var i = 0; i < size; i++)
        {
            var character = _characters[_random.Next(_characters.Length)];
            builder.Append(character);
        }

        return builder.ToString();
    }
}