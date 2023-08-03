import {it, describe} from "node:test";
import assert from "node:assert";
import {PestoClient} from "@teknologi-umum/pesto";

const pestoClient = new PestoClient({
    baseURL: process.env.PESTO_URL,
    token: "DOGFOOD"
});

describe("Go", {concurrency: true}, () => {
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
}`;

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
    });

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
    });

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
}`;

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
    a := []int{2, 8, 3, 10, 13, 6, 11, 9, 19, 15, 5, 4, 12, 14, 20, 1, 17, 18, 16, 7}
    heapSort(sort.IntSlice(a))
    for i := 0; i < len(a); i++ {
		fmt.Printf("%d ", a[i])
	}
}`;

        const codeOutput = await pestoClient.execute({
            language: "Go",
            version: "latest",
            code: code
        });

        const expectedOutput = "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20";

        assert.strictEqual(codeOutput.language, "Go");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
    });

    it.skip("Merge sort", async () => {
        const code = `package main

import "fmt"

var a = []int{2, 8, 3, 10, 13, 6, 11, 9, 19, 15, 5, 4, 12, 14, 20, 1, 17, 18, 16, 7}
var s = make([]int, len(a)/2+1) // scratch space for merge step

func main() {
    mergeSort(a)
    for i := 0; i < len(a); i++ {
		fmt.Printf("%d ", a[i])
	}
}

func mergeSort(a []int) {
    if len(a) < 2 {
        return
    }
    mid := len(a) / 2
    mergeSort(a[:mid])
    mergeSort(a[mid:])
    if a[mid-1] <= a[mid] {
        return
    }
    // merge step, with the copy-half optimization
    copy(s, a[:mid])
    l, r := 0, mid
    for i := 0; ; i++ {
        if s[l] <= a[r] {
            a[i] = s[l]
            l++
            if l == mid {
                break
            }
        } else {
            a[i] = a[r]
            r++
            if r == len(a) {
                copy(a[i+1:], s[l:mid])
                break
            }
        }
    }
    return
}`;

        const codeOutput = await pestoClient.execute({
            language: "Go",
            version: "latest",
            code: code
        });

        const expectedOutput = "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20";

        assert.strictEqual(codeOutput.language, "Go");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
    });

    it.skip("99 Bottles", async () => {
        const code = `package main

import "fmt"

func main() {
    bottles := func(i int) string {
        switch i {
        case 0:
            return "No more bottles"
        case 1:
            return "1 bottle"
        default:
            return fmt.Sprintf("%d bottles", i)
        }
    }

    for i := 99; i > 0; i-- {
        fmt.Printf("%s of beer on the wall, ", bottles(i))
        fmt.Printf("%s of beer.\\n", bottles(i))
        fmt.Printf("Take one down, pass it around,")
        fmt.Printf("%s of beer on the wall\\n\\n", bottles(i-1))
    }
}`;

        const codeOutput = await pestoClient.execute({
            language: "Go",
            version: "latest",
            code: code
        });

        const expectedOutput = "99 bottles of beer on the wall, 99 bottles of beer.\nTake one down, pass it around, 98 bottles of beer on the wall\n\n98 bottles of beer on the wall, 98 bottles of beer.\nTake one down, pass it around, 97 bottles of beer on the wall\n\n97 bottles of beer on the wall, 97 bottles of beer.\nTake one down, pass it around, 96 bottles of beer on the wall\n\n96 bottles of beer on the wall, 96 bottles of beer.\nTake one down, pass it around, 95 bottles of beer on the wall\n\n95 bottles of beer on the wall, 95 bottles of beer.\nTake one down, pass it around, 94 bottles of beer on the wall\n\n94 bottles of beer on the wall, 94 bottles of beer.\nTake one down, pass it around, 93 bottles of beer on the wall\n\n93 bottles of beer on the wall, 93 bottles of beer.\nTake one down, pass it around, 92 bottles of beer on the wall\n\n92 bottles of beer on the wall, 92 bottles of beer.\nTake one down, pass it around, 91 bottles of beer on the wall\n\n91 bottles of beer on the wall, 91 bottles of beer.\nTake one down, pass it around, 90 bottles of beer on the wall\n\n90 bottles of beer on the wall, 90 bottles of beer.\nTake one down, pass it around, 89 bottles of beer on the wall\n\n89 bottles of beer on the wall, 89 bottles of beer.\nTake one down, pass it around, 88 bottles of beer on the wall\n\n88 bottles of beer on the wall, 88 bottles of beer.\nTake one down, pass it around, 87 bottles of beer on the wall\n\n87 bottles of beer on the wall, 87 bottles of beer.\nTake one down, pass it around, 86 bottles of beer on the wall\n\n86 bottles of beer on the wall, 86 bottles of beer.\nTake one down, pass it around, 85 bottles of beer on the wall\n\n85 bottles of beer on the wall, 85 bottles of beer.\nTake one down, pass it around, 84 bottles of beer on the wall\n\n84 bottles of beer on the wall, 84 bottles of beer.\nTake one down, pass it around, 83 bottles of beer on the wall\n\n83 bottles of beer on the wall, 83 bottles of beer.\nTake one down, pass it around, 82 bottles of beer on the wall\n\n82 bottles of beer on the wall, 82 bottles of beer.\nTake one down, pass it around, 81 bottles of beer on the wall\n\n81 bottles of beer on the wall, 81 bottles of beer.\nTake one down, pass it around, 80 bottles of beer on the wall\n\n80 bottles of beer on the wall, 80 bottles of beer.\nTake one down, pass it around, 79 bottles of beer on the wall\n\n79 bottles of beer on the wall, 79 bottles of beer.\nTake one down, pass it around, 78 bottles of beer on the wall\n\n78 bottles of beer on the wall, 78 bottles of beer.\nTake one down, pass it around, 77 bottles of beer on the wall\n\n77 bottles of beer on the wall, 77 bottles of beer.\nTake one down, pass it around, 76 bottles of beer on the wall\n\n76 bottles of beer on the wall, 76 bottles of beer.\nTake one down, pass it around, 75 bottles of beer on the wall\n\n75 bottles of beer on the wall, 75 bottles of beer.\nTake one down, pass it around, 74 bottles of beer on the wall\n\n74 bottles of beer on the wall, 74 bottles of beer.\nTake one down, pass it around, 73 bottles of beer on the wall\n\n73 bottles of beer on the wall, 73 bottles of beer.\nTake one down, pass it around, 72 bottles of beer on the wall\n\n72 bottles of beer on the wall, 72 bottles of beer.\nTake one down, pass it around, 71 bottles of beer on the wall\n\n71 bottles of beer on the wall, 71 bottles of beer.\nTake one down, pass it around, 70 bottles of beer on the wall\n\n70 bottles of beer on the wall, 70 bottles of beer.\nTake one down, pass it around, 69 bottles of beer on the wall\n\n69 bottles of beer on the wall, 69 bottles of beer.\nTake one down, pass it around, 68 bottles of beer on the wall\n\n68 bottles of beer on the wall, 68 bottles of beer.\nTake one down, pass it around, 67 bottles of beer on the wall\n\n67 bottles of beer on the wall, 67 bottles of beer.\nTake one down, pass it around, 66 bottles of beer on the wall\n\n66 bottles of beer on the wall, 66 bottles of beer.\nTake one down, pass it around, 65 bottles of beer on the wall\n\n65 bottles of beer on the wall, 65 bottles of beer.\nTake one down, pass it around, 64 bottles of beer on the wall\n\n64 bottles of beer on the wall, 64 bottles of beer.\nTake one down, pass it around, 63 bottles of beer on the wall\n\n63 bottles of beer on the wall, 63 bottles of beer.\nTake one down, pass it around, 62 bottles of beer on the wall\n\n62 bottles of beer on the wall, 62 bottles of beer.\nTake one down, pass it around, 61 bottles of beer on the wall\n\n61 bottles of beer on the wall, 61 bottles of beer.\nTake one down, pass it around, 60 bottles of beer on the wall\n\n60 bottles of beer on the wall, 60 bottles of beer.\nTake one down, pass it around, 59 bottles of beer on the wall\n\n59 bottles of beer on the wall, 59 bottles of beer.\nTake one down, pass it around, 58 bottles of beer on the wall\n\n58 bottles of beer on the wall, 58 bottles of beer.\nTake one down, pass it around, 57 bottles of beer on the wall\n\n57 bottles of beer on the wall, 57 bottles of beer.\nTake one down, pass it around, 56 bottles of beer on the wall\n\n56 bottles of beer on the wall, 56 bottles of beer.\nTak";

        assert.strictEqual(codeOutput.language, "Go");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
    });

    it.skip("Factorial", async () => {
        const code = `package main

import (
    "fmt"
    "math/big"
)

func main() {
    fmt.Println(factorial(10))
}

func factorial(n int64) *big.Int {
    if n < 0 {
        return nil
    }
    r := big.NewInt(1)
    var f big.Int
    for i := int64(2); i <= n; i++ {
        r.Mul(r, f.SetInt64(i))
    }
    return r
}`;

        const codeOutput = await pestoClient.execute({
            language: "Go",
            version: "latest",
            code: code
        });

        const expectedOutput = "3628800";

        assert.strictEqual(codeOutput.language, "Go");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
    });
});
