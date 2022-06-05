import test from "ava";
import { Runtime } from "../src/runtime/runtime.js";

test("should throw error on invalid runtime parameters", (t) => {
    t.throws(
        () => {
            new Runtime("", "", "", true, [], [], []);
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
            new Runtime("Maven", "1.0.0", ".xml", true, [], ["mvn", "war:explode"], ["mvn"]);
        },
        {
            instanceOf: TypeError,
            message: "Invalid runtime parameters: buildCommand is empty yet compiled is true"
        }
    );
});
