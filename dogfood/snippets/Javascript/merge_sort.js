function mergeSort(v) {
    if (v.length <= 1) {
        return v;
    }

    let m = Math.floor(v.length / 2);
    let l = mergeSort(v.slice(0, m));
    let r = mergeSort(v.slice(m));
    return merge(l, r);

    function merge(a, b) {
        let i = 0, j = 0;
        let n = a.length + b.length;
        let c = [];
        while (c.length < n) {
            if (i < a.length && (j >= b.length || a[i] < b[j])) {
                c.push(a[i++]);
            } else {
                c.push(b[j++]);
            }
        }
        return c;
    }
}

console.log(mergeSort([2, 8, 3, 10, 13, 6, 11, 9, 19, 15, 5, 4, 12, 14, 20, 1, 17, 18, 16, 7]).join(" "));
