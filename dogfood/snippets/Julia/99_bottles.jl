i = 99
while i > 0
    println("$i bottles of beer on the wall, $i bottles of beer.")
    println("Take one down, pass it around, $(i-1) bottles of beer on the wall\n")
    global i -= 1
end
