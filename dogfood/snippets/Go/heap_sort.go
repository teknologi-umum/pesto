package main

import (
	"container/heap"
	"fmt"
	"sort"
)

type HeapHelper struct {
	container sort.Interface
	length    int
}

func (self HeapHelper) Len() int { return self.length }

// We want a max-heap, hence reverse the comparison
func (self HeapHelper) Less(i, j int) bool { return self.container.Less(j, i) }
func (self HeapHelper) Swap(i, j int)      { self.container.Swap(i, j) }

// this should not be called
func (self *HeapHelper) Push(x interface{}) { panic("impossible") }
func (self *HeapHelper) Pop() interface{} {
	self.length--
	return nil // return value not used
}

func heapSort(a sort.Interface) {
	helper := HeapHelper{a, a.Len()}
	heap.Init(&helper)
	for helper.length > 0 {
		heap.Pop(&helper)
	}
}

func main() {
	a := []int{2, 8, 3, 10, 13, 6, 11, 9, 19, 15, 5, 4, 12, 14, 20, 1, 17, 18, 16, 7}
	heapSort(sort.IntSlice(a))
	for i := 0; i < len(a); i++ {
		fmt.Printf("%d ", a[i])
	}
}
