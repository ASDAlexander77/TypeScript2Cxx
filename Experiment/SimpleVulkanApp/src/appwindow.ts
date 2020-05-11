declare namespace std {
}

class AppWindow {
    constructor() {
        const v = 10;
        const pv = std.addressof(v);
    }

    onPaint(): void {
        console.log('on paint...');
    }
}
