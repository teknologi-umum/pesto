/** @jsx h */
import { h } from "preact";
import { UnknownPageProps } from "$fresh/server.ts";
import { Logo } from "~/components/Logo.tsx";
import { Layout } from "~/components/Layout.tsx";
import { Section } from "~/components/Section.tsx";

export default function NotFoundPage({ url }: UnknownPageProps) {
  return (
    <Layout>
      <Logo />
      <Section title="404">
        <p>
          Path <code class="inline-code">{url.pathname}</code> was not found.
        </p>
        <p>
          If you think this shouldn't happen, you can help us fix this error by sending us a bug report to our{" "}
          <a class="url" href="https://github.com/teknologi-umum/pesto/issues">
            Github Issue
          </a>{" "}
          page.
        </p>
      </Section>
    </Layout>
  );
}
