/** @jsx h */
import { ComponentChildren, h } from "preact";

type ButtonLinkProps = {
  children: ComponentChildren;
  href: string;
  variant: "green" | "yellow-green";
};

export function ButtonLink(props: ButtonLinkProps) {
  return (
    <a class={`button ${props.variant}`} href={props.href}>
      {props.children}
    </a>
  );
}
