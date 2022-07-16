/** @jsx h */
import { h } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export default function BackToTop() {
  return (
    <div
      class="footer-back-to-top"
      onClick={() => (IS_BROWSER ? window.scrollTo(0, 0) : void 0)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        role="img"
        class="iconify iconify--fluent chevron-up"
        width="32"
        height="32"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 16 16"
      >
        <path
          fill="currentColor"
          d="M3.2 10.26a.75.75 0 0 0 1.06.04L8 6.773l3.74 3.527a.75.75 0 1 0 1.02-1.1l-4.25-4a.75.75 0 0 0-1.02 0l-4.25 4a.75.75 0 0 0-.04 1.06Z"
        >
        </path>
      </svg>
    </div>
  );
}
