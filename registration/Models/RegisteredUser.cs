namespace Registration.Models;

public class RegisteredUser
{
    public string UserEmail { get; set; }
    public int MonthlyLimit { get; set; }
    public bool Revoked { get; set; }

    public RegisteredUser(string userEmail, int monthlyLimit, bool revoked)
    {
        UserEmail = userEmail;
        MonthlyLimit = monthlyLimit;
        Revoked = revoked;
    }
}