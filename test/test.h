#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

namespace M {
    class C : public object {
    public:
        static any Y();
        virtual any X();
    };

}
extern M::C* c;
namespace M {
}
#endif
