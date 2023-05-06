namespace Pesto.Models {
    public class CodeResponse {
        public string Language { get; set; }
        public string Version { get; set; }
        public CodeOutput Compile { get; set; }
        public CodeOutput Runtime { get; set; }
    }
}
