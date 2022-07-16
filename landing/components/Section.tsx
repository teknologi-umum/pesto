/** @jsx h */
import { type ComponentChildren, h } from "preact";

type SectionProps = {
  title: string;
  id?: string;
  children: ComponentChildren;
};

export function Section(props: SectionProps) {
  return (
    <div class="section" id={props.id ?? ""}>
      <h1 class="heading">{props.title}</h1>
      <div class="content">{props.children}</div>
    </div>
  );
}
