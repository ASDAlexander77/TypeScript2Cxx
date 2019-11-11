#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Matrix;
extern Matrix* result;

class Matrix : public object {
public:
    Array<any>* m = new Array<any>();
};

#endif
