def merge(x, y):
    if x == []: return y
    if y == []: return x
    return [x[0]] + merge(x[1:], y) if x[0] < y[0] else [y[0]] + merge(x, y[1:])


def sort(a, n):
    m = n // 2
    return a if n <= 1 else merge(sort(a[:m], m), sort(a[m:], n - m))


a = [
    17,
    12,
    19,
    10,
    15,
    8,
    2,
    16,
    5,
    14,
    18,
    6,
    7,
    13,
    4,
    1,
    9,
    11,
    3,
    20,
]
print(" ".join(str(n) for n in sort(a, len(a))))
