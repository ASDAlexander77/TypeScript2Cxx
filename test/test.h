#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Class1;
extern Class1* c;

class Class1 : public object {
public:
    js::number i;

    Class1(js::number i_);
    virtual void show();
};

#endif
