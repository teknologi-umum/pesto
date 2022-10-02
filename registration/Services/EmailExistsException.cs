namespace Registration.Services;

public class EmailExistsException : Exception
{
    public override string Message { get; }

    public EmailExistsException(string message)
    {
        Message = message;
    }
}