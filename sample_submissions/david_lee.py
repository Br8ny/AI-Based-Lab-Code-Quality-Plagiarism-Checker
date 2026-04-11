"""
Student: David Lee - Poor quality with bugs
Lab 3: Sorting
"""
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
