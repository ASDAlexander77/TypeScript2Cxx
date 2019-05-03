#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class ArrayTools;

class ArrayTools : public object {
public:
    template <typename T, typename P1>
    static Array<T >* BuildArray(js::number size, P1 itemBuilder);
};

template <typename T, typename P1>
Array<T >* ArrayTools::BuildArray(js::number size, P1 itemBuilder)
{
    auto a = new Array<T>();
    for (auto i = 0; i < size; ++i)
    {
        a->push(itemBuilder());
    }
    return cast<Array<T >*>(a);
}

#endif
