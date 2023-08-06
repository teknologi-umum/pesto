import {it, describe} from "node:test";
import assert from "node:assert";
import {PestoClient} from "@teknologi-umum/pesto";

const pestoClient = new PestoClient({
    baseURL: process.env.PESTO_URL,
    token: "DOGFOOD"
});

describe("SQLite3", {concurrency: true}, () => {
    // Taken from https://github.com/zenware/FizzBuzz/blob/82f7cbba2a38109e14311e217ccd2d6cbf9b8651/sqlite3.sql
    it("FizzBuzz", async () => {
        const code = `SELECT COALESCE(fizz || buzz, fizz, buzz,
                                      CAST(n AS CHAR(8))) AS fizzbuzz
                      FROM (SELECT n0 + 3 * n3 + 9 * n9 + 27 * n27 + 81 * n81 AS n
                            FROM (SELECT 0 AS n0
                                  UNION ALL
                                  SELECT 1
                                  UNION ALL
                                  SELECT 2 AS n0) AS N0,
                                 (SELECT 0 AS n3
                                  UNION ALL
                                  SELECT 1
                                  UNION ALL
                                  SELECT 2 AS n3) AS N3,
                                 (SELECT 0 AS n9
                                  UNION ALL
                                  SELECT 1
                                  UNION ALL
                                  SELECT 2 AS n9) AS N9,
                                 (SELECT 0 AS n27
                                  UNION ALL
                                  SELECT 1
                                  UNION ALL
                                  SELECT 2 AS n27) AS N27,
                                 (SELECT 0 AS n81 UNION ALL SELECT 1 AS n81) AS N81) AS N
                               LEFT OUTER JOIN
                           (SELECT 3 AS                       fizzstep,
                                   CAST('Fizz' AS CHAR(4)) AS fizz) AS Fizz
                           ON n % fizzstep = 0
          LEFT OUTER JOIN
            (SELECT 5 AS buzzstep, CAST('Buzz' AS CHAR(4)) AS buzz) AS Buzz
                      ON n % buzzstep = 0
                      WHERE n BETWEEN 1 AND 100
                      ORDER BY n;`;

        const codeOutput = await pestoClient.execute({
            language: "SQLite3",
            version: "latest",
            code: code
        });

        const expectedOutput = "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz\n31\n32\nFizz\n34\nBuzz\nFizz\n37\n38\nFizz\nBuzz\n41\nFizz\n43\n44\nFizzBuzz\n46\n47\nFizz\n49\nBuzz\nFizz\n52\n53\nFizz\nBuzz\n56\nFizz\n58\n59\nFizzBuzz\n61\n62\nFizz\n64\nBuzz\nFizz\n67\n68\nFizz\nBuzz\n71\nFizz\n73\n74\nFizzBuzz\n76\n77\nFizz\n79\nBuzz\nFizz\n82\n83\nFizz\nBuzz\n86\nFizz\n88\n89\nFizzBuzz\n91\n92\nFizz\n94\nBuzz\nFizz\n97\n98\nFizz\nBuzz";

        assert.strictEqual(codeOutput.language, "SQLite3");
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
    });
});
