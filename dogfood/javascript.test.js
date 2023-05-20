import {it, describe} from "node:test";
import assert from "node:assert";
import {PestoClient} from "@teknologi-umum/pesto";

const pestoClient = new PestoClient({
    baseURL: process.env.PESTO_URL,
    token: "DOGFOOD"
});

describe("Javascript", {concurrency: true}, () => {
    it("Execute a 1500 for loop", async () => {
        const codeOutput = await pestoClient.execute({
            language: "Javascript",
            version: "latest",
            code: "for (let i = 0; i < 1500; i++) { console.log(i); }"
        });

        const expectedOutput = "0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15\n16\n17\n18\n19\n20\n21\n22\n23\n24\n25\n26\n27\n28\n29\n30\n31\n32\n33\n34\n35\n36\n37\n38\n39\n40\n41\n42\n43\n44\n45\n46\n47\n48\n49\n50\n51\n52\n53\n54\n55\n56\n57\n58\n59\n60\n61\n62\n63\n64\n65\n66\n67\n68\n69\n70\n71\n72\n73\n74\n75\n76\n77\n78\n79\n80\n81\n82\n83\n84\n85\n86\n87\n88\n89\n90\n91\n92\n93\n94\n95\n96\n97\n98\n99\n100\n101\n102\n103\n104\n105\n106\n107\n108\n109\n110\n111\n112\n113\n114\n115\n116\n117\n118\n119\n120\n121\n122\n123\n124\n125\n126\n127\n128\n129\n130\n131\n132\n133\n134\n135\n136\n137\n138\n139\n140\n141\n142\n143\n144\n145\n146\n147\n148\n149\n150\n151\n152\n153\n154\n155\n156\n157\n158\n159\n160\n161\n162\n163\n164\n165\n166\n167\n168\n169\n170\n171\n172\n173\n174\n175\n176\n177\n178\n179\n180\n181\n182\n183\n184\n185\n186\n187\n188\n189\n190\n191\n192\n193\n194\n195\n196\n197\n198\n199\n200\n201\n202\n203\n204\n205\n206\n207\n208\n209\n210\n211\n212\n213\n214\n215\n216\n217\n218\n219\n220\n221\n222\n223\n224\n225\n226\n227\n228\n229\n230\n231\n232\n233\n234\n235\n236\n237\n238\n239\n240\n241\n242\n243\n244\n245\n246\n247\n248\n249\n250\n251\n252\n253\n254\n255\n256\n257\n258\n259\n260\n261\n262\n263\n264\n265\n266\n267\n268\n269\n270\n271\n272\n273\n274\n275\n276\n277\n278\n279\n280\n281\n282\n283\n284\n285\n286\n287\n288\n289\n290\n291\n292\n293\n294\n295\n296\n297\n298\n299\n300\n301\n302\n303\n304\n305\n306\n307\n308\n309\n310\n311\n312\n313\n314\n315\n316\n317\n318\n319\n320\n321\n322\n323\n324\n325\n326\n327\n328\n329\n330\n331\n332\n333\n334\n335\n336\n337\n338\n339\n340\n341\n342\n343\n344\n345\n346\n347\n348\n349\n350\n351\n352\n353\n354\n355\n356\n357\n358\n359\n360\n361\n362\n363\n364\n365\n366\n367\n368\n369\n370\n371\n372\n373\n374\n375\n376\n377\n378\n379\n380\n381\n382\n383\n384\n385\n386\n387\n388\n389\n390\n391\n392\n393\n394\n395\n396\n397\n398\n399\n400\n401\n402\n403\n404\n405\n406\n407\n408\n409\n410\n411\n412\n413\n414\n415\n416\n417\n418\n419\n420\n421\n422\n423\n424\n425\n426\n427\n428\n429\n430\n431\n432\n433\n434\n435\n436\n437\n438\n439\n440\n441\n442\n443\n444\n445\n446\n447\n448\n449\n450\n451\n452\n453\n454\n455\n456\n457\n458\n459\n460\n461\n462\n463\n464\n465\n466\n467\n468\n469\n470\n471\n472\n473\n474\n475\n476\n477\n478\n479\n480\n481\n482\n483\n484\n485\n486\n487\n488\n489\n490\n491\n492\n493\n494\n495\n496\n497\n498\n499\n500\n501\n502\n503\n504\n505\n506\n507\n508\n509\n510\n511\n512\n513\n514\n515\n516\n517\n518\n519\n520\n521\n522\n523\n524\n525\n526\n527\n528\n529\n530\n531\n532\n533\n534\n535\n536\n537\n538\n539\n540\n541\n542\n543\n544\n545\n546\n547\n548\n549\n550\n551\n552\n553\n554\n555\n556\n557\n558\n559\n560\n561\n562\n563\n564\n565\n566\n567\n568\n569\n570\n571\n572\n573\n574\n575\n576\n577\n578\n579\n580\n581\n582\n583\n584\n585\n586\n587\n588\n589\n590\n591\n592\n593\n594\n595\n596\n597\n598\n599\n600\n601\n602\n603\n604\n605\n606\n607\n608\n609\n610\n611\n612\n613\n614\n615\n616\n617\n618\n619\n620\n621\n622\n623\n624\n625\n626\n627\n628\n629\n630\n631\n632\n633\n634\n635\n636\n637\n638\n639\n640\n641\n642\n643\n644\n645\n646\n647\n648\n649\n650\n651\n652\n653\n654\n655\n656\n657\n658\n659\n660\n661\n662\n663\n664\n665\n666\n667\n668\n669\n670\n671\n672\n673\n674\n675\n676\n677\n678\n679\n680\n681\n682\n683\n684\n685\n686\n687\n688\n689\n690\n691\n692\n693\n694\n695\n696\n697\n698\n699\n700\n701\n702\n703\n704\n705\n706\n707\n708\n709\n710\n711\n712\n713\n714\n715\n716\n717\n718\n719\n720\n721\n722\n723\n724\n725\n726\n727\n728\n729\n730\n731\n732\n733\n734\n735\n736\n737\n738\n739\n740\n741\n742\n743\n744\n745\n746\n747\n748\n749\n750\n751\n752\n753\n754\n755\n756\n757\n758\n759\n760\n761\n762\n763\n764\n765\n766\n767\n768\n769\n770\n771\n772\n773\n774\n775\n776\n777\n778\n779\n780\n781\n782\n783\n784\n785\n786\n787\n788\n789\n790\n791\n792\n793\n794\n795\n796\n797\n798\n799\n800\n801\n802\n803\n804\n805\n806\n807\n808\n809\n810\n811\n812\n813\n814\n815\n816\n817\n818\n819\n820\n821\n822\n823\n824\n825\n826\n827\n828\n829\n830\n831\n832\n833\n834\n835\n836\n837\n838\n839\n840\n841\n842\n843\n844\n845\n846\n847\n848\n849\n850\n851\n852\n853\n854\n855\n856\n857\n858\n859\n860\n861\n862\n863\n864\n865\n866\n867\n868\n869\n870\n871\n872\n873\n874\n875\n876\n877\n878\n879\n880\n881\n882\n883\n884\n885\n886\n887\n888\n889\n890\n891\n892\n893\n894\n895\n896\n897\n898\n899\n900\n901\n902\n903\n904\n905\n906\n907\n908\n909\n910\n911\n912\n913\n914\n915\n916\n917\n918\n919\n920\n921\n922\n923\n924\n925\n926\n927\n928\n929\n930\n931\n932\n933\n934\n935\n936\n937\n938\n939\n940\n941\n942\n943\n944\n945\n946\n947\n948\n949\n950\n951\n952\n953\n954\n955\n956\n957\n958\n959\n960\n961\n962\n963\n964\n965\n966\n967\n968\n969\n970\n971\n972\n973\n974\n975\n976\n977\n978\n979\n980\n981\n982\n983\n984\n985\n986\n987\n988\n989\n990\n991\n992\n993\n994\n995\n996\n997\n998\n999\n1000\n1001\n1002\n1003\n1004\n1005\n1006\n1007\n1008\n1009\n1010\n1011\n1012\n1013\n1014\n1015\n1016\n1017\n1018\n1019\n1020\n1021\n1022\n1023\n1024\n1025\n1026\n1027\n1028\n1029\n1030\n1031\n1032\n1033\n1034\n1035\n1036\n1037\n1038\n1039\n1040\n1041\n1042\n1043\n1044\n1045\n1046\n1047\n1048\n1049\n1050\n1051\n1052\n1053\n1054\n1055\n1056\n1057\n1058\n1059\n1060\n1061\n1062\n1063\n1064\n1065\n1066\n1067\n1068\n1069\n1070\n1071\n1072\n1073\n1074\n1075\n1076\n1077\n1078\n1079\n1080\n1081\n1082\n1083\n1084\n1085\n1086\n1087\n1088\n1089\n1090\n1091\n1092\n1093\n1094\n1095\n1096\n1097\n1098\n1099\n1100\n1101\n1102\n1103\n1104\n1105\n1106\n1107\n1108\n1109\n1110\n1111\n1112\n1113\n1114\n1115\n1116\n1117\n1118\n1119\n1120\n1121\n1122\n1123\n1124\n1125\n1126\n1127\n1128\n1129\n1130\n1131\n1132\n1133\n1134\n1135\n1136\n1137\n1138\n1139\n1140\n1141\n1142\n1143\n1144\n1145\n1146\n1147\n1148\n1149\n1150\n1151\n1152\n1153\n1154\n1155\n1156\n1157\n1158\n1159\n1160\n1161\n1162\n1163\n1164\n1165\n1166\n1167\n1168\n1169\n1170\n1171\n1172\n1173\n1174\n1175\n1176\n1177\n1178\n1179\n1180\n1181\n1182\n1183\n1184\n1185\n1186\n1187\n1188\n1189\n1190\n1191\n1192\n1193\n1194\n1195\n1196\n1197\n1198\n1199\n1200\n1201\n1202\n1203\n1204\n1205\n1206\n1207\n1208\n1209\n1210\n1211\n1212\n1213\n1214\n1215\n1216\n1217\n1218\n1219\n1220\n1221\n";

        assert.strictEqual(codeOutput.language, "Javascript");
        assert.strictEqual(codeOutput.runtime.stdout, expectedOutput);
        assert.strictEqual(codeOutput.runtime.output, expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
    });

    it("Execute cartesian equation", async () => {
        const codeOutput = await pestoClient.execute({
            language: "Javascript",
            version: "latest",
            code: "function cartesian(m){\n  if(!m.length)return[[]];\n  let tails=cartesian(m.slice(1));\n  return(m[0].flatMap(h=>tails.map(t=>[h].concat(t))));\n}\n\nconsole.log(cartesian([[1, 2, 3, 4], [3, 4, 5, 6], [5, 6, 7, 8]]).toString())"
        });

        const expectedOutput = "1,3,5,1,3,6,1,3,7,1,3,8,1,4,5,1,4,6,1,4,7,1,4,8,1,5,5,1,5,6,1,5,7,1,5,8,1,6,5,1,6,6,1,6,7,1,6,8,2,3,5,2,3,6,2,3,7,2,3,8,2,4,5,2,4,6,2,4,7,2,4,8,2,5,5,2,5,6,2,5,7,2,5,8,2,6,5,2,6,6,2,6,7,2,6,8,3,3,5,3,3,6,3,3,7,3,3,8,3,4,5,3,4,6,3,4,7,3,4,8,3,5,5,3,5,6,3,5,7,3,5,8,3,6,5,3,6,6,3,6,7,3,6,8,4,3,5,4,3,6,4,3,7,4,3,8,4,4,5,4,4,6,4,4,7,4,4,8,4,5,5,4,5,6,4,5,7,4,5,8,4,6,5,4,6,6,4,6,7,4,6,8\n";

        assert.strictEqual(codeOutput.language, "Javascript");
        assert.strictEqual(codeOutput.runtime.stdout, expectedOutput);
        assert.strictEqual(codeOutput.runtime.output, expectedOutput);
        assert.strictEqual(codeOutput.runtime.stderr, "");
        assert.strictEqual(codeOutput.runtime.exitCode, 0);
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
    });

    it("Execute with SyntaxError", async () => {
        const codeOutput = await pestoClient.execute({
            language: "Javascript",
            version: "latest",
            code: "Lorem ipsum dolot sit amet!!!"
        });

        const expectedOutput = "SyntaxError: Unexpected identifier";

        assert.strictEqual(codeOutput.language, "Javascript");
        assert.strictEqual(codeOutput.runtime.stdout, "");
        assert.ok(codeOutput.runtime.output.includes(expectedOutput));
        assert.ok(codeOutput.runtime.stderr.includes(expectedOutput));
        assert.strictEqual(codeOutput.runtime.exitCode, 1);
        assert.strictEqual(codeOutput.compile.stdout, "");
        assert.strictEqual(codeOutput.compile.output, "");
        assert.strictEqual(codeOutput.compile.stderr, "");
        assert.strictEqual(codeOutput.compile.exitCode, 0);
    });

    it("FizzBuzz", async () => {
        const code = `let i, output;
    for (i = 1; i < 101; i += 1) {
        output = '';
        if (!(i % 3)) { output += 'Fizz'; }
        if (!(i % 5)) { output += 'Buzz'; }
        console.log(output || i);
    }`;

        const codeOutput = await pestoClient.execute({
            language: "Javascript",
            version: "latest",
            code: code
        });

        const expectedOutput = "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz\n31\n32\nFizz\n34\nBuzz\nFizz\n37\n38\nFizz\nBuzz\n41\nFizz\n43\n44\nFizzBuzz\n46\n47\nFizz\n49\nBuzz\nFizz\n52\n53\nFizz\nBuzz\n56\nFizz\n58\n59\nFizzBuzz\n61\n62\nFizz\n64\nBuzz\nFizz\n67\n68\nFizz\nBuzz\n71\nFizz\n73\n74\nFizzBuzz\n76\n77\nFizz\n79\nBuzz\nFizz\n82\n83\nFizz\nBuzz\n86\nFizz\n88\n89\nFizzBuzz\n91\n92\nFizz\n94\nBuzz\nFizz\n97\n98\nFizz\nBuzz";

        assert.strictEqual(codeOutput.language, "Javascript");
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
