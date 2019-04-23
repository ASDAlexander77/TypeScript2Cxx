#include "core.h"

using namespace js;

class Class1 {
public:
    virtual void dummy() {};
    static void show()
    {
        console.log("Hello"_S);
    }
};
