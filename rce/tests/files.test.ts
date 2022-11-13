import { Files } from "../src/job/files.js";
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

test("should be able to create a Files class with normal parameters", (t) => {
  const files = new Files([
    {
      fileName: "code1.bash",
      code: "printf Hello world",
      entrypoint: false
    },
    {
      fileName: "code2.bash",
      code: "printf Hello world",
      entrypoint: false
    },
    {
      fileName: "code3.bash",
      code: "printf Hello world",
      entrypoint: false
    }
  ], "sh");

  t.assert(files.files.length === 3);
  for (let i = 1; i < files.files.length + 1; i++) {
    t.assert(files.files[i].fileName === `code${i}.bash`);
  }
});
