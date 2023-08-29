# Top-level function will allocate temporary arrays for convenience
function mergesort(A)
    S = similar(A)
    return mergesort!(copy(A), S)
end

# Efficient in-place version
# S is a temporary working (scratch) array
function mergesort!(A, S, n=length(A))
    width = 1
    swapcount = 0
    while width < n
        # A is currently full of sorted runs of length 'width' (starting with width=1)
        for i = 1:2*width:n
            # Merge two sorted lists, left and right:
            # left = A[i:i+width-1], right = A[i+width:i+2*width-1]
            merge!(A, i, min(i+width, n+1), min(i+2*width, n+1), S)
        end
        # Swap the pointers of 'A' and 'S' such that 'A' now contains merged
        # runs of length 2*width.
        S,A = A,S
        swapcount += 1

        # Double the width and continue
        width *= 2
    end
    # Optional, if it is important that 'A' be sorted in-place:
    if isodd(swapcount)
        # If we've swapped A and S an odd number of times, copy 'A' back to 'S'
        # since 'S' will by now refer to the memory initially provided as input
        # array 'A', which the user will expect to have been sorted in-place
        copyto!(S,A)
    end
    return A
end

# Merge two sorted subarrays, left and right:
# left = A[iₗ:iᵣ-1], right = A[iᵣ:iₑ-1]
@inline function merge!(A, iₗ, iᵣ, iₑ, S)
    left, right = iₗ, iᵣ
    @inbounds for n = iₗ:(iₑ-1)
        if (left < iᵣ) && (right >= iₑ || A[left] <= A[right])
            S[n] = A[left]
            left += 1
        else
            S[n] = A[right]
            right += 1
        end
    end
end

v = [2, 8, 3, 10, 13, 6, 11, 9, 19, 15, 5, 4, 12, 14, 20, 1, 17, 18, 16, 7]
sorted = mergesort(v)
for i = 1:length(sorted)
  print(sorted[i], " ")
end
