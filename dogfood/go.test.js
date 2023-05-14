import { it, describe } from "node:test";
import assert from "node:assert";
import { PestoClient } from "./pesto-node/index.mjs";

const pestoClient = new PestoClient({ baseURL: process.env.PESTO_URL, token: "DOGFOOD" });

describe("Go", { concurrency: true }, () => {
    it.skip("FizzBuzz", async () => {
        const code = `package main

import (
    "fmt"
)

func fizzbuzz(num int) {
    if num%3 == 0 && num%5 == 0 {
        fmt.Println("FizzBuzz")
    } else if num%5 == 0 {
        fmt.Println("Buzz")
    } else if num%3 == 0 {
        fmt.Println("Fizz")
    } else {
        fmt.Println(num)
    }
}

func main() {
    for i := 1; i < 100; i++ {
        fizzbuzz(i)
    }
}`

        const codeOutput = await pestoClient.execute({
            language: "Go",
            version: "latest",
            code: code
        });

        const expectedOutput = "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz\n31\n32\nFizz\n34\nBuzz\nFizz\n37\n38\nFizz\nBuzz\n41\nFizz\n43\n44\nFizzBuzz\n46\n47\nFizz\n49\nBuzz\nFizz\n52\n53\nFizz\nBuzz\n56\nFizz\n58\n59\nFizzBuzz\n61\n62\nFizz\n64\nBuzz\nFizz\n67\n68\nFizz\nBuzz\n71\nFizz\n73\n74\nFizzBuzz\n76\n77\nFizz\n79\nBuzz\nFizz\n82\n83\nFizz\nBuzz\n86\nFizz\n88\n89\nFizzBuzz\n91\n92\nFizz\n94\nBuzz\nFizz\n97\n98\nFizz\nBuzz";

        assert.strictEqual(codeOutput.language, "Go");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
    })

    it.skip("Cartesian equation", async () => {
        const code = `package main

import "fmt"

type pair [2]int

func cart2(a, b []int) []pair {
    p := make([]pair, len(a)*len(b))
    i := 0
    for _, a := range a {
        for _, b := range b {
            p[i] = pair{a, b}
            i++
        }
    }
    return p
}

func main() {
    fmt.Println(cart2([]int{1, 2}, []int{3, 4}))
    fmt.Println(cart2([]int{3, 4}, []int{1, 2}))
    fmt.Println(cart2([]int{1, 2}, nil))
    fmt.Println(cart2(nil, []int{1, 2}))
}`;

        const codeOutput = await pestoClient.execute({
            language: "Go",
            version: "latest",
            code: code
        });

        const expectedOutput = "[[1 3] [1 4] [2 3] [2 4]]\n[[3 1] [3 2] [4 1] [4 2]]\n[]\n[]";

        assert.strictEqual(codeOutput.language, "Go");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
    })

    it.skip("Erdős-Nicolas numbers", async () => {
        const code = `package main

import "fmt"

func main() {
    const maxNumber = 100000000
    dsum := make([]int, maxNumber+1)
    dcount := make([]int, maxNumber+1)
    for i := 0; i <= maxNumber; i++ {
        dsum[i] = 1
        dcount[i] = 1
    }
    for i := 2; i <= maxNumber; i++ {
        for j := i + i; j <= maxNumber; j += i {
            if dsum[j] == j {
                fmt.Printf("%8d equals the sum of its first %d divisors\n", j, dcount[j])
            }
            dsum[j] += i
            dcount[j]++
        }
    }
}`

        const codeOutput = await pestoClient.execute({
            language: "Go",
            version: "latest",
            code: code
        });

        const expectedOutput = "      24 equals the sum of its first 6 divisors\n    2016 equals the sum of its first 31 divisors\n    8190 equals the sum of its first 43 divisors\n   42336 equals the sum of its first 66 divisors\n   45864 equals the sum of its first 66 divisors\n  714240 equals the sum of its first 113 divisors\n  392448 equals the sum of its first 68 divisors\n 1571328 equals the sum of its first 115 divisors\n61900800 equals the sum of its first 280 divisors\n91963648 equals the sum of its first 142 divisors";

        assert.strictEqual(codeOutput.language, "Go");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
    });

    it.skip("Heap sort", async () => {
        const code = `package main

import (
    "sort"
    "container/heap"
    "fmt"
)

type HeapHelper struct {
    container sort.Interface
    length    int
}

func (self HeapHelper) Len() int { return self.length }
// We want a max-heap, hence reverse the comparison
func (self HeapHelper) Less(i, j int) bool { return self.container.Less(j, i) }
func (self HeapHelper) Swap(i, j int) { self.container.Swap(i, j) }
// this should not be called
func (self *HeapHelper) Push(x interface{}) { panic("impossible") }
func (self *HeapHelper) Pop() interface{} {
    self.length--
    return nil // return value not used
}

func heapSort(a sort.Interface) {
    helper := HeapHelper{ a, a.Len() }
    heap.Init(&helper)
    for helper.length > 0 {
        heap.Pop(&helper)
    }
}

func main() {
    a := []int{170, 45, 75, -90, -802, 24, 2, 66}
    heapSort(sort.IntSlice(a))
    fmt.Println(a)
}`;

        const codeOutput = await pestoClient.execute({
            language: "Go",
            version: "latest",
            code: code
        });

        const expectedOutput = "[-802 -90 2 24 45 66 75 170]"

        assert.strictEqual(codeOutput.language, "Go");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
    });
})