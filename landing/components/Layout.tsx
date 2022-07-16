/** @jsx h */
import { ComponentChildren, Fragment, h } from "preact";
import { Footer } from "./Footer.tsx";

type LayoutProps = {
  children: ComponentChildren;
};

export function Layout(props: LayoutProps) {
  return (
    <Fragment>
      <div id="app">{props.children}</div>
      <Footer />
    </Fragment>
  );
}
