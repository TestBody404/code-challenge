package main

import "fmt"

/*
Complexity Table:

| **Approach**       | **Time Complexity** | **Space Complexity** | **Efficiency** |
|---------------------|---------------------|-----------------------|----------------|
| Iterative           | O(n)               | O(1)                 | Moderate       |
| Mathematical Formula| O(1)               | O(1)                 | High           |
| Recursive           | O(n)               | O(n)                 | Low            |
*/

func sumToNIterative(n int) int {
	sum := 0
	for i := 1; i <= n; i++ {
		sum += i
	}
	return sum
}

func sumToNFormula(n int) int {
	return n * (n + 1) / 2
}

func sumToNRecursive(n int) int {
	if n == 0 {
		return 0
	}
	return n + sumToNRecursive(n-1)
}

func main() {
	n := 5

	fmt.Println("Iterative approach:", sumToNIterative(n))
	fmt.Println("Mathematical formula approach:", sumToNFormula(n))
	fmt.Println("Recursive approach:", sumToNRecursive(n))
}