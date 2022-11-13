import test from "ava";
import { Runtime } from "../src/runtime/runtime.js";

test("should throw error on invalid runtime parameters", (t) => {
  t.throws(
    () => {
      new Runtime("", "", "", true, [], [], [], {}, false, 0, 0, -1);
    },
    {
      instanceOf: TypeError,
      message: "Invalid runtime parameters"
    }
  );
});

test("should throw error on invalid buildCommand parameters whilist being a compiled runtime", (t) => {
  t.throws(
    () => {
      new Runtime("Maven", "1.0.0", ".xml", true, [], ["mvn", "war:explode"], ["mvn"], { "JAVA_HOME": "/usr/lib/jvm/java-8-openjdk-amd64", "PATH": "/usr/local/bin:/usr/bin:/bin" }, false, 0, 0, 1);
    },
    {
      instanceOf: TypeError,
      message: "Invalid runtime parameters: buildCommand is empty yet compiled is true"
    }
  );
});

test("should throw error on invalid memoryLimit parameters", (t) => {
  t.throws(
    () => {
      new Runtime("C", "11", "c", true, ["gcc", "./a.out"], ["./a.out"], ["c"], { "PATH": "/usr/local/bin:/usr/bin:/bin" }, true, -1, 0, 1);
    }
  );
});

test("should throw error on invalid processLimit parameters", (t) => {
  t.throws(
    () => {
      new Runtime("C", "11", "c", true, ["gcc", "./a.out"], ["./a.out"], ["c"], { "PATH": "/usr/local/bin:/usr/bin:/bin" }, true, 256, -1, 1);
    }
  );
});
