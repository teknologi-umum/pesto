/** @jsx h */
import { Fragment, h } from "preact";

type SeoProps = {
  title: string;
  keywords: string[];
  description: string;
  copyright: string;
  author: string;
  owner: string;
  url: string;
};

export function Seo(props: SeoProps) {
  return (
    <Fragment>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="language" content="en-US" />
      <meta name="robots" content="index,follow" />
      <meta name="copyright" content={props.copyright} />
      <meta name="keywords" content={props.keywords.join(", ")} />
      <meta name="description" content={props.description} />
      <meta name="subject" content={props.description} />
      <meta name="summary" content={props.description} />
      <meta name="author" content={props.author} />
      <meta name="owner" content={props.owner} />

      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/meta/apple-touch-icon.png"
      />
      <link rel="icon" type="image/x-icon" href="/meta/favicon.ico" />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/meta/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/meta/favicon-16x16.png"
      />
      <link rel="manifest" href="/meta/site.webmanifest" />
      <link rel="stylesheet" href="/styles/font.css" />
      <link rel="stylesheet" href="/styles/style.css" />

      <meta property="og:title" content={props.title} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={props.url} />
      <meta property="og:image" content={`${props.url}/thumbnail.png`} />
      <meta
        property="og:image:secure:url"
        content={`${props.url}/thumbnail.png`}
      />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={props.url} />
      <meta name="twitter:creator" content={props.owner} />
      <meta name="twitter:title" content={props.title} />
      <meta name="twitter:description" content={props.description} />
      <meta name="twitter:image" content={`${props.url}/thumbnail.png`} />

      <title>{props.title}</title>
    </Fragment>
  );
}
