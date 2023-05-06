using System.Collections.Generic;

namespace Pesto.Models {
    public class Runtime {
        public Runtime(string language, string version, IList<string> aliases, bool compiled) {
            Language = language;
            Version  = version;
            Aliases  = aliases;
            Compiled = compiled;
        }

        public string Language { get; set; }
        public string Version { get; set; }
        public IList<string> Aliases { get; set; }
        public bool Compiled { get; set; }
    }
}
