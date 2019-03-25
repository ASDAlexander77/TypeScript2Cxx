#include <functional>
#include <vector>
#include "core.h"

namespace js {
    std::vector<func> any::closures;
    std::vector<std::vector<any>> any::arrays;

    std::ostream& operator<<(std::ostream& os, const any& other)
    {
        switch (other._type)
        {
        case anyTypeId::undefined:
            os << "undefined";
            break;

        case anyTypeId::null:
            os << "null";
            break;
 
        case anyTypeId::boolean:
            os << (other._value.boolean ? "true" : "false");
            break;

        case anyTypeId::integer:
            os << other._value.integer;
            break;

        case anyTypeId::integer64:
            os << other._value.integer64;
            break;

        case anyTypeId::real:
            os << other._value.real;
            break;

        case anyTypeId::string:
            os << other._value.string;
            break;

        case anyTypeId::function:
            os << "[function]";
            break;

        case anyTypeId::closure:
            os << "[closure]";
            break;

        default:
            os << "<error>";
        }

        return os;
    }

}
