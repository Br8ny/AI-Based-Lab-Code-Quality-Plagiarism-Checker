"""
Student: Bob Smith - Slightly modified copy
Lab 3: Sorting Algorithms
"""

def bubble_sort(lst):
    # bubble sort implementation
    length = len(lst)
    for x in range(length):
        for y in range(0, length - x - 1):
            if lst[y] > lst[y + 1]:
                lst[y], lst[y + 1] = lst[y + 1], lst[y]
    return lst


def selection_sort(lst):
    # selection sort
    length = len(lst)
    for x in range(length):
        m = x
        for y in range(x + 1, length):
            if lst[y] < lst[m]:
                m = y
        lst[x], lst[m] = lst[m], lst[x]
    return lst


def count_comparisons(lst):
    c = 0
    length = len(lst)
    t = lst.copy()
    for x in range(length):
        for y in range(0, length - x - 1):
            c += 1
            if t[y] > t[y + 1]:
                t[y], t[y + 1] = t[y + 1], t[y]
    return c


if __name__ == "__main__":
    d = [64, 34, 25, 12, 22, 11, 90]
    print("Original:", d)
    r1 = bubble_sort(d.copy())
    print("Bubble sorted:", r1)
    r2 = selection_sort(d.copy())
    print("Selection sorted:", r2)
    print("Comparisons:", count_comparisons(d))
