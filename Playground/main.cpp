#define EXTRA_DEBUG
#include "core.h"
#include <iostream>
#include <ctime>

using namespace js;

any buildName = (functionPtrType) [](any *_this, const paramsType &params) -> any {
    // parameters
    auto param = params.begin();
    auto end = params.end();
    any firstName = end != param ? *param++ : any();
    any lastName = end != param ? *param++ : any();

    // body
    if (_this) {
        if (lastName) {
            (*_this)["Result"] = firstName + any(" ") + lastName;
        } else {
            (*_this)["Result"] = firstName;
        }

        return *_this;
    } else {
        if (lastName) {
            return firstName + any(" ") + lastName;
        } else {
            return firstName;
        }
    }
};

any result1;
any result2;

template < class T > any New(const paramsType &params) {
    any result(anyTypeId::object);
    T t;
    t(&result, params);
    return result;
};

int main(int argc, char** argv)
{
    result1 = buildName( paramsType{ any("Bob"), any("Adams") } );
    result2 = buildName( paramsType{ any("Bob") } );
    console.log( paramsType{ result1 } );
    console.log( paramsType{ result2 } );

    //any val = New<decltype(buildName)>( paramsType{ any("Bob"), any("Adams") } );

    any val2 = buildName;
    any res = val2( paramsType{ any("Bob"), any("Adams") } );
    
    console.log( paramsType{ res } );

    return 0;
}
