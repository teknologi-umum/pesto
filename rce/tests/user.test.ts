import { test, expect } from "vitest";
import { SystemUsers } from "../src/user/user.js";

test("should acquire a user", () => {
  const users = new SystemUsers(1, 10, 1);

  const user = users.acquire();

  expect(user).toBeTruthy();
});

test("should throw an error for invalid user range", () => {
  expect(
    () => {
      new SystemUsers(10, 5, 0);
    })
      .toThrowError(new TypeError("Invalid user range"));
});

test("should return null when everything maxed out", () => {
  const users = new SystemUsers(1, 2, 1);

  const userState1 = users.acquire();
  const userState2 = users.acquire();
  const userState3 = users.acquire();

  expect(userState1).not.toEqual(null);
  expect(userState2).not.toEqual(null);
  expect(userState3).toEqual(null);
});

test("should be able to release a user", () => {
  const users = new SystemUsers(1, 2, 1);

  const userState1 = users.acquire();
  const userState2 = users.acquire();

  expect(userState1).not.toBeNull();
  expect(userState2).not.toBeNull();

  if (userState1 !== null && userState2 !== null) {
    users.release(userState1.uid);
    const userStat1 = users.users.find(u => u.uid === userState1.uid);
    expect(userStat1?.free).toStrictEqual(true);

    const userStat2 = users.users.find(u => u.uid === userState2.uid);
    expect(userStat2?.free).toStrictEqual(false);
  }
});
