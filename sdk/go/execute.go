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
	VersionGo  Version  = "1.18.3"

	LanguageJava Language = "Java"
	VersionJava  Version  = "17"

	LanguageJavascript Language = "Javascript"
	VersionJavascript  Version  = "16.15.0"

	LanguageJulia Language = "Julia"
	VersionJulia  Version  = "1.7.3"

	LanguageLua Language = "Lua"
	VersionLua  Version  = "5.4.4"

	LanguagePHP Language = "PHP"
	VersionPHP  Version  = "8.1"

	LanguagePython Language = "Python"
	VersionPython  Version  = "3.10.2"

	LanguageRuby Language = "Ruby"
	VersionRuby  Version  = "3.1.2"

	LanguageSQLite Language = "SQLite3"
	VersionSQLite  Version  = "3.34.1"

	LanguageV Language = "V"
	VersionV  Version  = "0.3"
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
	CompileTimeout int32  `json:"compileTimeout"`
	RunTimeout     int32  `json:"runTimeout"`
	MemoryLimit    int32  `json:"memoryLimit"`
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

func (c *Client) Execute(ctx context.Context, codeRequest CodeRequest) (CodeResponse, error) {
	requestBody, err := json.Marshal(codeRequestSimplified{
		Language:       string(codeRequest.Language),
		Version:        string(codeRequest.Version),
		Code:           codeRequest.Code,
		CompileTimeout: int32(codeRequest.CompileTimeout) / 1000000,
		RunTimeout:     int32(codeRequest.CompileTimeout) / 1000000,
		MemoryLimit:    codeRequest.MemoryLimit,
	})
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
		err := json.NewDecoder(response.Body).Decode(&errResponse)
		if err != nil && !errors.Is(err, io.EOF) && !errors.Is(err, io.ErrClosedPipe) {
			return CodeResponse{}, fmt.Errorf("reading json body: %w", err)
		}

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
