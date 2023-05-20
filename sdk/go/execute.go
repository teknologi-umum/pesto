package pesto

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"
)

type Language string
type Version string

var (
	LanguageBrainfuck Language = "Brainfuck"
	VersionBrainfuck  Version  = "2.7.3"

	LanguageC Language = "C"
	VersionC  Version  = "10.2.1"

	LanguageCPlusPlus Language = "C++"
	VersionCPlusPlus  Version  = "10.2.1"

	LanguageCommonLisp Language = "Common Lisp"
	VersionCommonLisp  Version  = "2.2.7"

	LanguageDotnet Language = ".NET"
	VersionDotnet  Version  = "6.0.300"

	LanguageGo Language = "Go"
	VersionGo  Version  = "1.20.2"

	LanguageJava Language = "Java"
	VersionJava  Version  = "17"

	LanguageJavascript Language = "Javascript"
	VersionJavascript  Version  = "18.12.1"

	LanguageJulia Language = "Julia"
	VersionJulia  Version  = "1.7.3"

	LanguageLua Language = "Lua"
	VersionLua  Version  = "5.4.4"

	LanguagePHP Language = "PHP"
	VersionPHP  Version  = "8.1"

	LanguagePython Language = "Python"
	VersionPython  Version  = "3.10.10"

	LanguageRuby Language = "Ruby"
	VersionRuby  Version  = "3.2.1"

	LanguageSQLite Language = "SQLite3"
	VersionSQLite  Version  = "3.34.1"

	LanguageV Language = "V"
	VersionV  Version  = "0.3"

	// VersionLatest tells the API to choose the latest version
	// of the selected language. The `version` response will be a
	// normal semver version, instead of the same "latest"
	// string input.
	VersionLatest Version = "latest"
)

type CodeRequest struct {
	Language       Language
	Version        Version
	Code           string
	CompileTimeout time.Duration
	RunTimeout     time.Duration
	MemoryLimit    int32
}

type codeRequestSimplified struct {
	Language       string `json:"language"`
	Version        string `json:"version"`
	Code           string `json:"code"`
	CompileTimeout int32  `json:"compileTimeout,omitempty"`
	RunTimeout     int32  `json:"runTimeout,omitempty"`
	MemoryLimit    int32  `json:"memoryLimit,omitempty"`
}

type Output struct {
	Stdout   string `json:"stdout"`
	Stderr   string `json:"stderr"`
	Output   string `json:"output"`
	ExitCode int    `json:"exitCode"`
}

type CodeResponse struct {
	Language string `json:"language"`
	Version  string `json:"version"`
	Compile  Output `json:"compile"`
	Runtime  Output `json:"runtime"`
}

// Execute calls the execute endpoint, and execute the given code from the codeRequest parameter.
//
// Custom language and version outside of the defined ones are allowed through:
//
//	Execute(ctx, CodeRequest{
//		Language: pesto.Language("Rust"),
//		Version:  pesto.Version("1.64.0"),
//	})
//
// Make sure that you put the correct language and version combination, otherwise, an error
// of ErrRuntimeNotFound will be returned.
//
// If language, version, or code is empty, ErrMissingParameters will be returned.
// If the combination between language and version is not found on the server,
// ErrRuntimeNotFound will be returned.
func (c *Client) Execute(ctx context.Context, codeRequest CodeRequest) (CodeResponse, error) {
	body := codeRequestSimplified{
		Language:    string(codeRequest.Language),
		Version:     string(codeRequest.Version),
		Code:        codeRequest.Code,
		MemoryLimit: codeRequest.MemoryLimit,
	}

	if codeRequest.CompileTimeout > 1000000 {
		body.CompileTimeout = int32(codeRequest.CompileTimeout) / 1000000
	}

	if codeRequest.RunTimeout > 1000000 {
		body.RunTimeout = int32(codeRequest.RunTimeout) / 1000000
	}

	requestBody, err := json.Marshal(body)
	if err != nil {
		return CodeResponse{}, fmt.Errorf("marshalling json body: %w", err)
	}

	request, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL.JoinPath("/api/execute").String(), bytes.NewReader(requestBody))
	if err != nil {
		return CodeResponse{}, fmt.Errorf("creating request: %w", err)
	}

	response, err := c.sendRequest(ctx, request)
	if err != nil {
		return CodeResponse{}, fmt.Errorf("sending request: %w", err)
	}

	if response.StatusCode != 200 {
		var errResponse errorResponse
		// HACK: the error is intentionally not handled, we wanted to leave the empty errorResponse struct
		// if there is any non-json response being sent from the server
		_ = json.NewDecoder(response.Body).Decode(&errResponse)
		err = response.Body.Close()
		if err != nil && !errors.Is(err, io.EOF) && !errors.Is(err, io.ErrClosedPipe) && !errors.Is(err, http.ErrBodyReadAfterClose) {
			return CodeResponse{}, fmt.Errorf("closing response body: %w", err)
		}

		return CodeResponse{}, c.handleErrorCode(response.StatusCode, errResponse)
	}

	var codeResponse CodeResponse
	err = json.NewDecoder(response.Body).Decode(&codeResponse)
	if err != nil {
		return CodeResponse{}, fmt.Errorf("reading json body: %w", err)
	}

	err = response.Body.Close()
	if err != nil && !errors.Is(err, io.EOF) && !errors.Is(err, io.ErrClosedPipe) && !errors.Is(err, http.ErrBodyReadAfterClose) {
		return CodeResponse{}, fmt.Errorf("closing response body: %w", err)
	}

	return codeResponse, nil
}
