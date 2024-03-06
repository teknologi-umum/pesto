import { test, expect } from "vitest";
import { Files } from "../src/job/files.js";

test("should be able to create a Files class with empty fileNames", () => {
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

  expect(files.files.length).toStrictEqual(3);
  for (let i = 0; i < files.files.length; i++) {
    expect(files.files[i].fileName).toStrictEqual(`code${i}.sh`);
  }
});

test("should be able to create a Files class with normal parameters", () => {
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

  expect(files.files.length).toStrictEqual(3);
  for (let i = 0; i < files.files.length; i++) {
    expect(files.files[i].fileName).toStrictEqual(`code${i+1}.bash`);
  }
});
