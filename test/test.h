#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Vector2;
class Obj;

class Vector2 {
public:
    virtual void dummy() {};
};

class Obj {
public:
    virtual void dummy() {};
    Array<Vector2*> _points = new Array<Vector2*>();

    Obj() {
        this->_points.push(1);
    }
};

#endif
