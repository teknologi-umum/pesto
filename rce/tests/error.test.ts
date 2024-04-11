import { ClientError, ServerError } from "../src/Error";
import { expect, test } from "vitest";

test("ServerError", () => {
  const serverError = new ServerError("Unexpected input");
  expect(serverError).toBeInstanceOf(Error);
  expect(serverError.message).toStrictEqual("Unexpected input");
  expect(serverError.reason).toStrictEqual("Unexpected input");
  expect(serverError.name).toStrictEqual("ServerError");
});

test("ClientError", () => {
  const clientError = new ClientError("Unexpected input", 403);
  expect(clientError).toBeInstanceOf(Error);
  expect(clientError.message).toStrictEqual("Unexpected input");
  expect(clientError.reason).toStrictEqual("Unexpected input");
  expect(clientError.name).toStrictEqual("ClientError");
  expect(clientError.code).toStrictEqual(403);
});
