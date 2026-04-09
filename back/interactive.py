p = 512
v = 0
while True:
    print(v + p, flush=True)
    if input().strip() == "Higher!":
        v += p
    p //= 2
