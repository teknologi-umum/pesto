package main

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
}
