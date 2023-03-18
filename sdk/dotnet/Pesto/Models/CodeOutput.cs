namespace Pesto.Models; 

public record CodeOutput(string Stdout,
                        string Stderr,
                        string Output,
                        int ExitCode);
