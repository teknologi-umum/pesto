namespace Pesto.Exceptions; 

public class PestoRuntimeNotFoundException : Exception {
    public PestoRuntimeNotFoundException(string? runtime) 
        : base($"Runtime not found for {runtime ?? "current request"}") {	}
}
