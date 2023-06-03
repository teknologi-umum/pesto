using System;

namespace Pesto.Exceptions {
    public class PestoMonthlyLimitExceededException : Exception {
        public PestoMonthlyLimitExceededException() : base("Monthly limit exceeded for current token") { }
    }
}
