/** @jsx h */
import { ComponentChildren, h } from "preact";

type GuideSectionProps = {
  title: string;
  children: ComponentChildren;
};

export function GuideSection(props: GuideSectionProps) {
  return (
    <div class="guide">
      <h2 class="guide-title">{props.title}</h2>
      {props.children}
    </div>
  );
}
