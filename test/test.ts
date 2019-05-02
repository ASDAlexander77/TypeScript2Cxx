var _copySource = function <T>(creationFunction: () => T, source: T, instanciate: boolean): T {
    var destination = creationFunction();
    return destination;
}

function copySource(creationFunction: () => any, source: any, instanciate: boolean): any {
    var destination = creationFunction();
    return destination;
}

class Test {

}

var s = "asd";
