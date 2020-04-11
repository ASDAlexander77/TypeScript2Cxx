// basic performance accessing mutable closure state.

function main1() {
  var g = 0;
  function foo() {
    for (var i = 0; i < 20000000; i++)
      g++;
  }
  foo();
}
main1();

function main2() {
  var g = 0;
  return function () {
    for (var i = 0; i < 20000000; i++)
      g++;
    return g;
  }
}
console.log(main2()());
