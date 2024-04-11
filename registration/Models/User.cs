using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Registration.Models;

public class User
{
    [Required, JsonPropertyName("name")]
    public string Name { get; set; }
    [Required, EmailAddress, JsonPropertyName("email")]
    public string Email { get; set; }
    [Required, JsonPropertyName("building")]
    public string Building { get; set; }
    [Required, JsonPropertyName("calls")]
    public int Calls { get; set; }
}