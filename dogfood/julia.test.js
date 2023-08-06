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
            code
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
            code
        });

        const expectedOutput = "Zntvp Rapelcgvba";

        assert.strictEqual(codeOutput.language, "Julia");
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
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

a = [2, 8, 3, 10, 13, 6, 11, 9, 19, 15, 5, 4, 12, 14, 20, 1, 17, 18, 16, 7]
heapsort!(a)
for i = 1:length(a)
    print(a[i], " ")
end`;

        const codeOutput = await pestoClient.execute({
            language: "Julia",
            version: "latest",
            code
        });

        const expectedOutput = "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20";

        assert.strictEqual(codeOutput.language, "Julia");
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
    });

    it("Merge sort", async () => {
        // Solution by cbk on Jan 12, 2022: https://stackoverflow.com/a/70674990/3153224
        const code = `# Top-level function will allocate temporary arrays for convenience
function mergesort(A)
    S = similar(A)
    return mergesort!(copy(A), S)
end

# Efficient in-place version
# S is a temporary working (scratch) array
function mergesort!(A, S, n=length(A))
    width = 1
    swapcount = 0
    while width < n
        # A is currently full of sorted runs of length 'width' (starting with width=1)
        for i = 1:2*width:n
            # Merge two sorted lists, left and right:
            # left = A[i:i+width-1], right = A[i+width:i+2*width-1]
            merge!(A, i, min(i+width, n+1), min(i+2*width, n+1), S)
        end
        # Swap the pointers of 'A' and 'S' such that 'A' now contains merged
        # runs of length 2*width.
        S,A = A,S
        swapcount += 1

        # Double the width and continue
        width *= 2
    end
    # Optional, if it is important that 'A' be sorted in-place:
    if isodd(swapcount)
        # If we've swapped A and S an odd number of times, copy 'A' back to 'S'
        # since 'S' will by now refer to the memory initially provided as input
        # array 'A', which the user will expect to have been sorted in-place
        copyto!(S,A)
    end
    return A
end

# Merge two sorted subarrays, left and right:
# left = A[iₗ:iᵣ-1], right = A[iᵣ:iₑ-1]
@inline function merge!(A, iₗ, iᵣ, iₑ, S)
    left, right = iₗ, iᵣ
    @inbounds for n = iₗ:(iₑ-1)
        if (left < iᵣ) && (right >= iₑ || A[left] <= A[right])
            S[n] = A[left]
            left += 1
        else
            S[n] = A[right]
            right += 1
        end
    end
end

v = [2, 8, 3, 10, 13, 6, 11, 9, 19, 15, 5, 4, 12, 14, 20, 1, 17, 18, 16, 7]
sorted = mergesort(v)
for i = 1:length(sorted)
  print(sorted[i], " ")
end`;

        const codeOutput = await pestoClient.execute({
            language: "Julia",
            version: "latest",
            code
        });

        const expectedOutput = "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20";

        assert.strictEqual(codeOutput.language, "Julia");
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
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
            code
        });

        const expectedOutput = "[2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]";

        assert.strictEqual(codeOutput.language, "Julia");
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
    });

    it("99 Bottles", async () => {
        const code = `i = 99
while i > 0
    println("$i bottles of beer on the wall, $i bottles of beer.")
    println("Take one down, pass it around, $(i-1) bottles of beer on the wall\\n")
    global i -= 1
end`;

        const codeOutput = await pestoClient.execute({
            language: "Julia",
            version: "latest",
            code
        });

        const expectedOutput = "99 bottles of beer on the wall, 99 bottles of beer.\nTake one down, pass it around, 98 bottles of beer on the wall\n\n98 bottles of beer on the wall, 98 bottles of beer.\nTake one down, pass it around, 97 bottles of beer on the wall\n\n97 bottles of beer on the wall, 97 bottles of beer.\nTake one down, pass it around, 96 bottles of beer on the wall\n\n96 bottles of beer on the wall, 96 bottles of beer.\nTake one down, pass it around, 95 bottles of beer on the wall\n\n95 bottles of beer on the wall, 95 bottles of beer.\nTake one down, pass it around, 94 bottles of beer on the wall\n\n94 bottles of beer on the wall, 94 bottles of beer.\nTake one down, pass it around, 93 bottles of beer on the wall\n\n93 bottles of beer on the wall, 93 bottles of beer.\nTake one down, pass it around, 92 bottles of beer on the wall\n\n92 bottles of beer on the wall, 92 bottles of beer.\nTake one down, pass it around, 91 bottles of beer on the wall\n\n91 bottles of beer on the wall, 91 bottles of beer.\nTake one down, pass it around, 90 bottles of beer on the wall\n\n90 bottles of beer on the wall, 90 bottles of beer.\nTake one down, pass it around, 89 bottles of beer on the wall\n\n89 bottles of beer on the wall, 89 bottles of beer.\nTake one down, pass it around, 88 bottles of beer on the wall\n\n88 bottles of beer on the wall, 88 bottles of beer.\nTake one down, pass it around, 87 bottles of beer on the wall\n\n87 bottles of beer on the wall, 87 bottles of beer.\nTake one down, pass it around, 86 bottles of beer on the wall\n\n86 bottles of beer on the wall, 86 bottles of beer.\nTake one down, pass it around, 85 bottles of beer on the wall\n\n85 bottles of beer on the wall, 85 bottles of beer.\nTake one down, pass it around, 84 bottles of beer on the wall\n\n84 bottles of beer on the wall, 84 bottles of beer.\nTake one down, pass it around, 83 bottles of beer on the wall\n\n83 bottles of beer on the wall, 83 bottles of beer.\nTake one down, pass it around, 82 bottles of beer on the wall\n\n82 bottles of beer on the wall, 82 bottles of beer.\nTake one down, pass it around, 81 bottles of beer on the wall\n\n81 bottles of beer on the wall, 81 bottles of beer.\nTake one down, pass it around, 80 bottles of beer on the wall\n\n80 bottles of beer on the wall, 80 bottles of beer.\nTake one down, pass it around, 79 bottles of beer on the wall\n\n79 bottles of beer on the wall, 79 bottles of beer.\nTake one down, pass it around, 78 bottles of beer on the wall\n\n78 bottles of beer on the wall, 78 bottles of beer.\nTake one down, pass it around, 77 bottles of beer on the wall\n\n77 bottles of beer on the wall, 77 bottles of beer.\nTake one down, pass it around, 76 bottles of beer on the wall\n\n76 bottles of beer on the wall, 76 bottles of beer.\nTake one down, pass it around, 75 bottles of beer on the wall\n\n75 bottles of beer on the wall, 75 bottles of beer.\nTake one down, pass it around, 74 bottles of beer on the wall\n\n74 bottles of beer on the wall, 74 bottles of beer.\nTake one down, pass it around, 73 bottles of beer on the wall\n\n73 bottles of beer on the wall, 73 bottles of beer.\nTake one down, pass it around, 72 bottles of beer on the wall\n\n72 bottles of beer on the wall, 72 bottles of beer.\nTake one down, pass it around, 71 bottles of beer on the wall\n\n71 bottles of beer on the wall, 71 bottles of beer.\nTake one down, pass it around, 70 bottles of beer on the wall\n\n70 bottles of beer on the wall, 70 bottles of beer.\nTake one down, pass it around, 69 bottles of beer on the wall\n\n69 bottles of beer on the wall, 69 bottles of beer.\nTake one down, pass it around, 68 bottles of beer on the wall\n\n68 bottles of beer on the wall, 68 bottles of beer.\nTake one down, pass it around, 67 bottles of beer on the wall\n\n67 bottles of beer on the wall, 67 bottles of beer.\nTake one down, pass it around, 66 bottles of beer on the wall\n\n66 bottles of beer on the wall, 66 bottles of beer.\nTake one down, pass it around, 65 bottles of beer on the wall\n\n65 bottles of beer on the wall, 65 bottles of beer.\nTake one down, pass it around, 64 bottles of beer on the wall\n\n64 bottles of beer on the wall, 64 bottles of beer.\nTake one down, pass it around, 63 bottles of beer on the wall\n\n63 bottles of beer on the wall, 63 bottles of beer.\nTake one down, pass it around, 62 bottles of beer on the wall\n\n62 bottles of beer on the wall, 62 bottles of beer.\nTake one down, pass it around, 61 bottles of beer on the wall\n\n61 bottles of beer on the wall, 61 bottles of beer.\nTake one down, pass it around, 60 bottles of beer on the wall\n\n60 bottles of beer on the wall, 60 bottles of beer.\nTake one down, pass it around, 59 bottles of beer on the wall\n\n59 bottles of beer on the wall, 59 bottles of beer.\nTake one down, pass it around, 58 bottles of beer on the wall\n\n58 bottles of beer on the wall, 58 bottles of beer.\nTake one down, pass it around, 57 bottles of beer on the wall\n\n57 bottles of beer on the wall, 57 bottles of beer.\nTake one down, pass it around, 56 bottles of beer on the wall\n\n56 bottles of beer on the wall, 56 bottles of beer.\nTak";

        assert.strictEqual(codeOutput.language, "Julia");
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
    });

    it("Factorial", async () => {
        const code = `function factorial(n::Int64)
        if n < 0
            throw(ArgumentError("Number must be non-negative"))
        end

        result = 1
        while n > 1
            result *= n
            n -= 1
        end

        return result
end

println(factorial(10))`;

        const codeOutput = await pestoClient.execute({
            language: "Julia",
            version: "latest",
            code
        });

        const expectedOutput = "3628800";

        assert.strictEqual(codeOutput.language, "Julia");
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
    });
});
