using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Registration.Models;

public class UserToken
{
    [Required, EmailAddress, JsonPropertyName("email")]
    public string Email { get; set; }
    [Required, JsonPropertyName("token")]
    public string Token { get; set; }
    [Required, JsonPropertyName("limit")]
    public int Limit { get; set; }
}