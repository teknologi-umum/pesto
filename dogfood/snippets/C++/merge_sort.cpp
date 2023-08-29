#include <iostream>
#include <iterator>
#include <algorithm> // for std::inplace_merge
#include <functional> // for std::less

template<typename RandomAccessIterator, typename Order>
    void mergesort(RandomAccessIterator first, RandomAccessIterator last, Order order)
{
    if (last - first > 1)
    {
    RandomAccessIterator middle = first + (last - first) / 2;
    mergesort(first, middle, order);
    mergesort(middle, last, order);
    std::inplace_merge(first, middle, last, order);
    }
}

template<typename RandomAccessIterator>
    void mergesort(RandomAccessIterator first, RandomAccessIterator last)
{
    mergesort(first, last, std::less<typename std::iterator_traits<RandomAccessIterator>::value_type>());
}

int main() {
    int array[] = {2, 8, 3, 10, 13, 6, 11, 9, 19, 15, 5, 4, 12, 14, 20, 1, 17, 18, 16, 7};

    // Sort the array using mergesort.
    mergesort(array, array + sizeof(array) / sizeof(array[0]));

    // Print the sorted array.
    for (int i = 0; i < 20; i++) {
        std::cout << array[i] << " ";
    }
    std::cout << std::endl;

    return 0;
}
