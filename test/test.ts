function assert(cond: boolean, msg: string = "error") { if (!cond) throw msg; }
function msg(m: any) { console.log(m); }
function pause(t: number) { void(t); }

function testArrIncr() {
    let arr = [1]
    let glb1 = 0
    function getarr() {
        glb1++
        return arr
    }
    getarr()[0]++
    assert(glb1 == 1)
    assert(arr[0] == 2, "t")
    function getarr2() {
        return [1]
    }
    getarr2()[0]++ // make sure it doesn't crash
}
testArrIncr()
