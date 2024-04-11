verse = [[%i bottles of beer on the wall, %i bottles of beer.
Take one down, pass it around, %i bottles of beer on the wall
]]

for i = 99, 1, -1 do
    print(verse:format(i, i, i-1))
end
