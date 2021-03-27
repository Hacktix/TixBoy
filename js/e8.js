function e8(v, n=v&(1<<7), b=(1<<8), mv=-b, ms=b-1) {
    return n ? mv + (v&ms) : v
}