import { test } from "uvu";
import * as assert from "uvu/assert";
import { SystemUsers } from "../src/user/user";

test("should acquire a user", () => {
  const users = new SystemUsers(1, 10, 1);

  const user = users.acquire();

  assert.is.not(user, null);
});

test("should throw an error for invalid user range", () => {
  assert.throws(
    () => {
      new SystemUsers(10, 5, 0);
    },
    "Invalid user range"
  );
});

test("should return null when everything maxed out", () => {
  const users = new SystemUsers(1, 2, 1);

  const userState1 = users.acquire();
  const userState2 = users.acquire();
  const userState3 = users.acquire();

  assert.not.equal(userState1, null);
  assert.not.equal(userState2, null);
  assert.equal(userState3, null);
});

test("should be able to release a user", () => {
  const users = new SystemUsers(1, 2, 1);

  const userState1 = users.acquire();
  const userState2 = users.acquire();

  if (userState1 !== null && userState2 !== null) {
    users.release(userState1.uid);
    const userStat1 = users.users.find(u => u.uid === userState1.uid);
    assert.equal(userStat1?.free, true);

    const userStat2 = users.users.find(u => u.uid === userState2.uid);
    assert.equal(userStat2?.free, false);
  }
});

test.run();
