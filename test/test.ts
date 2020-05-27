function makeRangeIterator(start = 0, end = Infinity, step = 1) : () => [ number, boolean ] {
    let nextIndex = start;
    let iterationCount = 0;

    return () => {
           let result : [ number, boolean ];
           if (nextIndex < end) {
               result = [ nextIndex, false ]
               nextIndex += step;
               iterationCount++;
               return result;
           }
           return [ iterationCount, true ]
    };
}

const next = makeRangeIterator(1, 10, 2);

let result = next();
while (!result[1]) {
 console.log(result[0]); // 1 3 5 7 9
 result = next();
}

console.log("Iterated over sequence of size: ", result[1]);
