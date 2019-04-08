let a = [10, 20, 30, 40];
let count = 0;
for (let i in a) {
    console.log(i);
    if (count == 0) continue;
    break;
}
