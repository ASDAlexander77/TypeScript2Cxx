#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Arc2;

enum Orientation {
    CW = 0, CCW = 1
};
class Arc2 {
public:
    virtual void dummy() {};
    Orientation orientation;

    static js::number val;

    Arc2() {
        this->orientation = Orientation::CW;
    }
};

#endif
