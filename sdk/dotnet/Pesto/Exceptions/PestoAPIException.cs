namespace Pesto.Exceptions; 

public class PestoAPIException : Exception {
    public PestoAPIException(string? message) : base(message) { }
    public PestoAPIException() : base("Unhandled exception with empty message") { }
}
