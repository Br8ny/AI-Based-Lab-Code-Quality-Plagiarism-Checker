"""
Student: Alice Johnson - Original submission
Lab 3: Sorting Algorithms
"""

def bubble_sort(arr):
    """Sort a list using bubble sort algorithm."""
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr


def selection_sort(arr):
    """Sort a list using selection sort algorithm."""
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr


def count_comparisons(arr):
    """Count comparisons needed for bubble sort."""
    count = 0
    n = len(arr)
    temp = arr.copy()
    for i in range(n):
        for j in range(0, n - i - 1):
            count += 1
            if temp[j] > temp[j + 1]:
                temp[j], temp[j + 1] = temp[j + 1], temp[j]
    return count


if __name__ == "__main__":
    data = [64, 34, 25, 12, 22, 11, 90]
    print("Original:", data)
    sorted_data = bubble_sort(data.copy())
    print("Bubble sorted:", sorted_data)
    selected = selection_sort(data.copy())
    print("Selection sorted:", selected)
    print("Comparisons:", count_comparisons(data))
