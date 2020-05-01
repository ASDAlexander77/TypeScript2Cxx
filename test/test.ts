

//
// Note that this is supposed to run from command line.
// Do not use anything besides pause, control.runInBackground, console.log
//

// pause(2000)
type Action any;
type uint8 number;
type int8 number;
type uint16 number;
type int16 number;

namespace control {
	function runInBackground(f: ()=>void): void {
		thread(f);
	}

	function dmesg(s: string): void {
	}
}

function pause(t: number) {
	sleep(t);
}

function msg(s: string): void {
    console.log(s)
    control.dmesg(s)
    //pause(50);
}

msg("start!")

function assert(cond: boolean, m?: string) {
    if (!cond) {
        msg("assertion failed: ")
        if (m) {
            msg(m)
	}

        throw m;
    }
}

//
// start tests
//

let glb1: number;
let s2: string;
let x: number;
let action: Action;
let tot: string;
let lazyAcc: number;
let sum: number;
let u8: uint8
let i8: int8
let u16: uint16
let i16: int16

let xyz = 12;


let hasFloat = true
if ((1 / 10) == 0) {
    hasFloat = false
}

class Testrec {
    str: string;
    num: number;
    _bool: boolean;
    str2: string;
}

function clean() {
    glb1 = 0
    s2 = ""
    x = 0
    action = null
    tot = ""
    lazyAcc = 0
    sum = 0
}
namespace Generics {

    function swap<T>(arr: T[], i: number, j: number): void {
        let temp: T = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    function sortHelper<T>(arr: T[], callbackfn?: (value1: T, value2: T) => number): T[] {
        if (arr.length <= 0 || !callbackfn) {
            return arr;
        }
        let len = arr.length;
        // simple selection sort.
        for (let i = 0; i < len - 1; ++i) {
            for (let j = i + 1; j < len; ++j) {
                if (callbackfn(arr[i], arr[j]) > 0) {
                    swap<T>(arr, i, j);
                }
            }
        }
        return arr;
    }

    export function arraySort<T>(arr: T[], callbackfn?: (value1: T, value2: T) => number): T[] {
        return sortHelper(arr, callbackfn);
    }
}

function testGenerics() {
    msg("testGenerics")
    let inArray = [4, 3, 4593, 23, 43, -1]
    Generics.arraySort<number>(inArray, (x: number, y: number) => { return x - y })
    let expectedArray = [-1, 3, 4, 23, 43, 4593]
    for (let i = 0; i < expectedArray.length; i++) {
        assert(inArray[i] == expectedArray[i])
    }
}

testGenerics()
clean()
msg("test OK!")
