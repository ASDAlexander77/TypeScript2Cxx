#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class InternalPromise1;
class InternalPromise2;

class ITest : public object {
public:
};

class InternalPromise1 : public ITest {
public:
};

class InternalPromise2 : public InternalPromise1 {
public:
};

#endif
