#include <stdio.h>
#include <string.h>
#include <math.h>
#include <errno.h>
#include <stdlib.h>

#define true (1)
#define false (0)
typedef unsigned char bool;

#define MAX 10000000

/* to_int: converts a character array to an integer, returns -1 on error, -2 on out of limits */
int to_int(char* inp) {
    int len = strlen(inp);
    unsigned int out = 0, prev_out = 0, mult = 1;

    if (len == 0) {
        return -1;
    }

    for (int i = len - 1; i >= 0; i--) {
        if (inp[i] < 48 || inp[i] > 57) {
            return -1;
        }

        prev_out = out;
        out += (inp[i] - 48) * mult;
        mult *= 10;

        /* detect wrapping */
        if (out < prev_out) {
            return -2;
        }
    }

    return out;
}

int main() {
    int max = 100;

    /* Set up the list */
    bool *list = NULL;
    if ((list = malloc(max)) == NULL) {
        fprintf(stderr, "Error! Could not allocate the requested amount of memory: %s\nExiting...\n", strerror(errno));
        return EXIT_FAILURE;
    }

    memset(list, true, max);

    int max_sqrt = sqrt(max);

    for (int i = 2; i <= max_sqrt; i++) {
        if (list[i]) {
            for (int j = i*i; j <= max; j += i) {
                list[j] = false;
            }
        }
    }

    for (int i = 2; i < max; i++) {
        if (list[i]) {
            printf("%d ", i);
        }
    }

    free(list);

    return 0;
}
