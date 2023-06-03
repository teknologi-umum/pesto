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
            code,
        });

        const expectedOutput = "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz\n31\n32\nFizz\n34\nBuzz\nFizz\n37\n38\nFizz\nBuzz\n41\nFizz\n43\n44\nFizzBuzz\n46\n47\nFizz\n49\nBuzz\nFizz\n52\n53\nFizz\nBuzz\n56\nFizz\n58\n59\nFizzBuzz\n61\n62\nFizz\n64\nBuzz\nFizz\n67\n68\nFizz\nBuzz\n71\nFizz\n73\n74\nFizzBuzz\n76\n77\nFizz\n79\nBuzz\nFizz\n82\n83\nFizz\nBuzz\n86\nFizz\n88\n89\nFizzBuzz\n91\n92\nFizz\n94\nBuzz\nFizz\n97\n98\nFizz\nBuzz";

        assert.strictEqual(codeOutput.language, "C++");
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
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
}`
        const codeOutput = await pestoClient.execute({
            language: "C++",
            version: "latest",
            code: code,
        });

        const expectedOutput = "{ (1 3 ) (1 4 ) (2 3 ) (2 4 ) }\n{ (3 1 ) (3 2 ) (4 1 ) (4 2 ) }\n{ }\n{ }\n{ (1776 7 4 0 ) (1776 7 4 1 ) (1776 7 14 0 ) (1776 7 14 1 ) (1776 7 23 0 ) (1776 7 23 1 ) (1776 12 4 0 ) (1776 12 4 1 ) (1776 12 14 0 ) (1776 12 14 1 ) (1776 12 23 0 ) (1776 12 23 1 ) (1789 7 4 0 ) (1789 7 4 1 ) (1789 7 14 0 ) (1789 7 14 1 ) (1789 7 23 0 ) (1789 7 23 1 ) (1789 12 4 0 ) (1789 12 4 1 ) (1789 12 14 0 ) (1789 12 14 1 ) (1789 12 23 0 ) (1789 12 23 1 ) }\n{ (1 30 500 ) (1 30 100 ) (2 30 500 ) (2 30 100 ) (3 30 500 ) (3 30 100 ) }\n{ }";

        assert.strictEqual(codeOutput.language, "C++");
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
    });
})
