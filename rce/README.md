# RCE module

This module is a code execution engine, providing endpoints to safely and securely execute
arbitrary code from the list of supported languages. See [packages](./packages/) directory for
details on supported languages

## Development

Assuming you have [Node.js](https://nodejs.org/) installed.

Install dependencies:

```bash
npm install
```

Running the application in development mode should be unnecessary. All functionalities should be
covered by tests. External executables like `gcc`, `python3`, and `lua` are optinoal, yet it's
recommended to test `Job` (the core logic to execute code) functionalities.

Run tests:

```bash
# If you have gcc executables
export LANGUAGE_C=true

# If you have python3 executable
export LANGUAGE_PYTHON=true

# If you have lua executable
export LANGUAGE_LUA=true

# If you want to test against Node.js
export LANGUAGE_JAVASCRIPT=true

# Then, run
npm run test
```
