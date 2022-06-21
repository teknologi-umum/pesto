import { test } from "uvu";
import * as assert from "uvu/assert";
import { Runtime } from "../src/runtime/runtime";

test("should throw error on invalid runtime parameters", () => {
  assert.throws(
    () => {
      new Runtime("", "", "", true, [], [], [], {});
    },
    "Invalid runtime parameters"
  );
});

test("should throw error on invalid buildCommand parameters whilist being a compiled runtime", () => {
  assert.throws(
    () => {
      new Runtime("Maven", "1.0.0", ".xml", true, [], ["mvn", "war:explode"], ["mvn"], {});
    },
    "Invalid runtime parameters: buildCommand is empty yet compiled is true"
  );
});

test.run();
