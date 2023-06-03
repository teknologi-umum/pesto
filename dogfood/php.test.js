import {it, describe} from "node:test";
import assert from "node:assert";
import {PestoClient} from "@teknologi-umum/pesto";

const pestoClient = new PestoClient({
    baseURL: process.env.PESTO_URL,
    token: "DOGFOOD"
});

describe("PHP", {concurrency: true}, () => {
    it("FizzBuzz", async () => {
        const code = `<?php
    for ($i = 1; $i <= 100; $i++)
    {
        if (!($i % 15))
            echo "FizzBuzz\n";
        else if (!($i % 3))
            echo "Fizz\n";
        else if (!($i % 5))
            echo "Buzz\n";
        else
            echo "$i\n";
    }
    ?>`;

        const codeOutput = await pestoClient.execute({
            language: "PHP",
            version: "latest",
            code: code
        });

        const expectedOutput = "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz\n31\n32\nFizz\n34\nBuzz\nFizz\n37\n38\nFizz\nBuzz\n41\nFizz\n43\n44\nFizzBuzz\n46\n47\nFizz\n49\nBuzz\nFizz\n52\n53\nFizz\nBuzz\n56\nFizz\n58\n59\nFizzBuzz\n61\n62\nFizz\n64\nBuzz\nFizz\n67\n68\nFizz\nBuzz\n71\nFizz\n73\n74\nFizzBuzz\n76\n77\nFizz\n79\nBuzz\nFizz\n82\n83\nFizz\nBuzz\n86\nFizz\n88\n89\nFizzBuzz\n91\n92\nFizz\n94\nBuzz\nFizz\n97\n98\nFizz\nBuzz";

        assert.strictEqual(codeOutput.language, "PHP");
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
        const code = `<?php
    function caesarEncode( $message, $key ){
        $plaintext = strtolower( $message );
        $ciphertext = "";
        $ascii_a = ord( 'a' );
        $ascii_z = ord( 'z' );
        while( strlen( $plaintext ) ){
            $char = ord( $plaintext );
            if( $char >= $ascii_a && $char <= $ascii_z ){
                $char = ( ( $key + $char - $ascii_a ) % 26 ) + $ascii_a;
            }
            $plaintext = substr( $plaintext, 1 );
            $ciphertext .= chr( $char );
        }
        return $ciphertext;
    }

    echo caesarEncode( "The quick brown fox Jumped over the lazy Dog", 12 ), "\n";
    ?>`;

        const codeOutput = await pestoClient.execute({
            language: "PHP",
            version: "latest",
            code: code
        });

        const expectedOutput = "ftq cguow ndaiz raj vgybqp ahqd ftq xmlk pas";

        assert.strictEqual(codeOutput.language, "PHP");
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
        const code = `<?php
function mergesort($arr){
    if(count($arr) == 1 ) return $arr;
    $mid = count($arr) / 2;
    $left = array_slice($arr, 0, (int) $mid);
    $right = array_slice($arr, (int) $mid);
    $left = mergesort($left);
    $right = mergesort($right);
    return merge($left, $right);
}

function merge($left, $right){
    $res = array();
    while (count($left) > 0 && count($right) > 0){
        if($left[0] > $right[0]){
            $res[] = $right[0];
            $right = array_slice($right , 1);
        }else{
            $res[] = $left[0];
            $left = array_slice($left, 1);
        }
    }
    while (count($left) > 0){
        $res[] = $left[0];
        $left = array_slice($left, 1);
    }
    while (count($right) > 0){
        $res[] = $right[0];
        $right = array_slice($right, 1);
    }
    return $res;
}

$arr = array( 1, 5, 2, 7, 3, 9, 4, 6, 8);
$arr = mergesort($arr);
echo implode(',',$arr);`;

        const codeOutput = await pestoClient.execute({
            language: "PHP",
            version: "latest",
            code: code
        });

        const expectedOutput = "1,2,3,4,5,6,7,8,9";

        assert.strictEqual(codeOutput.language, "PHP");
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
