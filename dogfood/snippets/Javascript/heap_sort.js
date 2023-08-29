function heapSort(arr) {
    heapify(arr)
    end = arr.length - 1
    while (end > 0) {
        [arr[end], arr[0]] = [arr[0], arr[end]]
        end--
        siftDown(arr, 0, end)
    }
}

function heapify(arr) {
    start = Math.floor(arr.length/2) - 1

    while (start >= 0) {
        siftDown(arr, start, arr.length - 1)
        start--
    }
}

function siftDown(arr, startPos, endPos) {
    let rootPos = startPos

    while (rootPos * 2 + 1 <= endPos) {
        childPos = rootPos * 2 + 1
        if (childPos + 1 <= endPos && arr[childPos] < arr[childPos + 1]) {
            childPos++
        }
        if (arr[rootPos] < arr[childPos]) {
            [arr[rootPos], arr[childPos]] = [arr[childPos], arr[rootPos]]
            rootPos = childPos
        } else {
            return
        }
    }
}

const arr = [2, 8, 3, 10, 13, 6, 11, 9, 19, 15, 5, 4, 12, 14, 20, 1, 17, 18, 16, 7];
heapSort(arr);
console.log(arr.join(" "));
