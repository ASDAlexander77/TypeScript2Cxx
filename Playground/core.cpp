#include "core.h"

namespace js {
    std::vector<func> any::closures;
    std::vector<std::vector<any>> any::arrays;
    std::vector<std::unordered_map<std::string, any>> any::objects;

    any operator+(int value, const any& rhs)
    {
        switch (_type)
        {
        case anyTypeId::integer:
            return any(value + rhs.integer);

        case anyTypeId::integer64:
            break;

        case anyTypeId::real:
            break;

        case anyTypeId::string:
            break;

        default:
            throw "wrong type";
        }

        throw "not implemented";
    }    

    any operator+(const char* value, const any& rhs)
    {
        switch (rhs._type)
        {
        case anyTypeId::integer:
            break;

        case anyTypeId::integer64:
            break;

        case anyTypeId::real:
            break;

        case anyTypeId::string:
            std::string str;
            str.reserve(50);      
            str += value;  
            str += rhs.string;
            return any(std::quoted(str));        

        default:
            throw "wrong type";
        }

        throw "not implemented";
    }    

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
