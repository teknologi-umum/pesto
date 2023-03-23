using System;

namespace Pesto.Exceptions {
    public class PestoServerRateLimitedException : Exception {
        public PestoServerRateLimitedException() : base("Server rate limited") { }
    }
}
