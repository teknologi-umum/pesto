import test from "ava";
import {SystemUsers} from "../src/user/user.js";

test("should acquire a user", (t) => {
    const users = new SystemUsers(1, 10, 1);

    const user = users.acquire();

    if (user === null) {
        t.fail("User not acquired");
    }

    t.pass();
});

test("should throw an error for invalid user range", (t) => {
    t.throws(
        () => {
            new SystemUsers(10, 5, 0);
        },
        {
            instanceOf: TypeError,
            message: "Invalid user range"
        }
    );
});

test("should return null when everything maxed out", (t) => {
    const users = new SystemUsers(1, 2, 1);

    const userState1 = users.acquire();
    const userState2 = users.acquire();
    const userState3 = users.acquire();

    t.assert(userState1 !== null);
    t.assert(userState2 !== null);
    t.assert(userState3 === null);
});

test("should be able to release a user", (t) => {
    const users = new SystemUsers(1, 2, 1);

    const userState1 = users.acquire();
    const userState2 = users.acquire();

    if (userState1 !== null && userState2 !== null) {
        users.release(userState1.uid);
        const userStat1 = users.users.find(u => u.uid === userState1.uid);
        t.assert(userStat1 !== undefined && userStat1.free === true);

        const userStat2 = users.users.find(u => u.uid === userState2.uid);
        t.assert(userStat2 !== undefined && userStat2.free === false);
    } else {
        t.fail("User not acquired");
    }
});
