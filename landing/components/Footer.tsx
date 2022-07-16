/** @jsx h */
import { h } from "preact";
import BackToTop from "~/islands/BackToTop.tsx";

export function Footer() {
  return (
    <footer class="footer">
      <BackToTop />
      <div class="footer-content">
        <p>
          Pesto is a project by{" "}
          <a class="url" href="https://github.com/teknologi-umum">
            Teknologi Umum
          </a>
        </p>
        <p>
          Interested on contributing? Check out the{" "}
          <a class="url" href="https://github.com/teknologi-umum/pesto">
            GitHub repository
          </a>
        </p>
      </div>
    </footer>
  );
}
