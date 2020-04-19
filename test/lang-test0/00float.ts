function testFloat() {
    let v = 13 / 32
    v *= 32
    assert(v == 13, "/")
    for (let i = 0; i < 20; ++i) {
        v *= 10000
    }
    //assert(v > 1e81, "81")
}

testFloat()

