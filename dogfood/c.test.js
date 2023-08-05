import {it, describe} from "node:test";
import assert from "node:assert";
import {PestoClient} from "@teknologi-umum/pesto";

const pestoClient = new PestoClient({
    baseURL: process.env.PESTO_URL,
    token: "DOGFOOD"
});

describe("C", {concurrency: true}, () => {
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
            code
        });

        const expectedOutput = "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz\n31\n32\nFizz\n34\nBuzz\nFizz\n37\n38\nFizz\nBuzz\n41\nFizz\n43\n44\nFizzBuzz\n46\n47\nFizz\n49\nBuzz\nFizz\n52\n53\nFizz\nBuzz\n56\nFizz\n58\n59\nFizzBuzz\n61\n62\nFizz\n64\nBuzz\nFizz\n67\n68\nFizz\nBuzz\n71\nFizz\n73\n74\nFizzBuzz\n76\n77\nFizz\n79\nBuzz\nFizz\n82\n83\nFizz\nBuzz\n86\nFizz\n88\n89\nFizzBuzz\n91\n92\nFizz\n94\nBuzz\nFizz\n97\n98\nFizz\nBuzz";

        assert.strictEqual(codeOutput.language, "C");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
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
    int a[] = {2, 8, 3, 10, 13, 6, 11, 9, 19, 15, 5, 4, 12, 14, 20, 1, 17, 18, 16, 7};
    int n = sizeof a / sizeof a[0];
    int i;
    merge_sort(a, n);
    for (i = 0; i < n; i++)
        printf("%d%s", a[i], i == n - 1 ? "\\n" : " ");
    return 0;
}`;

        const codeOutput = await pestoClient.execute({
            language: "C",
            version: "latest",
            code: code
        });

        const expectedOutput = "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20";

        assert.strictEqual(codeOutput.language, "C");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
    });

    it("Heap Sort", async () => {
        const code = `#include <stdio.h>

int max (int *a, int n, int i, int j, int k) {
    int m = i;
    if (j < n && a[j] > a[m]) {
        m = j;
    }
    if (k < n && a[k] > a[m]) {
        m = k;
    }
    return m;
}

void downheap (int *a, int n, int i) {
    while (1) {
        int j = max(a, n, i, 2 * i + 1, 2 * i + 2);
        if (j == i) {
            break;
        }
        int t = a[i];
        a[i] = a[j];
        a[j] = t;
        i = j;
    }
}

void heapsort (int *a, int n) {
    int i;
    for (i = (n - 2) / 2; i >= 0; i--) {
        downheap(a, n, i);
    }
    for (i = 0; i < n; i++) {
        int t = a[n - i - 1];
        a[n - i - 1] = a[0];
        a[0] = t;
        downheap(a, n - i - 1, 0);
    }
}

int main () {
    int a[] = {2, 8, 3, 10, 13, 6, 11, 9, 19, 15, 5, 4, 12, 14, 20, 1, 17, 18, 16, 7};
    int n = sizeof a / sizeof a[0];
    int i;
    heapsort(a, n);
    for (i = 0; i < n; i++)
        printf("%d%s", a[i], i == n - 1 ? "\\n" : " ");
    return 0;
}`;

        const codeOutput = await pestoClient.execute({
            language: "C",
            version: "latest",
            code: code
        });

        const expectedOutput = "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20";

        assert.strictEqual(codeOutput.language, "C");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
    });

    it("Sieve of Erastosthenes", async () => {
        const code = `#include <stdio.h>
#include <string.h>
#include <math.h>
#include <errno.h>
#include <stdlib.h>

#define true (1)
#define false (0)
typedef unsigned char bool;

#define MAX 10000000

/* to_int: converts a character array to an integer, returns -1 on error, -2 on out of limits */
int to_int(char* inp) {
    int len = strlen(inp);
    unsigned int out = 0, prev_out = 0, mult = 1;

    if (len == 0) {
        return -1;
    }

    for (int i = len - 1; i >= 0; i--) {
        if (inp[i] < 48 || inp[i] > 57) {
            return -1;
        }

        prev_out = out;
        out += (inp[i] - 48) * mult;
        mult *= 10;

        /* detect wrapping */
        if (out < prev_out) {
            return -2;
        }
    }

    return out;
}

int main() {
    int max = 100;

    /* Set up the list */
    bool *list = NULL;
    if ((list = malloc(max)) == NULL) {
        fprintf(stderr, "Error! Could not allocate the requested amount of memory: %s\\nExiting...\\n", strerror(errno));
        return EXIT_FAILURE;
    }

    memset(list, true, max);

    int iteration = 0;
    int max_sqrt = sqrt(max);

    for (int i = 2; i <= max_sqrt; i++) {
        if (list[i]) {
            for (int j = i*i; j <= max; j += i) {
                list[j] = false;
            }
        }
    }

    for (int i = 1; i < max; i++) {
        if (list[i]) {
            printf("%d ", i);
        }
    }

    free(list);

    return 0;
}`;

        const codeOutput = await pestoClient.execute({
            language: "C",
            version: "latest",
            code: code
        });

        const expectedOutput = "2 3 5 7 11 13 17 19 23 29 31 37 41 43 47 53 59 61 67 71 73 79 83 89 97";

        assert.strictEqual(codeOutput.language, "C");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
    });

    it("99 Bottles", async () => {
        const code = `#include <stdio.h>

int main(void)
{
  int n;

  for(n = 99; n > 0; n--) {
    printf(
      "%d bottles of beer on the wall, %d bottles of beer.\\n"
      "Take one down, pass it around, %d bottles of beer on the wall\\n\\n",
      n, n, n - 1);
  }

  return 0;
}`;

        const codeOutput = await pestoClient.execute({
            language: "C",
            version: "latest",
            code: code
        });

        const expectedOutput = "99 bottles of beer on the wall, 99 bottles of beer.\nTake one down, pass it around, 98 bottles of beer on the wall\n\n98 bottles of beer on the wall, 98 bottles of beer.\nTake one down, pass it around, 97 bottles of beer on the wall\n\n97 bottles of beer on the wall, 97 bottles of beer.\nTake one down, pass it around, 96 bottles of beer on the wall\n\n96 bottles of beer on the wall, 96 bottles of beer.\nTake one down, pass it around, 95 bottles of beer on the wall\n\n95 bottles of beer on the wall, 95 bottles of beer.\nTake one down, pass it around, 94 bottles of beer on the wall\n\n94 bottles of beer on the wall, 94 bottles of beer.\nTake one down, pass it around, 93 bottles of beer on the wall\n\n93 bottles of beer on the wall, 93 bottles of beer.\nTake one down, pass it around, 92 bottles of beer on the wall\n\n92 bottles of beer on the wall, 92 bottles of beer.\nTake one down, pass it around, 91 bottles of beer on the wall\n\n91 bottles of beer on the wall, 91 bottles of beer.\nTake one down, pass it around, 90 bottles of beer on the wall\n\n90 bottles of beer on the wall, 90 bottles of beer.\nTake one down, pass it around, 89 bottles of beer on the wall\n\n89 bottles of beer on the wall, 89 bottles of beer.\nTake one down, pass it around, 88 bottles of beer on the wall\n\n88 bottles of beer on the wall, 88 bottles of beer.\nTake one down, pass it around, 87 bottles of beer on the wall\n\n87 bottles of beer on the wall, 87 bottles of beer.\nTake one down, pass it around, 86 bottles of beer on the wall\n\n86 bottles of beer on the wall, 86 bottles of beer.\nTake one down, pass it around, 85 bottles of beer on the wall\n\n85 bottles of beer on the wall, 85 bottles of beer.\nTake one down, pass it around, 84 bottles of beer on the wall\n\n84 bottles of beer on the wall, 84 bottles of beer.\nTake one down, pass it around, 83 bottles of beer on the wall\n\n83 bottles of beer on the wall, 83 bottles of beer.\nTake one down, pass it around, 82 bottles of beer on the wall\n\n82 bottles of beer on the wall, 82 bottles of beer.\nTake one down, pass it around, 81 bottles of beer on the wall\n\n81 bottles of beer on the wall, 81 bottles of beer.\nTake one down, pass it around, 80 bottles of beer on the wall\n\n80 bottles of beer on the wall, 80 bottles of beer.\nTake one down, pass it around, 79 bottles of beer on the wall\n\n79 bottles of beer on the wall, 79 bottles of beer.\nTake one down, pass it around, 78 bottles of beer on the wall\n\n78 bottles of beer on the wall, 78 bottles of beer.\nTake one down, pass it around, 77 bottles of beer on the wall\n\n77 bottles of beer on the wall, 77 bottles of beer.\nTake one down, pass it around, 76 bottles of beer on the wall\n\n76 bottles of beer on the wall, 76 bottles of beer.\nTake one down, pass it around, 75 bottles of beer on the wall\n\n75 bottles of beer on the wall, 75 bottles of beer.\nTake one down, pass it around, 74 bottles of beer on the wall\n\n74 bottles of beer on the wall, 74 bottles of beer.\nTake one down, pass it around, 73 bottles of beer on the wall\n\n73 bottles of beer on the wall, 73 bottles of beer.\nTake one down, pass it around, 72 bottles of beer on the wall\n\n72 bottles of beer on the wall, 72 bottles of beer.\nTake one down, pass it around, 71 bottles of beer on the wall\n\n71 bottles of beer on the wall, 71 bottles of beer.\nTake one down, pass it around, 70 bottles of beer on the wall\n\n70 bottles of beer on the wall, 70 bottles of beer.\nTake one down, pass it around, 69 bottles of beer on the wall\n\n69 bottles of beer on the wall, 69 bottles of beer.\nTake one down, pass it around, 68 bottles of beer on the wall\n\n68 bottles of beer on the wall, 68 bottles of beer.\nTake one down, pass it around, 67 bottles of beer on the wall\n\n67 bottles of beer on the wall, 67 bottles of beer.\nTake one down, pass it around, 66 bottles of beer on the wall\n\n66 bottles of beer on the wall, 66 bottles of beer.\nTake one down, pass it around, 65 bottles of beer on the wall\n\n65 bottles of beer on the wall, 65 bottles of beer.\nTake one down, pass it around, 64 bottles of beer on the wall\n\n64 bottles of beer on the wall, 64 bottles of beer.\nTake one down, pass it around, 63 bottles of beer on the wall\n\n63 bottles of beer on the wall, 63 bottles of beer.\nTake one down, pass it around, 62 bottles of beer on the wall\n\n62 bottles of beer on the wall, 62 bottles of beer.\nTake one down, pass it around, 61 bottles of beer on the wall\n\n61 bottles of beer on the wall, 61 bottles of beer.\nTake one down, pass it around, 60 bottles of beer on the wall\n\n60 bottles of beer on the wall, 60 bottles of beer.\nTake one down, pass it around, 59 bottles of beer on the wall\n\n59 bottles of beer on the wall, 59 bottles of beer.\nTake one down, pass it around, 58 bottles of beer on the wall\n\n58 bottles of beer on the wall, 58 bottles of beer.\nTake one down, pass it around, 57 bottles of beer on the wall\n\n57 bottles of beer on the wall, 57 bottles of beer.\nTake one down, pass it around, 56 bottles of beer on the wall\n\n56 bottles of beer on the wall, 56 bottles of beer.\nTak";

        assert.strictEqual(codeOutput.language, "C");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
    });

    it("Factorial", async () => {
        const code = `#include <stdio.h>

int factorial(int n) {
    int result = 1;
    for (int i = 1; i <= n; ++i)
        result *= i;
    return result;
}

int main(void)
{
  printf("%d", factorial(10));

  return 0;
}`;

        const codeOutput = await pestoClient.execute({
            language: "C",
            version: "latest",
            code: code
        });

        const expectedOutput = "3628800";

        assert.strictEqual(codeOutput.language, "C");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
    });
});
