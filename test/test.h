#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Matrix;

class Matrix : public object {
public:
    js::number _value = 1;

    js::number _identityReadOnly = this->_value;
};

#endif
