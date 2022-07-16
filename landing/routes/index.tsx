/** @jsx h */
import { h } from "preact";
import Form from "~/islands/Form.tsx";
import { Logo } from "~/components/Logo.tsx";
import { Layout } from "~/components/Layout.tsx";
import { Section } from "~/components/Section.tsx";
import { GuideSection } from "~/components/GuideSection.tsx";
import { FieldList } from "~/components/FieldList.tsx";
import { ButtonLink } from "~/components/ButtonLink.tsx";

export default function Home() {
  return (
    <Layout>
      <header>
        <Logo />
        <p class="description">
          A Remote Code Execution Engine that lets you execute any piece of code on a remote server via HTTP REST API.
        </p>
        <div class="buttons">
          <ButtonLink href="#get-started" variant="green">
            GET STARTED
          </ButtonLink>
          <ButtonLink href="#request" variant="yellow-green">
            GET STARTED
          </ButtonLink>
        </div>
      </header>
      <Section title="What is Pesto?">
        <p>
          <strong>Pesto</strong>{" "}
          is a Remote Code Execution Engine that lets you execute any piece of code on a remote server via REST API. It
          is heavily inspired by{" "}
          <a class="url" href="https://github.com/engineer-man/piston">
            Piston.
          </a>{" "}
          Pesto is <strong>not</strong>{" "}
          a fork of Piston, it's an entire rewrite from scratch and therefore it's not compatible with Piston but should
          be similar if you're already familiar with Piston.
        </p>
      </Section>
      <Section title="How is it different from Piston?">
        <p>
          Unlike Piston, Pesto uses TypeScript instead of JavaScript. Think of it as an aggresive refactor approach to
          simplify the codebase and its functionality.
        </p>
        <p>
          The way Piston works is you would install the language support separately using the Piston CLI. In Pesto,
          however, the language is bundled in the docker image. You can choose which language you want to use by
          defining a language configuration inside a
          <code class="inline-code">.toml</code> file and an installation script before you deploy your Pesto instance.
        </p>
        <p>
          Pesto is much simpler than Piston. It doesn't support uploading files to execute and passing arguments or
          stdin to your program.
        </p>
      </Section>
      <Section title="How does Pesto execute my code?">
        <p>
          Pesto will execute your code in an isolated docker environment from a dedicated temporary user that will get
          removed once your code is finished being executed. Your code will have no access to the filesystem, internet,
          and it will have a very limited amount of resources by default.
        </p>
      </Section>
      <Section title="What Pesto is and isn't">
        <p>
          Pesto is not a replacement for a serverless runtime, no. It is meant to execute a short snippet of your code.
          This is suitable if you're building a code challenge platform or similar because usually you will only need to
          execute short snippets of code like user's submission for a challenge.
        </p>
      </Section>
      <Section title="How do I get started?" id="get-started">
        <p>
          You can use the provided HTTP REST API to execute your code, but you can also host your own instance of Pesto
          on your own server. Since we don't have an unlimited resource, an API token is required to limit any incoming
          requests.
        </p>
        <GuideSection title="Usage via REST API">
          <ul class="guide-list">
            <li>
              Request an API token{" "}
              <a class="url" href="#request">
                here
              </a>
            </li>
            <li>
              Send a POST request to the server with the token as the
              <code class="inline-code">X-Pesto-Token</code> header and an
              <code class="inline-code">application/json</code> body with the following fields:
              <FieldList
                items={[
                  {
                    key: "language",
                    value: "The language of the code that you want to execute.",
                  },
                  {
                    key: "version",
                    value: "The version of the language.",
                  },
                  {
                    key: "code",
                    value: "The code that you want to execute.",
                  },
                ]}
              />
            </li>
            <li>
              Upon sending a successful request, you will receive a response with the following fields:
              <FieldList
                items={[
                  {
                    key: "language",
                    value: "The language of the code that you sent.",
                  },
                  {
                    key: "version",
                    value: "The version of the language.",
                  },
                  {
                    key: "compile/runtime",
                    value: "The result of the compilation and execution with the following fields.",
                    nestedItems: [
                      {
                        key: "stdout",
                        value: "The content of the stdout when the code is being compiled or executed.",
                      },
                      {
                        key: "stderr",
                        value: "The content of the stderr when the code is being compiled or executed.",
                      },
                      {
                        key: "output",
                        value: "The combination of stdout and stderr.",
                      },
                      {
                        key: "exitCode",
                        value: "The exit code of the program compilation or execution.",
                      },
                      {
                        key: "compileTimeout",
                        value:
                          "(Optional) The maximum duration that the code is allowed to compile in millisecond. Maximum value is 30 seconds (30000 milliseconds). If not provided, the default value of 5 seconds will be set.",
                      },
                      {
                        key: "runTimeout",
                        value:
                          "(Optional) The maximum duration that the code is allowed to run in millisecond. Maximum value is 30 seconds (30000 milliseconds). If not provided, the default value of 5 seconds will be set.",
                      },
                      {
                        key: "memoryLimit",
                        value:
                          "(Optional) The maximum amount of memory that the code is allowed to use in bytes. Maximum value is 512MB (1024 * 1024 * 512). If not provided, the default value of 128MB will be set.",
                      },
                    ],
                  },
                ]}
              />
            </li>
          </ul>
        </GuideSection>
        <GuideSection title="Example">
          <p>
            Here's an example on how a request and response should look like.
          </p>
          <div class="example">
            <div class="example-item">
              <div class="example-label">Request</div>
              <div class="code">
                <pre
                  dangerouslySetInnerHTML={{
                    __html: `
HTTP POST /api/execute HTTP/<span class="code-int">1.1</span>
<span class="code-key">X-Pesto-Token</span>: &lt;token&gt;
<span class="code-key">Content-Type</span>: application/json
<span class="code-key">Accept</span>: application/json

<span class="code-brace">{</span>
  <span class="code-key">"language"</span>: <span class="code-string">"Python"</span>,
  <span class="code-key">"version"</span>: <span class="code-string">"3.10.2"</span>,
  <span class="code-key">"code"</span>: <span class="code-string">"print('Hello World')"</span>
<span class="code-brace">}</span>
`,
                  }}
                >
                </pre>
              </div>
            </div>
            <div class="example-item">
              <div class="example-label">Response</div>
              <div class="code">
                <pre
                  dangerouslySetInnerHTML={{
                    __html: `
<span class="code-brace">{</span>
  <span class="code-key">"language"</span>: <span class="code-string">"Python"</span>,
  <span class="code-key">"version"</span>: <span class="code-string">"3.10.2"</span>,
  <span class="code-key">"compile"</span>: {
    <span class="code-key">"stdout"</span>: <span class="code-string">""</span>,
    <span class="code-key">"stderr"</span>: <span class="code-string">""</span>
    <span class="code-key">"output"</span>: <span class="code-string">""</span>
    <span class="code-key">"exitCode"</span>: <span class="code-int">0</span>
  <span class="code-brace">}</span>,
  <span class="code-key">"runtime"</span>: {
    <span class="code-key">"stdout"</span>: <span class="code-string">"Hello World"</span>,
    <span class="code-key">"stderr"</span>: <span class="code-string">""</span>
    <span class="code-key">"output"</span>: <span class="code-string">"Hello World"</span>
    <span class="code-key">"exitCode"</span>: <span class="code-int">0</span>
  <span class="code-brace">}</span>,
<span class="code-brace">}</span>
`,
                  }}
                >
                </pre>
              </div>
            </div>
          </div>
        </GuideSection>
      </Section>
      <Section title="List of available runtimes">
        <p>The Pesto REST API currently supports the following runtimes:</p>
        <FieldList
          items={[
            { key: "Python", value: "v3.10.2" },
            { key: "Java", value: "v11 in GraalVM Community v22.1.0" },
            { key: "C/C++", value: " GCC v9.3.0" },
            { key: "Javascript", value: "Node v16.15.0" },
            { key: "PHP", value: "v8.1" },
            { key: "Brainfuck", value: "v2.7.3" },
            { key: "Ruby", value: "v3.1.2" },
          ]}
        />
        <p>More runtimes will be supported in the future.</p>
      </Section>
      <Section title="Request an API key" id="request">
        <p>
          You can request an API key which you can then use to execute your code via a REST API call using this form.
        </p>
        <Form />
      </Section>
    </Layout>
  );
}
