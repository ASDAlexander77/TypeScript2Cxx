//#define EXTRA_DEBUG
#include "core.h"
#include <iostream>
#include <ctime>

using namespace js;

any Object;
any Array;

any Class1; 
any __extends;

any Class2;
any c1;
any c2;

int main(int argc, char** argv)
{
    Class1 = ((any(FN_R() -> any
    {
        // body
        any Class1 = FN()
        {
            // body
        };

        Class1["prototype"]["method1"] = FN_R() -> any
        {
            // body
            return any(false);
        };
        return Class1;
    })()));

    __extends = (OR((AND(ROOT, ROOT["__extends"])), (any(FN_R() -> any
    {
        // body
        any extendStatics; 
        extendStatics = (FNC_R_PARAMS() -> any
        {
            HEADER
            PARAM(d);
            PARAM(b);
            // body
            extendStatics = OR(OR(Object["setPrototypeOf"], (AND(InstanceOf(any(anyTypeId::object, {
                PAIR("__proto__"_a, any(anyTypeId::array))
            }), Array), FN_PARAMS()
            {
                HEADER
                PARAM(d);
                PARAM(b);
                // body
                d["__proto__"] = b;
            }))), FN_PARAMS()
            {
                HEADER
                PARAM(d);
                PARAM(b);
                // body
                for (auto& p : b.keys())
                if (b["hasOwnProperty"](p)) d[p] = b[p];
            }
            );
            return extendStatics(d, b);
        });

        return FNC_PARAMS()
        {
            HEADER
            PARAM(d);
            PARAM(b);
            // body
            extendStatics(d, b);
            any __ = FNC()
            {
                // body
                (*_this)["constructor"] = d;
            };

            d["prototype"] = (b == any(nullptr)) ? Object["create"](b) : (__["prototype"] = b["prototype"] , __(anyTypeId::object));
        };
    }
    ))()));

    Class2 = ((any(FN_R_PARAMS() -> any
    {
        HEADER
        PARAM(_super);
        // body
        ROOT["__extends"](Class2, _super);
        any Class2 = FNC_R() -> any
        {
            // body
            return OR(AND(_super != any(nullptr), _super["apply"]((*_this), arguments)), (*_this));
        };

        Class2["prototype"]["method2"] = FN_R() -> any
        {
            // body
            return any(true);
        };
        return Class2;
    })(Class1)));
        
    c1 = Class1(anyTypeId::object);
    console["log"](c1["method1"]());
    c2 = Class2(anyTypeId::object);
    console["log"](c2["method1"]());
    console["log"](c2["method2"]());

    return 0;
}
