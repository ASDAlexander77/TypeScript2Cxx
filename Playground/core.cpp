#include "core.h"

using namespace js;

std::size_t hash_combine(const std::size_t hivalue, const std::size_t lovalue)
{
    return lovalue + 0x9e3779b9 + (hivalue << 6) + (hivalue >> 2);
}

// Number
js::string number::toString() {
    return js::string(std::to_string(_value));
} 

// Array
array::array() : _values(), undefined_t(true) {
}

array::array (std::initializer_list<any> values) : _values(values) {
}

template<class T, class>
any& array::operator[] (T t) {
    return _values[(size_t)t];
}

// End of Array

// Object
object::object() : _values(), undefined_t(true) {
}

object::object (std::initializer_list<pair> values) {
    for (auto& item : values) {
        _values[item.first] = item.second;
    }
}

template<class T, class>
any& object::operator[] (T t) {
    return _values[std::to_string(t)];
}

any& object::operator[] (const char* s) {
    return _values[std::string(s)];
}

any& object::operator[] (std::string s) {
    return _values[s];
}
