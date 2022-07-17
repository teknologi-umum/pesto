import polka from "polka";
import sirv from "sirv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import console from "node:console";
import { readFile } from "node:fs/promises";

const port = process.env.PORT || 3000;
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "dist");
const notFoundPage = await readFile(path.resolve(dist, "404.html"));
const errorPage = await readFile(path.resolve(dist, "500.html"));

const app = polka({
	onError: (error, _, res) => {
		res.setHeader("Content-Type", "text/html").end(errorPage.toString().replace("@ERROR_MESSAGE", error.message));
	},
	onNoMatch: (_, res) => res.setHeader("Content-Type", "text/html").end(notFoundPage),
});

app.use(
	sirv(dist, {
		etag: true,
		gzip: true,
		brotli: true,
		maxAge: "7d",
		onNoMatch: (req, res) => {},
	})
);

app.listen(port);
console.info(`Listening on port ${port}`);
