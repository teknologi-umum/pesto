#include <iostream>
using std::cout;

//iteration with while
long long int factorial(long long int n)
{
    long long int r = 1;
    while(1<n)
        r *= n--;
    return r;
}

int main() {
    cout << factorial(10);
    return 0;
}
