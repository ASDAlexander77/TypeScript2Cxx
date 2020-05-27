function makeRangeIterator(start = 0, end = Infinity, step = 1) : [ number, boolean ] {
    let nextIndex = start;
    let iterationCount = 0;

    const rangeIterator = {
       next: function() : [ number, boolean ] {
           let result : [ number, boolean ];
           if (nextIndex < end) {
               result = [ nextIndex, false ]
               nextIndex += step;
               iterationCount++;
               return result;
           }
           return [ iterationCount, true ]
       }
    };
    return rangeIterator;
}

const it = makeRangeIterator(1, 10, 2);

let result = it.next();
while (!result[1]) {
 console.log(result[0]); // 1 3 5 7 9
 result = it.next();
}

console.log("Iterated over sequence of size: ", result[1]); 