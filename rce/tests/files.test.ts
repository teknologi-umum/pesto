import { Files } from "../src/job/files";
import test from "ava";

test("should be able to create a Files class with empty fileNames", (t) => {
  const files = new Files([
    {
      fileName: "",
      code: "printf Hello world",
      entrypoint: false
    },
    {
      fileName: "",
      code: "printf Hello world",
      entrypoint: false
    },
    {
      fileName: "",
      code: "printf Hello world",
      entrypoint: false
    }
  ], "sh");

  t.assert(files.files.length === 3);
  for (let i = 0; i < files.files.length; i++) {
    t.assert(files.files[i].fileName === `code${i}.sh`);
  }
});
