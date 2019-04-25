enum Orientation {
    CW = 0,
    CCW = 1
}

class Arc2 {
    public orientation: Orientation;

    public static val = 10;

    constructor() {
        this.orientation = Orientation.CW;
    }
}
