import {it, describe} from "node:test";
import assert from "node:assert";
import {PestoClient} from "@teknologi-umum/pesto";

const pestoClient = new PestoClient({
    baseURL: process.env.PESTO_URL,
    token: "DOGFOOD"
});

describe("Typescript", { concurrency: true }, () => {
    it("FizzBuzz", async () => {
        const code = `let output: string = '';
    for (let i = 1; i < 101; i += 1) {
        output = '';
        if (!(i % 3)) { output += 'Fizz'; }
        if (!(i % 5)) { output += 'Buzz'; }
        console.log(output || i);
    }`;

        const codeOutput = await pestoClient.execute({
            language: "Typescript",
            version: "latest",
            code: code
        });

        const expectedOutput = "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz\n31\n32\nFizz\n34\nBuzz\nFizz\n37\n38\nFizz\nBuzz\n41\nFizz\n43\n44\nFizzBuzz\n46\n47\nFizz\n49\nBuzz\nFizz\n52\n53\nFizz\nBuzz\n56\nFizz\n58\n59\nFizzBuzz\n61\n62\nFizz\n64\nBuzz\nFizz\n67\n68\nFizz\nBuzz\n71\nFizz\n73\n74\nFizzBuzz\n76\n77\nFizz\n79\nBuzz\nFizz\n82\n83\nFizz\nBuzz\n86\nFizz\n88\n89\nFizzBuzz\n91\n92\nFizz\n94\nBuzz\nFizz\n97\n98\nFizz\nBuzz";

        assert.strictEqual(codeOutput.language, "Typescript");
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
    });

    it("Pancake Numbers", async () => {
        const code = `function pancake(n: number): number {
  let gap = 2;
  let sum = 2;
  let adj = -1;

  while (sum < n) {
    adj++;
    gap = gap * 2 - 1;
    sum += gap;
  }

  return n + adj;
}

for (let i = 0; i < 4; i++) {
  for (let j = 1; j < 6; j++) {
    const n = i * 5 + j;
    console.log(\`p(\${n}) = \${pancake(n)}\`);
  }
}`;

        const codeOutput = await pestoClient.execute({
            language: "Typescript",
            version: "latest",
            code: code
        });

        const expectedOutput = `p(1) = 0
p(2) = 1
p(3) = 3
p(4) = 4
p(5) = 5
p(6) = 7
p(7) = 8
p(8) = 9
p(9) = 10
p(10) = 11
p(11) = 13
p(12) = 14
p(13) = 15
p(14) = 16
p(15) = 17
p(16) = 18
p(17) = 19
p(18) = 20
p(19) = 21
p(20) = 23`;

        assert.strictEqual(codeOutput.language, "Typescript");
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
    });
});
