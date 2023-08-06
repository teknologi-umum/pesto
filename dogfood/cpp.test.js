import {it, describe} from "node:test";
import assert from "node:assert";
import {PestoClient} from "@teknologi-umum/pesto";

const pestoClient = new PestoClient({
    baseURL: process.env.PESTO_URL,
    token: "DOGFOOD"
});

describe("C++", {concurrency: true}, () => {
    it("FizzBuzz", async () => {
        const code = `#include <iostream>

void fizzbuzz(int);

int main(void)
{
    for (int i = 1; i <= 100; i++) {
        fizzbuzz(i);
    }
}

void fizzbuzz(int num)
{
    if (num % 15 == 0) {
        std::cout << "FizzBuzz" << std::endl;
    } else if (num % 5 == 0) {
        std::cout << "Buzz" << std::endl;
    } else if (num % 3 == 0) {
        std::cout << "Fizz" << std::endl;
    } else {
        std::cout << num << std::endl;
    }
}`;

        const codeOutput = await pestoClient.execute({
            language: "C++",
            version: "latest",
            code
        });

        const expectedOutput = "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz\n31\n32\nFizz\n34\nBuzz\nFizz\n37\n38\nFizz\nBuzz\n41\nFizz\n43\n44\nFizzBuzz\n46\n47\nFizz\n49\nBuzz\nFizz\n52\n53\nFizz\nBuzz\n56\nFizz\n58\n59\nFizzBuzz\n61\n62\nFizz\n64\nBuzz\nFizz\n67\n68\nFizz\nBuzz\n71\nFizz\n73\n74\nFizzBuzz\n76\n77\nFizz\n79\nBuzz\nFizz\n82\n83\nFizz\nBuzz\n86\nFizz\n88\n89\nFizzBuzz\n91\n92\nFizz\n94\nBuzz\nFizz\n97\n98\nFizz\nBuzz";

        assert.strictEqual(codeOutput.language, "C++");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
    });

    it("Cartesian equation", async () => {
        const code = `#include <iostream>
#include <vector>
#include <algorithm>

void print(const std::vector<std::vector<int>>& v) {
    std::cout << "{ ";
    for (const auto& p : v) {
    std::cout << "(";
    for (const auto& e : p) {
        std::cout << e << " ";
    }
    std::cout << ") ";
    }
    std::cout << "}" << std::endl;
}

auto product(const std::vector<std::vector<int>>& lists) {
    std::vector<std::vector<int>> result;
    if (std::find_if(std::begin(lists), std::end(lists),
    [](auto e) -> bool { return e.size() == 0; }) != std::end(lists)) {
    return result;
    }
    for (auto& e : lists[0]) {
    result.push_back({ e });
    }
    for (size_t i = 1; i < lists.size(); ++i) {
    std::vector<std::vector<int>> temp;
    for (auto& e : result) {
        for (auto f : lists[i]) {
        auto e_tmp = e;
        e_tmp.push_back(f);
        temp.push_back(e_tmp);
        }
    }
    result = temp;
    }
    return result;
}

int main() {
    std::vector<std::vector<int>> prods[] = {
    { { 1, 2 }, { 3, 4 } },
    { { 3, 4 }, { 1, 2} },
    { { 1, 2 }, { } },
    { { }, { 1, 2 } },
    { { 1776, 1789 }, { 7, 12 }, { 4, 14, 23 }, { 0, 1 } },
    { { 1, 2, 3 }, { 30 }, { 500, 100 } },
    { { 1, 2, 3 }, { }, { 500, 100 } }
    };
    for (const auto& p : prods) {
    print(product(p));
    }
    std::cin.ignore();
    std::cin.get();
    return 0;
}`;
        const codeOutput = await pestoClient.execute({
            language: "C++",
            version: "latest",
            code: code
        });

        const expectedOutput = "{ (1 3 ) (1 4 ) (2 3 ) (2 4 ) }\n{ (3 1 ) (3 2 ) (4 1 ) (4 2 ) }\n{ }\n{ }\n{ (1776 7 4 0 ) (1776 7 4 1 ) (1776 7 14 0 ) (1776 7 14 1 ) (1776 7 23 0 ) (1776 7 23 1 ) (1776 12 4 0 ) (1776 12 4 1 ) (1776 12 14 0 ) (1776 12 14 1 ) (1776 12 23 0 ) (1776 12 23 1 ) (1789 7 4 0 ) (1789 7 4 1 ) (1789 7 14 0 ) (1789 7 14 1 ) (1789 7 23 0 ) (1789 7 23 1 ) (1789 12 4 0 ) (1789 12 4 1 ) (1789 12 14 0 ) (1789 12 14 1 ) (1789 12 23 0 ) (1789 12 23 1 ) }\n{ (1 30 500 ) (1 30 100 ) (2 30 500 ) (2 30 100 ) (3 30 500 ) (3 30 100 ) }\n{ }";

        assert.strictEqual(codeOutput.language, "C++");
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
        const code = `#include <iostream>
#include <iterator>
#include <algorithm>
#include <vector>

// Fills the range [start, end) with 1 if the integer corresponding to the index is composite and 0 otherwise.
// requires: I is RandomAccessIterator
template<typename I>
void mark_composites(I start, I end)
{
    std::fill(start, end, 0);

    for (auto it = start + 1; it != end; ++it)
    {
        if (*it == 0)
        {
            auto prime = std::distance(start, it) + 1;
            // mark all multiples of this prime number as composite.
            auto multiple_it = it;
            while (std::distance(multiple_it, end) > prime)
            {
                std::advance(multiple_it, prime);
                *multiple_it = 1;
            }
        }
    }
}

// Fills "out" with the prime numbers in the range 2...N where N = distance(start, end).
// requires: I is a RandomAccessIterator
//           O is an OutputIterator
template <typename I, typename O>
O sieve_primes(I start, I end, O out)
{
    mark_composites(start, end);
    for (auto it = start + 1; it != end; ++it)
    {
        if (*it == 0)
        {
            *out = std::distance(start, it) + 1;
            ++out;
        }
    }
    return out;
}

int main()
{
    std::vector<uint8_t> is_composite(100);
    sieve_primes(is_composite.begin(), is_composite.end(), std::ostream_iterator<int>(std::cout, " "));

    // Alternative to store in a vector:
    // std::vector<int> primes;
    // sieve_primes(is_composite.begin(), is_composite.end(), std::back_inserter(primes));
}`;

        const codeOutput = await pestoClient.execute({
            language: "C++",
            version: "latest",
            code: code
        });

        const expectedOutput = "2 3 5 7 11 13 17 19 23 29 31 37 41 43 47 53 59 61 67 71 73 79 83 89 97";

        assert.strictEqual(codeOutput.language, "C++");
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
        const code = `#include <iostream>
using std::cout;

int main()
{
    for(int bottles(99); bottles > 0; bottles -= 1){
    cout << bottles << " bottles of beer on the wall, "
            << bottles << " bottles of beer.\\n"
            << "Take one down, pass it around, "
            << bottles - 1 << " bottles of beer on the wall\\n\\n";
    }
}`;

        const codeOutput = await pestoClient.execute({
            language: "C++",
            version: "latest",
            code: code
        });

        const expectedOutput = "99 bottles of beer on the wall, 99 bottles of beer.\nTake one down, pass it around, 98 bottles of beer on the wall\n\n98 bottles of beer on the wall, 98 bottles of beer.\nTake one down, pass it around, 97 bottles of beer on the wall\n\n97 bottles of beer on the wall, 97 bottles of beer.\nTake one down, pass it around, 96 bottles of beer on the wall\n\n96 bottles of beer on the wall, 96 bottles of beer.\nTake one down, pass it around, 95 bottles of beer on the wall\n\n95 bottles of beer on the wall, 95 bottles of beer.\nTake one down, pass it around, 94 bottles of beer on the wall\n\n94 bottles of beer on the wall, 94 bottles of beer.\nTake one down, pass it around, 93 bottles of beer on the wall\n\n93 bottles of beer on the wall, 93 bottles of beer.\nTake one down, pass it around, 92 bottles of beer on the wall\n\n92 bottles of beer on the wall, 92 bottles of beer.\nTake one down, pass it around, 91 bottles of beer on the wall\n\n91 bottles of beer on the wall, 91 bottles of beer.\nTake one down, pass it around, 90 bottles of beer on the wall\n\n90 bottles of beer on the wall, 90 bottles of beer.\nTake one down, pass it around, 89 bottles of beer on the wall\n\n89 bottles of beer on the wall, 89 bottles of beer.\nTake one down, pass it around, 88 bottles of beer on the wall\n\n88 bottles of beer on the wall, 88 bottles of beer.\nTake one down, pass it around, 87 bottles of beer on the wall\n\n87 bottles of beer on the wall, 87 bottles of beer.\nTake one down, pass it around, 86 bottles of beer on the wall\n\n86 bottles of beer on the wall, 86 bottles of beer.\nTake one down, pass it around, 85 bottles of beer on the wall\n\n85 bottles of beer on the wall, 85 bottles of beer.\nTake one down, pass it around, 84 bottles of beer on the wall\n\n84 bottles of beer on the wall, 84 bottles of beer.\nTake one down, pass it around, 83 bottles of beer on the wall\n\n83 bottles of beer on the wall, 83 bottles of beer.\nTake one down, pass it around, 82 bottles of beer on the wall\n\n82 bottles of beer on the wall, 82 bottles of beer.\nTake one down, pass it around, 81 bottles of beer on the wall\n\n81 bottles of beer on the wall, 81 bottles of beer.\nTake one down, pass it around, 80 bottles of beer on the wall\n\n80 bottles of beer on the wall, 80 bottles of beer.\nTake one down, pass it around, 79 bottles of beer on the wall\n\n79 bottles of beer on the wall, 79 bottles of beer.\nTake one down, pass it around, 78 bottles of beer on the wall\n\n78 bottles of beer on the wall, 78 bottles of beer.\nTake one down, pass it around, 77 bottles of beer on the wall\n\n77 bottles of beer on the wall, 77 bottles of beer.\nTake one down, pass it around, 76 bottles of beer on the wall\n\n76 bottles of beer on the wall, 76 bottles of beer.\nTake one down, pass it around, 75 bottles of beer on the wall\n\n75 bottles of beer on the wall, 75 bottles of beer.\nTake one down, pass it around, 74 bottles of beer on the wall\n\n74 bottles of beer on the wall, 74 bottles of beer.\nTake one down, pass it around, 73 bottles of beer on the wall\n\n73 bottles of beer on the wall, 73 bottles of beer.\nTake one down, pass it around, 72 bottles of beer on the wall\n\n72 bottles of beer on the wall, 72 bottles of beer.\nTake one down, pass it around, 71 bottles of beer on the wall\n\n71 bottles of beer on the wall, 71 bottles of beer.\nTake one down, pass it around, 70 bottles of beer on the wall\n\n70 bottles of beer on the wall, 70 bottles of beer.\nTake one down, pass it around, 69 bottles of beer on the wall\n\n69 bottles of beer on the wall, 69 bottles of beer.\nTake one down, pass it around, 68 bottles of beer on the wall\n\n68 bottles of beer on the wall, 68 bottles of beer.\nTake one down, pass it around, 67 bottles of beer on the wall\n\n67 bottles of beer on the wall, 67 bottles of beer.\nTake one down, pass it around, 66 bottles of beer on the wall\n\n66 bottles of beer on the wall, 66 bottles of beer.\nTake one down, pass it around, 65 bottles of beer on the wall\n\n65 bottles of beer on the wall, 65 bottles of beer.\nTake one down, pass it around, 64 bottles of beer on the wall\n\n64 bottles of beer on the wall, 64 bottles of beer.\nTake one down, pass it around, 63 bottles of beer on the wall\n\n63 bottles of beer on the wall, 63 bottles of beer.\nTake one down, pass it around, 62 bottles of beer on the wall\n\n62 bottles of beer on the wall, 62 bottles of beer.\nTake one down, pass it around, 61 bottles of beer on the wall\n\n61 bottles of beer on the wall, 61 bottles of beer.\nTake one down, pass it around, 60 bottles of beer on the wall\n\n60 bottles of beer on the wall, 60 bottles of beer.\nTake one down, pass it around, 59 bottles of beer on the wall\n\n59 bottles of beer on the wall, 59 bottles of beer.\nTake one down, pass it around, 58 bottles of beer on the wall\n\n58 bottles of beer on the wall, 58 bottles of beer.\nTake one down, pass it around, 57 bottles of beer on the wall\n\n57 bottles of beer on the wall, 57 bottles of beer.\nTake one down, pass it around, 56 bottles of beer on the wall\n\n56 bottles of beer on the wall, 56 bottles of beer.\nTak";

        assert.strictEqual(codeOutput.language, "C++");
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
        const code = `#include <iostream>
using std::cout;

//iteration with while
long long int factorial(long long int n)
{
    long long int r = 1;
    while(1<n)
        r *= n--;
    return r;
}

int main() {
    cout << factorial(10);
    return 0;
}`;

        const codeOutput = await pestoClient.execute({
            language: "C++",
            version: "latest",
            code: code
        });

        const expectedOutput = "3628800";

        assert.strictEqual(codeOutput.language, "C++");
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
        const code = `#include <iostream>
#include <iterator>
#include <algorithm> // for std::inplace_merge
#include <functional> // for std::less

template<typename RandomAccessIterator, typename Order>
    void mergesort(RandomAccessIterator first, RandomAccessIterator last, Order order)
{
    if (last - first > 1)
    {
    RandomAccessIterator middle = first + (last - first) / 2;
    mergesort(first, middle, order);
    mergesort(middle, last, order);
    std::inplace_merge(first, middle, last, order);
    }
}

template<typename RandomAccessIterator>
    void mergesort(RandomAccessIterator first, RandomAccessIterator last)
{
    mergesort(first, last, std::less<typename std::iterator_traits<RandomAccessIterator>::value_type>());
}

int main() {
    int array[] = {2, 8, 3, 10, 13, 6, 11, 9, 19, 15, 5, 4, 12, 14, 20, 1, 17, 18, 16, 7};

    // Sort the array using mergesort.
    mergesort(array, array + sizeof(array) / sizeof(array[0]));

    // Print the sorted array.
    for (int i = 0; i < 20; i++) {
        std::cout << array[i] << " ";
    }
    std::cout << std::endl;

    return 0;
}`;

        const codeOutput = await pestoClient.execute({
            language: "C++",
            version: "latest",
            code: code
        });

        const expectedOutput = "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20";

        assert.strictEqual(codeOutput.language, "C++");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
    });

    it("Heap sort", async () => {
        const code = `#include <algorithm>
#include <iterator>
#include <iostream>

template<typename RandomAccessIterator>
void heap_sort(RandomAccessIterator begin, RandomAccessIterator end) {
    std::make_heap(begin, end);
    std::sort_heap(begin, end);
}

int main() {
    int a[] = {2, 8, 3, 10, 13, 6, 11, 9, 19, 15, 5, 4, 12, 14, 20, 1, 17, 18, 16, 7};
    heap_sort(std::begin(a), std::end(a));
    copy(std::begin(a), std::end(a), std::ostream_iterator<int>(std::cout, " "));
    std::cout << "\\n";
}`;

        const codeOutput = await pestoClient.execute({
            language: "C++",
            version: "latest",
            code: code
        });

        const expectedOutput = "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20";

        assert.strictEqual(codeOutput.language, "C++");
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
