#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

template <typename T>
using Wrapper = T;

class Cls;
extern Wrapper< Cls* > a;

class Cls {
public:
    virtual void dummy() {};
};

#endif
