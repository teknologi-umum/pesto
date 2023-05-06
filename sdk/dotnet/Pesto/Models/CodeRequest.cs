namespace Pesto.Models {
    public class CodeRequest {
        public CodeRequest(string language, string code) {
            Language       = language;
            Code           = code;
            CompileTimeout = 10000;
            RunTimeout     = 10000;
            MemoryLimit    = 200000000;
            Version        = "latest";
        }

        public CodeRequest(string language,
                           string code,
                           int? compileTimeout,
                           int? runTimeout,
                           int? memoryLimit,
                           string version) {
            Language       = language;
            Code           = code;
            CompileTimeout = compileTimeout ?? 10000;
            RunTimeout     = runTimeout ?? 10000;
            MemoryLimit    = memoryLimit ?? 200000000;
            Version        = version ?? "latest";
        }

        public string Language { get; }
        public string Code { get; }
        public int CompileTimeout { get; }
        public int RunTimeout { get; }
        public int MemoryLimit { get; }
        public string Version { get; }
    }
}
