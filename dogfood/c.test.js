import { it, describe } from "node:test";
import assert from "node:assert";
import { PestoClient } from "./pesto-node/index.mjs";

const pestoClient = new PestoClient({ baseURL: process.env.PESTO_URL, token: "DOGFOOD" });

describe("C", { concurrency: true }, () => {
    it("FizzBuzz", async () => {
        const code = `#include <stdio.h>

void fizzbuzz(int);

int main(void)
{
    for (int i = 1; i <= 100; i++) {
        fizzbuzz(i);
    }

    return 0;
}

void fizzbuzz(int num)
{
    int printed = 0;

    if (num % 3 == 0) {
        printf("Fizz");
        printed = 1;
    }
    if (num % 5 == 0) {
        printf("Buzz");
        printed = 1;
    }

    if (printed) {
        printf("\\n");
    } else {
        printf("%d\\n", num);
    }
}`;

        const codeOutput = await pestoClient.execute({
            language: "C",
            version: "latest",
            code,
        });
    
        const expectedOutput = "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz\n31\n32\nFizz\n34\nBuzz\nFizz\n37\n38\nFizz\nBuzz\n41\nFizz\n43\n44\nFizzBuzz\n46\n47\nFizz\n49\nBuzz\nFizz\n52\n53\nFizz\nBuzz\n56\nFizz\n58\n59\nFizzBuzz\n61\n62\nFizz\n64\nBuzz\nFizz\n67\n68\nFizz\nBuzz\n71\nFizz\n73\n74\nFizzBuzz\n76\n77\nFizz\n79\nBuzz\nFizz\n82\n83\nFizz\nBuzz\n86\nFizz\n88\n89\nFizzBuzz\n91\n92\nFizz\n94\nBuzz\nFizz\n97\n98\nFizz\nBuzz";
    
        assert.strictEqual(codeOutput.language, "C");
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
    });
    

    it("Merge sort", async () => {
        const code = `#include <stdio.h>
#include <stdlib.h>

void merge (int *a, int n, int m) {
    int i, j, k;
    int *x = malloc(n * sizeof (int));
    for (i = 0, j = m, k = 0; k < n; k++) {
        x[k] = j == n      ? a[i++]
                : i == m      ? a[j++]
                : a[j] < a[i] ? a[j++]
                :               a[i++];
    }
    for (i = 0; i < n; i++) {
        a[i] = x[i];
    }
    free(x);
}

void merge_sort (int *a, int n) {
    if (n < 2)
        return;
    int m = n / 2;
    merge_sort(a, m);
    merge_sort(a + m, n - m);
    merge(a, n, m);
}

int main () {
    int a[] = {4, 65, 2, -31, 0, 99, 2, 83, 782, 1};
    int n = sizeof a / sizeof a[0];
    int i;
    for (i = 0; i < n; i++)
        printf("%d%s", a[i], i == n - 1 ? "\\n" : " ");
    merge_sort(a, n);
    for (i = 0; i < n; i++)
        printf("%d%s", a[i], i == n - 1 ? "\\n" : " ");
    return 0;
}`;

        const codeOutput = await pestoClient.execute({
            language: "C",
            version: "latest",
            code: code,
        });

        const expectedOutput = "4 65 2 -31 0 99 2 83 782 1\n-31 0 1 2 2 4 65 83 99 782";

        assert.strictEqual(codeOutput.language, "C");
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
    })
})