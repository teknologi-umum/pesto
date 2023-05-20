import { it, describe } from "node:test";
import assert from "node:assert";
import { PestoClient } from "@teknologi-umum/pesto";

const pestoClient = new PestoClient({ baseURL: process.env.PESTO_URL, token: "DOGFOOD" });

describe("Python", { concurrency: true }, () => {
    it("FizzBuzz", async () => {
        const code = `for i in range(1, 101):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)`;
    
        const codeOutput = await pestoClient.execute({
            language: "Python",
            version: "latest",
            code: code
        });
    
        const expectedOutput = "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz\n31\n32\nFizz\n34\nBuzz\nFizz\n37\n38\nFizz\nBuzz\n41\nFizz\n43\n44\nFizzBuzz\n46\n47\nFizz\n49\nBuzz\nFizz\n52\n53\nFizz\nBuzz\n56\nFizz\n58\n59\nFizzBuzz\n61\n62\nFizz\n64\nBuzz\nFizz\n67\n68\nFizz\nBuzz\n71\nFizz\n73\n74\nFizzBuzz\n76\n77\nFizz\n79\nBuzz\nFizz\n82\n83\nFizz\nBuzz\n86\nFizz\n88\n89\nFizzBuzz\n91\n92\nFizz\n94\nBuzz\nFizz\n97\n98\nFizz\nBuzz";
    
        assert.strictEqual(codeOutput.language, "Python");
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
    })
    
    // https://rosettacode.org/wiki/Cartesian_product_of_two_or_more_lists#Python
    it("Cartesian Equation", async () => {
        const code = `import itertools
    
def cp(lsts):
    return list(itertools.product(*lsts))

if __name__ == '__main__':
    from pprint import pprint as pp
    
    for lists in [[[1,2],[3,4]], [[3,4],[1,2]], [[], [1, 2]], [[1, 2], []],
                    ((1776, 1789),  (7, 12), (4, 14, 23), (0, 1)),
                    ((1, 2, 3), (30,), (500, 100)),
                    ((1, 2, 3), (), (500, 100))]:
        print(lists, '=>')
        pp(cp(lists), indent=2)`;
    
        const codeOutput = await pestoClient.execute({
            language: "Python",
            version: "latest",
            code: code
        });
    
        const expectedOutput = "[[1, 2], [3, 4]] =>\n[(1, 3), (1, 4), (2, 3), (2, 4)]\n[[3, 4], [1, 2]] =>\n[(3, 1), (3, 2), (4, 1), (4, 2)]\n[[], [1, 2]] =>\n[]\n[[1, 2], []] =>\n[]\n((1776, 1789), (7, 12), (4, 14, 23), (0, 1)) =>\n[ (1776, 7, 4, 0),\n  (1776, 7, 4, 1),\n  (1776, 7, 14, 0),\n  (1776, 7, 14, 1),\n  (1776, 7, 23, 0),\n  (1776, 7, 23, 1),\n  (1776, 12, 4, 0),\n  (1776, 12, 4, 1),\n  (1776, 12, 14, 0),\n  (1776, 12, 14, 1),\n  (1776, 12, 23, 0),\n  (1776, 12, 23, 1),\n  (1789, 7, 4, 0),\n  (1789, 7, 4, 1),\n  (1789, 7, 14, 0),\n  (1789, 7, 14, 1),\n  (1789, 7, 23, 0),\n  (1789, 7, 23, 1),\n  (1789, 12, 4, 0),\n  (1789, 12, 4, 1),\n  (1789, 12, 14, 0),\n  (1789, 12, 14, 1),\n  (1789, 12, 23, 0),\n  (1789, 12, 23, 1)]\n((1, 2, 3), (30,), (500, 100)) =>\n[ (1, 30, 500),\n  (1, 30, 100),\n  (2, 30, 500),\n  (2, 30, 100),\n  (3, 30, 500),\n  (3, 30, 100)]\n((1, 2, 3), (), (500, 100)) =>\n[]";
    
        assert.strictEqual(codeOutput.language, "Python");
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
    })
    
    it("Caesar Cipher", async () => {
        const code = `from string import ascii_uppercase as abc
    
def caesar(s, k, decode = False):
    trans = dict(zip(abc, abc[(k,26-k)[decode]:] + abc[:(k,26-k)[decode]]))
    return ''.join(trans[L] for L in s.upper() if L in abc)

msg = "The quick brown fox jumped over the lazy dogs"
print(caesar(msg, 11))`
    
        const codeOutput = await pestoClient.execute({
            language: "Python",
            version: "latest",
            code: code
        });
    
        const expectedOutput = "ESPBFTNVMCZHYQZIUFXAPOZGPCESPWLKJOZRD";
    
        assert.strictEqual(codeOutput.language, "Python");
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
        const code =`def merge(x, y):
    if x==[]: return y
    if y==[]: return x
    return [x[0]] + merge(x[1:], y) if x[0]<y[0] else [y[0]] + merge(x, y[1:])

def sort(a, n):
    m = n//2
    return a if n<=1 else merge(sort(a[:m], m), sort(a[m:], n-m))

a = [9,2,3,7,5,1,8,6,4]
print(sort(a, len(a)))`;

        const codeOutput = await pestoClient.execute({
            language: "Python",
            version: "latest",
            code: code
        });

        const expectedOutput = "[1, 2, 3, 4, 5, 6, 7, 8, 9]";

        assert.strictEqual(codeOutput.language, "Python");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
    });

    it("Problem of Apollonius", async () => {
        const code = `from collections import namedtuple
import math

Circle = namedtuple('Circle', 'x, y, r')
    
def solveApollonius(c1, c2, c3, s1, s2, s3):
    '''
    >>> solveApollonius((0, 0, 1), (4, 0, 1), (2, 4, 2), 1,1,1)
    Circle(x=2.0, y=2.1, r=3.9)
    >>> solveApollonius((0, 0, 1), (4, 0, 1), (2, 4, 2), -1,-1,-1)
    Circle(x=2.0, y=0.8333333333333333, r=1.1666666666666667) 
    '''
    x1, y1, r1 = c1
    x2, y2, r2 = c2
    x3, y3, r3 = c3

    v11 = 2*x2 - 2*x1
    v12 = 2*y2 - 2*y1
    v13 = x1*x1 - x2*x2 + y1*y1 - y2*y2 - r1*r1 + r2*r2
    v14 = 2*s2*r2 - 2*s1*r1
    
    v21 = 2*x3 - 2*x2
    v22 = 2*y3 - 2*y2
    v23 = x2*x2 - x3*x3 + y2*y2 - y3*y3 - r2*r2 + r3*r3
    v24 = 2*s3*r3 - 2*s2*r2
    
    w12 = v12/v11
    w13 = v13/v11
    w14 = v14/v11
    
    w22 = v22/v21-w12
    w23 = v23/v21-w13
    w24 = v24/v21-w14
    
    P = -w23/w22
    Q = w24/w22
    M = -w12*P-w13
    N = w14 - w12*Q
    
    a = N*N + Q*Q - 1
    b = 2*M*N - 2*N*x1 + 2*P*Q - 2*Q*y1 + 2*s1*r1
    c = x1*x1 + M*M - 2*M*x1 + P*P + y1*y1 - 2*P*y1 - r1*r1
    
    # Find a root of a quadratic equation. This requires the circle centers not to be e.g. colinear
    D = b*b-4*a*c
    rs = (-b-math.sqrt(D))/(2*a)
    
    xs = M+N*rs
    ys = P+Q*rs
    
    return Circle(xs, ys, rs)

if __name__ == '__main__':
    c1, c2, c3 = Circle(0, 0, 1), Circle(4, 0, 1), Circle(2, 4, 2)
    print(solveApollonius(c1, c2, c3, 1, 1, 1))    #Expects "Circle[x=2.00,y=2.10,r=3.90]" (green circle in image)
    print(solveApollonius(c1, c2, c3, -1, -1, -1)) #Expects "Circle[x=2.00,y=0.83,r=1.17]" (red circle in image)`;

    const codeOutput = await pestoClient.execute({
        language: "Python",
        version: "latest",
        code: code
    });

    const expectedOutput = "Circle(x=2.0, y=2.1, r=3.9)\nCircle(x=2.0, y=0.8333333333333333, r=1.1666666666666667)";

    assert.strictEqual(codeOutput.language, "Python");
    assert.strictEqual(codeOutput.compile.stderr, "");
    assert.strictEqual(codeOutput.compile.stdout, "");
    assert.strictEqual(codeOutput.compile.output, "");
    assert.strictEqual(codeOutput.compile.exitCode, 0);
    assert.strictEqual(codeOutput.runtime.stderr, "");
    assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput);
    assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput);
    assert.strictEqual(codeOutput.runtime.exitCode, 0);
    })
})