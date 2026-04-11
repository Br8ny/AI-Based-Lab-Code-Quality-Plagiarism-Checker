def generate_fibonacci(n):
    """Generates the first n numbers of the Fibonacci sequence."""
    sequence = []
    a, b = 0, 1
    for _ in range(n):
        sequence.append(a)
        a, b = b, a + b
    return sequence

def main():
    # Test with 10 numbers
    limit = 10
    result = generate_fibonacci(limit)
    
    print(f"First {limit} Fibonacci numbers:")
    print(result)

if __name__ == "__main__":
    main()