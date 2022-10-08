namespace Registration.Services;

public class EmailExistsException : Exception
{
    public EmailExistsException(string message) : base(message) { }
}