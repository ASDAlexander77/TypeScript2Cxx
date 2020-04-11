function assertEq(result, expected) {
  if (result !== expected)
    throw "Assertion: Expected " + expected + ", got " + result;
}

// Same values as in misc-basic-array-forof.js
var outer = 500;
var len = 10000;

function fill_array(len) {
    var a = Array(len);
    for (var i = 0; i < outer; i++) {
	for (var j = 0; j < len; j++)
	    a[j] = i;
    }
    return a;
}

function use_array(a) {
    var x = 0;
    for (var i = 0; i < outer; i++) {
	for (var j = 0; j < a.length; j++)
	    x += a[j];
    }
    return x;
}

var a = fill_array(len);
assertEq(use_array(a), (outer - 1) * outer * len);
