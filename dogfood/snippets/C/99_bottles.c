#include <stdio.h>

int main(void)
{
  int n;

  for(n = 99; n > 0; n--) {
    printf(
      "%d bottles of beer on the wall, %d bottles of beer.\n"
      "Take one down, pass it around, %d bottles of beer on the wall\n\n",
      n, n, n - 1);
  }

  return 0;
}
