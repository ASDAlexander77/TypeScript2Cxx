let i = 1;
try {
    try {
        console.log(i);
        throw i;
        i = 2;
    }
    finally {
        console.log(i);
    }
}
catch (e) {
}
