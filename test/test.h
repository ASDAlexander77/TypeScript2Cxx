#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Test;
extern string s;

template <typename T>
T* _copySource(std::function<T*()> creationFunction, T* source, boolean instanciate);

any copySource(std::function<any()> creationFunction, any source, boolean instanciate);

class Test : public object {
public:
};

template <typename T>
T* _copySource(std::function<T*()> creationFunction, T* source, boolean instanciate)
{
    auto destination = creationFunction();
    return destination;
};


#endif
