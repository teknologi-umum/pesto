namespace Registration.Services;

public class UserNotExistsException : Exception
{
    public UserNotExistsException(string message) : base(message) { }
}