let a = [10, 20, 30, 40];
let count = 0;
for (let i in a)
{
    count++;
    console.log(count);
    if (count == 1) continue;
    break;
}
