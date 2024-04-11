function factorial(n::Int64)
        if n < 0
            throw(ArgumentError("Number must be non-negative"))
        end

        result = 1
        while n > 1
            result *= n
            n -= 1
        end

        return result
end

println(factorial(10))
