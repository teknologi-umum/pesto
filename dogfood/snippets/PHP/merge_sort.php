<?php
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

$arr = array(
    17,
    12,
    19,
    10,
    15,
    8,
    2,
    16,
    5,
    1,
    14,
    18,
    6,
    7,
    13,
    4,
    9,
    11,
    3,
    20);
$arr = mergesort($arr);
echo implode(' ',$arr);
