"""
Student: Carol Davis - Independent implementation with good style
Lab 3: Sorting Algorithms
"""

from typing import List


def bubble_sort(numbers: List[int]) -> List[int]:
    """
    Perform bubble sort on a list of integers.
    Time complexity: O(n^2), Space complexity: O(1)
    """
    result = numbers.copy()
    total_elements = len(result)

    for pass_num in range(total_elements - 1):
        # Flag to detect early termination
        swapped = False
        for compare_idx in range(total_elements - pass_num - 1):
            if result[compare_idx] > result[compare_idx + 1]:
                result[compare_idx], result[compare_idx + 1] = (
                    result[compare_idx + 1], result[compare_idx]
                )
                swapped = True
        if not swapped:
            break  # Already sorted

    return result


def insertion_sort(numbers: List[int]) -> List[int]:
    """
    Perform insertion sort on a list of integers.
    More efficient for nearly-sorted data than bubble sort.
    """
    result = numbers.copy()
    for current_pos in range(1, len(result)):
        current_value = result[current_pos]
        insert_pos = current_pos

        while insert_pos > 0 and result[insert_pos - 1] > current_value:
            result[insert_pos] = result[insert_pos - 1]
            insert_pos -= 1

        result[insert_pos] = current_value

    return result


def merge_sort(numbers: List[int]) -> List[int]:
    """
    Recursive merge sort — O(n log n) time, O(n) space.
    """
    if len(numbers) <= 1:
        return numbers

    mid = len(numbers) // 2
    left_half = merge_sort(numbers[:mid])
    right_half = merge_sort(numbers[mid:])

    return _merge(left_half, right_half)


def _merge(left: List[int], right: List[int]) -> List[int]:
    """Merge two sorted lists into one sorted list."""
    merged = []
    left_idx, right_idx = 0, 0

    while left_idx < len(left) and right_idx < len(right):
        if left[left_idx] <= right[right_idx]:
            merged.append(left[left_idx])
            left_idx += 1
        else:
            merged.append(right[right_idx])
            right_idx += 1

    merged.extend(left[left_idx:])
    merged.extend(right[right_idx:])
    return merged


if __name__ == "__main__":
    test_data = [64, 34, 25, 12, 22, 11, 90]

    print(f"Input:           {test_data}")
    print(f"Bubble sort:     {bubble_sort(test_data)}")
    print(f"Insertion sort:  {insertion_sort(test_data)}")
    print(f"Merge sort:      {merge_sort(test_data)}")
