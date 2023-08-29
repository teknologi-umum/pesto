#include <stdio.h>

int factorial(int n) {
    int result = 1;
    for (int i = 1; i <= n; ++i)
        result *= i;
    return result;
}

int main(void)
{
  printf("%d", factorial(10));

  return 0;
}
