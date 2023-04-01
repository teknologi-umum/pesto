import { test } from "node:test";
import assert from "node:assert";
import { PestoClient } from "./pesto-node/index.mjs";

const pestoClient = new PestoClient({ baseURL: process.env.PESTO_URL, token: "DOGFOOD" });

test("Execute big FizzBuzz", async () => {
    const codeOutput = await pestoClient.execute({
        language: "Lua",
        version: "latest",
        code: "for i = 1, 1000 do\n\tif i % 15 == 0 then\n\t\tprint(\"FizzBuzz\")\n\telseif i % 3 == 0 then\n\t\tprint(\"Fizz\")\n\telseif i % 5 == 0 then\n\t\tprint(\"Buzz\")\n\telse\n\t\tprint(i)\n\tend\nend"
    });

    const expectedOutput = "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz\n31\n32\nFizz\n34\nBuzz\nFizz\n37\n38\nFizz\nBuzz\n41\nFizz\n43\n44\nFizzBuzz\n46\n47\nFizz\n49\nBuzz\nFizz\n52\n53\nFizz\nBuzz\n56\nFizz\n58\n59\nFizzBuzz\n61\n62\nFizz\n64\nBuzz\nFizz\n67\n68\nFizz\nBuzz\n71\nFizz\n73\n74\nFizzBuzz\n76\n77\nFizz\n79\nBuzz\nFizz\n82\n83\nFizz\nBuzz\n86\nFizz\n88\n89\nFizzBuzz\n91\n92\nFizz\n94\nBuzz\nFizz\n97\n98\nFizz\nBuzz\n101\nFizz\n103\n104\nFizzBuzz\n106\n107\nFizz\n109\nBuzz\nFizz\n112\n113\nFizz\nBuzz\n116\nFizz\n118\n119\nFizzBuzz\n121\n122\nFizz\n124\nBuzz\nFizz\n127\n128\nFizz\nBuzz\n131\nFizz\n133\n134\nFizzBuzz\n136\n137\nFizz\n139\nBuzz\nFizz\n142\n143\nFizz\nBuzz\n146\nFizz\n148\n149\nFizzBuzz\n151\n152\nFizz\n154\nBuzz\nFizz\n157\n158\nFizz\nBuzz\n161\nFizz\n163\n164\nFizzBuzz\n166\n167\nFizz\n169\nBuzz\nFizz\n172\n173\nFizz\nBuzz\n176\nFizz\n178\n179\nFizzBuzz\n181\n182\nFizz\n184\nBuzz\nFizz\n187\n188\nFizz\nBuzz\n191\nFizz\n193\n194\nFizzBuzz\n196\n197\nFizz\n199\nBuzz\nFizz\n202\n203\nFizz\nBuzz\n206\nFizz\n208\n209\nFizzBuzz\n211\n212\nFizz\n214\nBuzz\nFizz\n217\n218\nFizz\nBuzz\n221\nFizz\n223\n224\nFizzBuzz\n226\n227\nFizz\n229\nBuzz\nFizz\n232\n233\nFizz\nBuzz\n236\nFizz\n238\n239\nFizzBuzz\n241\n242\nFizz\n244\nBuzz\nFizz\n247\n248\nFizz\nBuzz\n251\nFizz\n253\n254\nFizzBuzz\n256\n257\nFizz\n259\nBuzz\nFizz\n262\n263\nFizz\nBuzz\n266\nFizz\n268\n269\nFizzBuzz\n271\n272\nFizz\n274\nBuzz\nFizz\n277\n278\nFizz\nBuzz\n281\nFizz\n283\n284\nFizzBuzz\n286\n287\nFizz\n289\nBuzz\nFizz\n292\n293\nFizz\nBuzz\n296\nFizz\n298\n299\nFizzBuzz\n301\n302\nFizz\n304\nBuzz\nFizz\n307\n308\nFizz\nBuzz\n311\nFizz\n313\n314\nFizzBuzz\n316\n317\nFizz\n319\nBuzz\nFizz\n322\n323\nFizz\nBuzz\n326\nFizz\n328\n329\nFizzBuzz\n331\n332\nFizz\n334\nBuzz\nFizz\n337\n338\nFizz\nBuzz\n341\nFizz\n343\n344\nFizzBuzz\n346\n347\nFizz\n349\nBuzz\nFizz\n352\n353\nFizz\nBuzz\n356\nFizz\n358\n359\nFizzBuzz\n361\n362\nFizz\n364\nBuzz\nFizz\n367\n368\nFizz\nBuzz\n371\nFizz\n373\n374\nFizzBuzz\n376\n377\nFizz\n379\nBuzz\nFizz\n382\n383\nFizz\nBuzz\n386\nFizz\n388\n389\nFizzBuzz\n391\n392\nFizz\n394\nBuzz\nFizz\n397\n398\nFizz\nBuzz\n401\nFizz\n403\n404\nFizzBuzz\n406\n407\nFizz\n409\nBuzz\nFizz\n412\n413\nFizz\nBuzz\n416\nFizz\n418\n419\nFizzBuzz\n421\n422\nFizz\n424\nBuzz\nFizz\n427\n428\nFizz\nBuzz\n431\nFizz\n433\n434\nFizzBuzz\n436\n437\nFizz\n439\nBuzz\nFizz\n442\n443\nFizz\nBuzz\n446\nFizz\n448\n449\nFizzBuzz\n451\n452\nFizz\n454\nBuzz\nFizz\n457\n458\nFizz\nBuzz\n461\nFizz\n463\n464\nFizzBuzz\n466\n467\nFizz\n469\nBuzz\nFizz\n472\n473\nFizz\nBuzz\n476\nFizz\n478\n479\nFizzBuzz\n481\n482\nFizz\n484\nBuzz\nFizz\n487\n488\nFizz\nBuzz\n491\nFizz\n493\n494\nFizzBuzz\n496\n497\nFizz\n499\nBuzz\nFizz\n502\n503\nFizz\nBuzz\n506\nFizz\n508\n509\nFizzBuzz\n511\n512\nFizz\n514\nBuzz\nFizz\n517\n518\nFizz\nBuzz\n521\nFizz\n523\n524\nFizzBuzz\n526\n527\nFizz\n529\nBuzz\nFizz\n532\n533\nFizz\nBuzz\n536\nFizz\n538\n539\nFizzBuzz\n541\n542\nFizz\n544\nBuzz\nFizz\n547\n548\nFizz\nBuzz\n551\nFizz\n553\n554\nFizzBuzz\n556\n557\nFizz\n559\nBuzz\nFizz\n562\n563\nFizz\nBuzz\n566\nFizz\n568\n569\nFizzBuzz\n571\n572\nFizz\n574\nBuzz\nFizz\n577\n578\nFizz\nBuzz\n581\nFizz\n583\n584\nFizzBuzz\n586\n587\nFizz\n589\nBuzz\nFizz\n592\n593\nFizz\nBuzz\n596\nFizz\n598\n599\nFizzBuzz\n601\n602\nFizz\n604\nBuzz\nFizz\n607\n608\nFizz\nBuzz\n611\nFizz\n613\n614\nFizzBuzz\n616\n617\nFizz\n619\nBuzz\nFizz\n622\n623\nFizz\nBuzz\n626\nFizz\n628\n629\nFizzBuzz\n631\n632\nFizz\n634\nBuzz\nFizz\n637\n638\nFizz\nBuzz\n641\nFizz\n643\n644\nFizzBuzz\n646\n647\nFizz\n649\nBuzz\nFizz\n652\n653\nFizz\nBuzz\n656\nFizz\n658\n659\nFizzBuzz\n661\n662\nFizz\n664\nBuzz\nFizz\n667\n668\nFizz\nBuzz\n671\nFizz\n673\n674\nFizzBuzz\n676\n677\nFizz\n679\nBuzz\nFizz\n682\n683\nFizz\nBuzz\n686\nFizz\n688\n689\nFizzBuzz\n691\n692\nFizz\n694\nBuzz\nFizz\n697\n698\nFizz\nBuzz\n701\nFizz\n703\n704\nFizzBuzz\n706\n707\nFizz\n709\nBuzz\nFizz\n712\n713\nFizz\nBuzz\n716\nFizz\n718\n719\nFizzBuzz\n721\n722\nFizz\n724\nBuzz\nFizz\n727\n728\nFizz\nBuzz\n731\nFizz\n733\n734\nFizzBuzz\n736\n737\nFizz\n739\nBuzz\nFizz\n742\n743\nFizz\nBuzz\n746\nFizz\n748\n749\nFizzBuzz\n751\n752\nFizz\n754\nBuzz\nFizz\n757\n758\nFizz\nBuzz\n761\nFizz\n763\n764\nFizzBuzz\n766\n767\nFizz\n769\nBuzz\nFizz\n772\n773\nFizz\nBuzz\n776\nFizz\n778\n779\nFizzBuzz\n781\n782\nFizz\n784\nBuzz\nFizz\n787\n788\nFizz\nBuzz\n791\nFizz\n793\n794\nFizzBuzz\n796\n797\nFizz\n799\nBuzz\nFizz\n802\n803\nFizz\nBuzz\n806\nFizz\n808\n809\nFizzBuzz\n811\n812\nFizz\n814\nBuzz\nFizz\n817\n818\nFizz\nBuzz\n821\nFizz\n823\n824\nFizzBuzz\n826\n827\nFizz\n829\nBuzz\nFizz\n832\n833\nFizz\nBuzz\n836\nFizz\n838\n839\nFizzBuzz\n841\n842\nFizz\n844\nBuzz\nFizz\n847\n848\nFizz\nBuzz\n851\nFizz\n853\n854\nFizzBuzz\n856\n857\nFizz\n859\nBuzz\nFizz\n862\n863\nFizz\nBuzz\n866\nFizz\n868\n869\nFizzBuzz\n871\n872\nFizz\n874\nBuzz\nFizz\n877\n878\nFizz\nBuzz\n881\nFizz\n883\n884\nFizzBuzz\n886\n887\nFizz\n889\nBuzz\nFizz\n892\n893\nFizz\nBuzz\n896\nFizz\n898\n899\nFizzBuzz\n901\n902\nFizz\n904\nBuzz\nFizz\n907\n908\nFizz\nBuzz\n911\nFizz\n913\n914\nFizzBuzz\n916\n917\nFizz\n919\nBuzz\nFizz\n922\n923\nFizz\nBuzz\n926\nFizz\n928\n929\nFizzBuzz\n931\n932\nFizz\n934\nBuzz\nFizz\n937\n938\nFizz\nBuzz\n941\nFizz\n943\n944\nFizzBuzz\n946\n947\nFizz\n949\nBuzz\nFizz\n952\n953\nFizz\nBuzz\n956\nFizz\n958\n959\nFizzBuzz\n961\n962\nFizz\n964\nBuzz\nFizz\n967\n968\nFizz\nBuzz\n971\nFizz\n973\n974\nFizzBuzz\n976\n977\nFizz\n979\nBuzz\nFizz\n982\n983\nFizz\nBuzz\n986\nFizz\n988\n989\nFizzBuzz\n991\n992\nFizz\n994\nBuzz\nFizz\n997\n998\nFizz\nBuzz\n"
    
    assert.strictEqual(codeOutput.language, "Lua");
    assert.strictEqual(codeOutput.runtime.stdout, expectedOutput);
    assert.strictEqual(codeOutput.runtime.output, expectedOutput);
    assert.strictEqual(codeOutput.runtime.stderr, "");
    assert.strictEqual(codeOutput.runtime.exitCode, 0);
    assert.strictEqual(codeOutput.compile.stdout, "");
    assert.strictEqual(codeOutput.compile.output, "");
    assert.strictEqual(codeOutput.compile.stderr, "");
    assert.strictEqual(codeOutput.compile.exitCode, 0);
});

test("Execute cartesian equation", async () => {
    const codeOutput = await pestoClient.execute({
        language: "Lua",
        version: "latest",
        code: "-- support:\nfunction T(t) return setmetatable(t, {__index=table}) end\ntable.clone = function(t) local s=T{} for k,v in ipairs(t) do s[k]=v end return s end\ntable.reduce = function(t,f,acc) for i=1,#t do acc=f(t[i],acc) end return acc end\n\n-- implementation:\nlocal function cartprod(sets)\n  local temp, prod = T{}, T{}\n  local function descend(depth)\n    for _,v in ipairs(sets[depth]) do\n      temp[depth] = v\n      if (depth==#sets) then prod[#prod+1]=temp:clone() else descend(depth+1) end\n    end\n  end\n  descend(1)\n  return prod\nend\n\n-- demonstration:\ntests = {\n  { {1776, 1789}, {7, 12}, {4, 14, 23}, {0, 1} },\n}\nfor _,test in ipairs(tests) do\n  local cp = cartprod(test)\n  print(\"{\"..cp:reduce(function(t,a) return (a==\"\" and a or a..\", \")..\"(\"..t:concat(\", \")..\")\" end,\"\")..\"}\")\nend"
    });

    const expectedOutput = "{(1776, 7, 4, 0), (1776, 7, 4, 1), (1776, 7, 14, 0), (1776, 7, 14, 1), (1776, 7, 23, 0), (1776, 7, 23, 1), (1776, 12, 4, 0), (1776, 12, 4, 1), (1776, 12, 14, 0), (1776, 12, 14, 1), (1776, 12, 23, 0), (1776, 12, 23, 1), (1789, 7, 4, 0), (1789, 7, 4, 1), (1789, 7, 14, 0), (1789, 7, 14, 1), (1789, 7, 23, 0), (1789, 7, 23, 1), (1789, 12, 4, 0), (1789, 12, 4, 1), (1789, 12, 14, 0), (1789, 12, 14, 1), (1789, 12, 23, 0), (1789, 12, 23, 1)}\n";

    assert.strictEqual(codeOutput.language, "Lua");
    assert.strictEqual(codeOutput.runtime.stdout, expectedOutput);
    assert.strictEqual(codeOutput.runtime.output, expectedOutput);
    assert.strictEqual(codeOutput.runtime.stderr, "");
    assert.strictEqual(codeOutput.runtime.exitCode, 0);
    assert.strictEqual(codeOutput.compile.stdout, "");
    assert.strictEqual(codeOutput.compile.output, "");
    assert.strictEqual(codeOutput.compile.stderr, "");
    assert.strictEqual(codeOutput.compile.exitCode, 0);
});

test("Execute with Error", async () => {
    const codeOutput = await pestoClient.execute({
        language: "Lua",
        version: "latest",
        code: "Lorem ipsum dolot sit amet!!!"
    });

    const expectedOutput = "/opt/lua/5.4/bin/lua: code0.lua:1: syntax error near 'ipsum'\n";

    assert.strictEqual(codeOutput.language, "Lua");
    assert.strictEqual(codeOutput.runtime.stdout, "");
    assert.strictEqual(codeOutput.runtime.output, expectedOutput);
    assert.strictEqual(codeOutput.runtime.stderr, expectedOutput);
    assert.strictEqual(codeOutput.runtime.exitCode, 1);
    assert.strictEqual(codeOutput.compile.stdout, "");
    assert.strictEqual(codeOutput.compile.output, "");
    assert.strictEqual(codeOutput.compile.stderr, "");
    assert.strictEqual(codeOutput.compile.exitCode, 0);
});