namespace Registration.Models;

public class RegisteredUser
{

    public RegisteredUser(string userEmail, int monthlyLimit, bool revoked)
    {
        UserEmail = userEmail;
        MonthlyLimit = monthlyLimit;
        Revoked = revoked;
    }

    public string UserEmail { get; set; }
    public int MonthlyLimit { get; set; }
    public bool Revoked { get; set; }
}