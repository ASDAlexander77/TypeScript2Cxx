#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Class1;
class Class0;

class Class1 : public Class0 {
public:
};

class Class0 {
public:
    virtual void dummy() {};
};

#endif
