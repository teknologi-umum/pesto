class Array
  def heapsort
    self.dup.heapsort!
  end

  def heapsort!
    # in pseudo-code, heapify only called once, so inline it here
    ((length - 2) / 2).downto(0) {|start| siftdown(start, length - 1)}

    # "end" is a ruby keyword
    (length - 1).downto(1) do |end_|
      self[end_], self[0] = self[0], self[end_]
      siftdown(0, end_ - 1)
    end
    self
  end

  def siftdown(start, end_)
    root = start
    loop do
      child = root * 2 + 1
      break if child > end_
      if child + 1 <= end_ and self[child] < self[child + 1]
        child += 1
      end
      if self[root] < self[child]
        self[root], self[child] = self[child], self[root]
        root = child
      else
        break
      end
    end
  end
end

arr = [
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
      20
  ]

puts arr.heapsort.join(" ")
