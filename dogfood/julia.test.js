import {describe, it} from "node:test";
import assert from "node:assert";
import {PestoClient} from "@teknologi-umum/pesto";

const pestoClient = new PestoClient({
    baseURL: process.env.PESTO_URL,
    token: "DOGFOOD"
});

describe("Julia", {concurrency: true}, () => {
    it("FizzBuzz", async () => {
        const code = `function FizzBuzz(num)
  if num % 15 == 0
    println("FizzBuzz")
  elseif num % 5 == 0
    println("Buzz")
  elseif num % 3 == 0
    println("Fizz")
  else
    println(num)
  end
end

for i = 1:100
  FizzBuzz(i)
end`;

        const codeOutput = await pestoClient.execute({
            language: "Julia",
            version: "latest",
            code,
        });

        const expectedOutput = "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz\n31\n32\nFizz\n34\nBuzz\nFizz\n37\n38\nFizz\nBuzz\n41\nFizz\n43\n44\nFizzBuzz\n46\n47\nFizz\n49\nBuzz\nFizz\n52\n53\nFizz\nBuzz\n56\nFizz\n58\n59\nFizzBuzz\n61\n62\nFizz\n64\nBuzz\nFizz\n67\n68\nFizz\nBuzz\n71\nFizz\n73\n74\nFizzBuzz\n76\n77\nFizz\n79\nBuzz\nFizz\n82\n83\nFizz\nBuzz\n86\nFizz\n88\n89\nFizzBuzz\n91\n92\nFizz\n94\nBuzz\nFizz\n97\n98\nFizz\nBuzz";

        assert.strictEqual(codeOutput.language, "Julia");
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
    });

    it("Caesar cipher", async () => {
        const code = `function csrcipher(text, key)
    ciphtext = ""
    for l in text
        numl = Int(l)
        ciphnuml = numl + key
        if numl in 65:90
            if ciphnuml > 90
                rotciphnuml = ciphnuml - 26
                ciphtext = ciphtext * Char(rotciphnuml)
            else
                ciphtext = ciphtext * Char(ciphnuml)
            end
        elseif numl in 97:122
            if ciphnuml > 122
                rotciphnuml = ciphnuml - 26
                ciphtext = ciphtext * Char(rotciphnuml)
            else
                ciphtext = ciphtext * Char(ciphnuml)
            end
        else
            ciphtext = ciphtext * Char(numl)
        end
    end
    return ciphtext
end

text = "Magic Encryption"; key = 13
print(csrcipher(text, key))`;

        const codeOutput = await pestoClient.execute({
            language: "Julia",
            version: "latest",
            code,
        });

        const expectedOutput = "Zntvp Rapelcgvba"

        assert.strictEqual(codeOutput.language, "Julia");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
    });

    it("Heap sort", async () => {
        const code = `function swap(a, i, j)
    a[i], a[j] = a[j], a[i]
end

function pd!(a, first, last)
    while (c = 2 * first - 1) < last
        if c < last && a[c] < a[c + 1]
            c += 1
        end
        if a[first] < a[c]
            swap(a, c, first)
            first = c
        else
            break
        end
    end
end

function heapify!(a, n)
    f = div(n, 2)
    while f >= 1
        pd!(a, f, n)
        f -= 1
    end
end

function heapsort!(a)
    n = length(a)
    heapify!(a, n)
    l = n
    while l > 1
        swap(a, 1, l)
        l -= 1
        pd!(a, 1, l)
    end
    return a
end

using Random: shuffle
a = shuffle(collect(1:12))
println(heapsort!(a))`;

        const codeOutput = await pestoClient.execute({
            language: "Julia",
            version: "latest",
            code,
        });

        const expectedOutput = "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]";

        assert.strictEqual(codeOutput.language, "Julia");
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
    });

    it("Sieve of Erastosthenes", async () => {
        const code = `function sieve(lim :: Int)
    if lim < 2 return [] end
    limi :: Int = (lim - 1) ÷ 2 # calculate the required array size
    isprime :: Array{Bool} = trues(limi)
    llimi :: Int = (isqrt(lim) - 1) ÷ 2 # and calculate maximum root prime index
    result :: Array{Int} = [2]  #Initial array
    for i in 1:limi
        if isprime[i]
            p = i + i + 1 # 2i + 1
            if i <= llimi
                for j = (p*p-1)>>>1:p:limi # quick shift/divide in case LLVM doesn't optimize divide by 2 away
                    isprime[j] = false
                end
            end
            push!(result, p)
        end
    end
    return result
end

println(sieve(100))`;

        const codeOutput = await pestoClient.execute({
            language: "Julia",
            version: "latest",
            code,
        });

        const expectedOutput = "[2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]";

        assert.strictEqual(codeOutput.language, "Julia");
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
