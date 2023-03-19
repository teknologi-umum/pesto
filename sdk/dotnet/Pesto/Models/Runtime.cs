namespace Pesto.Models; 

public record Runtime(string Language,
                      string Version,
                      List<string> Aliases,
                      bool Compiled);
