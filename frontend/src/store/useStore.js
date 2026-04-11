import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Rich Mock Demo Data ────────────────────────────────────────────────────
const DEMO_STUDENTS = [
  'alice_johnson', 'bob_smith', 'carol_davis',
  'david_lee', 'emma_wilson', 'frank_brown'
]

const DEMO_CODE = {
  alice_johnson: `"""Student: Alice Johnson — Original submission\nLab 3: Sorting Algorithms"""

def bubble_sort(arr):
    """Sort using bubble sort. Time O(n^2)"""
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

def selection_sort(arr):
    """Sort using selection sort."""
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

def count_comparisons(arr):
    """Count total comparisons in bubble sort."""
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
    print("Bubble sorted:", bubble_sort(data.copy()))
    print("Selection sorted:", selection_sort(data.copy()))
    print("Comparisons:", count_comparisons(data))
`,

  bob_smith: `"""Student: Bob Smith — Modified copy\nLab 3: Sorting Algorithms"""

def bubble_sort(lst):
    # bubble sort
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
    print("Bubble sorted:", bubble_sort(d.copy()))
    print("Selection sorted:", selection_sort(d.copy()))
    print("Comparisons:", count_comparisons(d))
`,

  carol_davis: `"""Student: Carol Davis — Independent clean implementation
Lab 3: Sorting Algorithms
"""
from typing import List

def bubble_sort(numbers: List[int]) -> List[int]:
    """Bubble sort with early termination. O(n^2) worst, O(n) best."""
    result = numbers.copy()
    n = len(result)
    for pass_num in range(n - 1):
        swapped = False
        for i in range(n - pass_num - 1):
            if result[i] > result[i + 1]:
                result[i], result[i + 1] = result[i + 1], result[i]
                swapped = True
        if not swapped:
            break  # early exit
    return result

def insertion_sort(numbers: List[int]) -> List[int]:
    """Insertion sort — efficient for small / nearly-sorted data."""
    result = numbers.copy()
    for i in range(1, len(result)):
        key = result[i]
        j = i - 1
        while j >= 0 and result[j] > key:
            result[j + 1] = result[j]
            j -= 1
        result[j + 1] = key
    return result

def merge_sort(numbers: List[int]) -> List[int]:
    """Merge sort — O(n log n) guaranteed."""
    if len(numbers) <= 1:
        return numbers
    mid = len(numbers) // 2
    left = merge_sort(numbers[:mid])
    right = merge_sort(numbers[mid:])
    return _merge(left, right)

def _merge(left: List[int], right: List[int]) -> List[int]:
    result, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:]); result.extend(right[j:])
    return result

if __name__ == "__main__":
    data = [64, 34, 25, 12, 22, 11, 90]
    print(f"Bubble:    {bubble_sort(data)}")
    print(f"Insertion: {insertion_sort(data)}")
    print(f"Merge:     {merge_sort(data)}")
`,

  david_lee: `"""Student: David Lee — Poor quality
Lab 3"""
import time

def s(a):
    n=len(a)
    for i in range(n):
        for j in range(0,n-i-1):
            if a[j]>a[j+1]:
                a[j],a[j+1]=a[j+1],a[j]
    return a

def ss(a):
    n=len(a)
    for i in range(n):
        m=i
        for j in range(i+1,n):
            if a[j]<a[m]:
                m=j
        a[i],a[m]=a[m],a[i]
    return a

def f(a):
    x=None
    b=True
    while b==True:
        b=False
        for i in range(len(a)-1):
            if a[i]>a[i+1]:
                a[i],a[i+1]=a[i+1],a[i]
                b=True
    return a

if __name__=="__main__":
    d=[5,3,8,1,9,2]
    print(s(d.copy()))
    print(ss(d.copy()))
    print(f(d.copy()))
`,

  emma_wilson: `"""Student: Emma Wilson — Good quality with some issues
Lab 3: Sorting Algorithms
"""

def bubble_sort(data):
    """Bubble sort implementation."""
    arr = data[:]
    n = len(arr)
    for i in range(n):
        for j in range(n - 1 - i):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

def quick_sort(arr, low=0, high=None):
    """Quick sort with Lomuto partition scheme."""
    if high is None:
        high = len(arr) - 1
        arr = arr[:]
    if low < high:
        pivot_idx = _partition(arr, low, high)
        quick_sort(arr, low, pivot_idx - 1)
        quick_sort(arr, pivot_idx + 1, high)
    return arr

def _partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i + 1

try:
    data = [3, 6, 8, 10, 1, 2, 1]
    print("Bubble:", bubble_sort(data))
    print("Quick:", quick_sort(data[:]))
except:
    pass
`,

  frank_brown: `"""Student: Frank Brown — Partial submission
Lab 3"""

def sort_list(arr):
    # using python built-in sort
    return sorted(arr)

def my_sort(arr):
    n = len(arr)
    for i in range(n-1):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

# TODO: add more sorting algorithms
# TODO: add complexity analysis

data = [10, 5, 8, 3, 2]
print(sort_list(data))
print(my_sort(data[:]))
`
}

const DEMO_RESULTS = {
  students: DEMO_STUDENTS,
  similarity_matrix: {
    'alice_johnson||bob_smith':   { ast: 0.88, token: 0.82, embedding: 0.85, combined: 0.85 },
    'alice_johnson||carol_davis': { ast: 0.45, token: 0.38, embedding: 0.42, combined: 0.42 },
    'alice_johnson||david_lee':   { ast: 0.55, token: 0.48, embedding: 0.50, combined: 0.51 },
    'alice_johnson||emma_wilson': { ast: 0.40, token: 0.35, embedding: 0.38, combined: 0.38 },
    'alice_johnson||frank_brown': { ast: 0.50, token: 0.44, embedding: 0.47, combined: 0.47 },
    'bob_smith||carol_davis':     { ast: 0.43, token: 0.36, embedding: 0.40, combined: 0.40 },
    'bob_smith||david_lee':       { ast: 0.52, token: 0.46, embedding: 0.48, combined: 0.49 },
    'bob_smith||emma_wilson':     { ast: 0.38, token: 0.33, embedding: 0.36, combined: 0.36 },
    'bob_smith||frank_brown':     { ast: 0.48, token: 0.42, embedding: 0.45, combined: 0.45 },
    'carol_davis||david_lee':     { ast: 0.22, token: 0.18, embedding: 0.20, combined: 0.20 },
    'carol_davis||emma_wilson':   { ast: 0.35, token: 0.30, embedding: 0.32, combined: 0.32 },
    'carol_davis||frank_brown':   { ast: 0.28, token: 0.24, embedding: 0.26, combined: 0.26 },
    'david_lee||emma_wilson':     { ast: 0.32, token: 0.28, embedding: 0.30, combined: 0.30 },
    'david_lee||frank_brown':     { ast: 0.42, token: 0.38, embedding: 0.40, combined: 0.40 },
    'emma_wilson||frank_brown':   { ast: 0.36, token: 0.30, embedding: 0.33, combined: 0.33 },
  },
  quality: {
    alice_johnson: {
      language: 'python', quality_score: 78, cyclomatic_complexity: 8,
      num_functions: 3, avg_function_length: 12, max_function_length: 16,
      comment_density: 18.5, total_lines: 42, code_lines: 28, comment_lines: 8,
      code: DEMO_CODE.alice_johnson,
      bugs: [
        { line: 5, type: 'PoorNaming', message: 'Consider using more descriptive variable name than `n`.', severity: 'info' }
      ]
    },
    bob_smith: {
      language: 'python', quality_score: 38, cyclomatic_complexity: 9,
      num_functions: 3, avg_function_length: 11, max_function_length: 14,
      comment_density: 5.3, total_lines: 40, code_lines: 32, comment_lines: 2,
      code: DEMO_CODE.bob_smith,
      bugs: [
        { line: 4, type: 'PoorNaming', message: 'Single-character variable `x` used. Use descriptive variable names.', severity: 'info' },
        { line: 15, type: 'PoorNaming', message: 'Single-character variable `m` used. Use descriptive variable names.', severity: 'info' },
        { line: 24, type: 'PoorNaming', message: 'Single-character variable `c` used. Use descriptive variable names.', severity: 'info' },
      ]
    },
    carol_davis: {
      language: 'python', quality_score: 95, cyclomatic_complexity: 6,
      num_functions: 4, avg_function_length: 10, max_function_length: 14,
      comment_density: 24.1, total_lines: 55, code_lines: 38, comment_lines: 13,
      code: DEMO_CODE.carol_davis,
      bugs: []
    },
    david_lee: {
      language: 'python', quality_score: 22, cyclomatic_complexity: 11,
      num_functions: 3, avg_function_length: 9, max_function_length: 12,
      comment_density: 2.1, total_lines: 32, code_lines: 28, comment_lines: 1,
      code: DEMO_CODE.david_lee,
      bugs: [
        { line: 5, type: 'PoorNaming', message: 'Single-character function name `s`. Use descriptive names.', severity: 'error' },
        { line: 16, type: 'InfiniteLoop', message: '`while b==True` detected — prefer `while b:` and ensure a break condition.', severity: 'error' },
        { line: 3, type: 'PoorNaming', message: 'Variable `x` is uninformative. Use descriptive names.', severity: 'info' },
        { line: 22, type: 'NoneComparison', message: 'Use `is None` instead of comparing with `== None`.', severity: 'warning' },
      ]
    },
    emma_wilson: {
      language: 'python', quality_score: 72, cyclomatic_complexity: 7,
      num_functions: 3, avg_function_length: 11, max_function_length: 16,
      comment_density: 12.8, total_lines: 44, code_lines: 33, comment_lines: 6,
      code: DEMO_CODE.emma_wilson,
      bugs: [
        { line: 37, type: 'BareExcept', message: 'Bare `except:` catches all exceptions. Specify a type like `except ValueError`.', severity: 'warning' }
      ]
    },
    frank_brown: {
      language: 'python', quality_score: 55, cyclomatic_complexity: 4,
      num_functions: 2, avg_function_length: 8, max_function_length: 10,
      comment_density: 9.6, total_lines: 22, code_lines: 15, comment_lines: 3,
      code: DEMO_CODE.frank_brown,
      bugs: [
        { line: 13, type: 'PoorNaming', message: 'Variable `n` is too short. Use a descriptive name.', severity: 'info' }
      ]
    },
  },
  detected_languages: {
    alice_johnson: 'python', bob_smith: 'python', carol_davis: 'python',
    david_lee: 'python', emma_wilson: 'python', frank_brown: 'python',
  }
}

// ─── Store ──────────────────────────────────────────────────────────────────
export const useStore = create(
  persist(
    (set, get) => ({
      sessionId: null,
      assignmentName: '',
      language: 'auto',
      students: [],
      results: null,
      status: 'idle',

      setSession: (sessionId, assignmentName, language, students) =>
        set({ sessionId, assignmentName, language, students, results: null, status: 'uploaded' }),

      setResults: (results) => set({ results, status: 'done' }),

      setStatus: (status) => set({ status }),

      loadDemoData: () => set({
        sessionId: 'demo-session',
        assignmentName: 'Lab 3 — Sorting Algorithms',
        language: 'python',
        students: DEMO_STUDENTS,
        results: DEMO_RESULTS,
        status: 'done',
      }),

      clearSession: () => set({
        sessionId: null, assignmentName: '', language: 'auto',
        students: [], results: null, status: 'idle'
      }),

      getStudentResult: (name) => {
        const r = get().results
        if (!r) return null
        const q = r.quality?.[name] || {}
        const similarity = r.similarity_matrix || {}
        let maxSim = 0
        let mostSimilarWith = null
        for (const [key, val] of Object.entries(similarity)) {
          const parts = key.split('||')
          if (parts.includes(name)) {
            if (val.combined > maxSim) {
              maxSim = val.combined
              mostSimilarWith = parts.find(p => p !== name)
            }
          }
        }
        return { name, ...q, maxSim, mostSimilarWith }
      },

      getPairSimilarity: (a, b) => {
        const sim = get().results?.similarity_matrix || {}
        return sim[`${a}||${b}`] || sim[`${b}||${a}`] || null
      },

      getRankedStudents: () => {
        const r = get().results
        if (!r) return []
        const quality = r.quality || {}
        const similarity = r.similarity_matrix || {}

        return r.students.map(name => {
          const q = quality[name] || {}
          let maxSim = 0
          for (const [key, val] of Object.entries(similarity)) {
            const parts = key.split('||')
            if (parts.includes(name) && val.combined > maxSim) {
              maxSim = val.combined
            }
          }
          const risk = maxSim >= 0.7 ? 'high' : maxSim >= 0.4 ? 'medium' : 'low'
          return {
            name,
            maxSim: Math.round(maxSim * 100),
            qualityScore: q.quality_score || 0,
            complexity: q.cyclomatic_complexity || 0,
            bugs: (q.bugs || []).length,
            language: q.language || 'python',
            risk,
          }
        }).sort((a, b) => b.maxSim - a.maxSim)
      },

      getHeatmapData: () => {
        const r = get().results
        if (!r) return { students: [], matrix: {} }
        return { students: r.students || [], matrix: r.similarity_matrix || {} }
      },
    }),
    {
      name: 'plagiarism-checker-store',
      partialize: (s) => ({
        sessionId: s.sessionId,
        assignmentName: s.assignmentName,
        results: s.results,
        students: s.students,
        status: s.status,
        language: s.language,
      })
    }
  )
)
