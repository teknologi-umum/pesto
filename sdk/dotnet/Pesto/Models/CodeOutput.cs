namespace Pesto.Models {
    public class CodeOutput {
        public CodeOutput(string stdout, string stderr, string output, int exitCode) {
            Stdout   = stdout;
            Stderr   = stderr;
            Output   = output;
            ExitCode = exitCode;
        }

        public string Stdout { get; }
        public string Stderr { get; }
        public string Output { get; }
        public int ExitCode { get; }
    }
}
