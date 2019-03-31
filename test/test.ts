let a = 1;
switch (a) {
    case 1:
    case 2:
        console.log('Hello!');
        break;
    case 3:
        break;
    default:
        break;
}
a = 2;
switch (a) {
    case 1:
    case 2:
        console.log('Hello!');
        break;
    case 3:
        break;
    default:
        break;
}
a = 3;
switch (a) {
    case 1:
    case 2:
        break;
    case 3:
        console.log('Hello!');
        break;
    default:
        break;
}
a = 4;
switch (a) {
    case 1:
    case 2:
        break;
    case 3:
        break;
    default:
        console.log('Hello!');
        break;
}
