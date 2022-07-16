/** @jsx h */
import { Fragment, h } from "preact";
import { asset, Head } from "$fresh/runtime.ts";
import { AppProps } from "$fresh/server.ts";
import { Seo } from "../components/Seo.tsx";

export default function App(props: AppProps) {
  return (
    <Fragment>
      <Head>
        <Seo
          title="Pesto"
          author="Teknologi Umum, opensource@teknologiumum.com"
          url="https://pesto.teknologiumum.com"
          copyright="Teknologi Umum"
          owner="Teknologi Umum"
          description="A simple Remote Code Execution engine written in Typescript."
          keywords={[
            "pesto",
            "teknologi umum",
            "remote code execution",
            "code",
            "programming",
            "developer",
          ]}
        />

        <link rel="stylesheet" href={asset("/styles/font.css")} />
        <link rel="stylesheet" href={asset("/styles/style.css")} />
      </Head>
      <props.Component />
    </Fragment>
  );
}
