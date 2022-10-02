namespace Registration.Services;

public class UserNotExistsException : Exception
{
    public override string Message { get; }

    public UserNotExistsException(string message)
    {
        Message = message;
    } 
}