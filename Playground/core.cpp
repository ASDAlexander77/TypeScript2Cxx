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

js::string number::toString(js::number radix) {
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

// Math
number MathImpl::E = 2.718281828459045;
number MathImpl::LN10 = 2.302585092994046;
number MathImpl::LN2 = 0.6931471805599453;
number MathImpl::LOG2E = 1.4426950408889634;
number MathImpl::LOG10E = 0.4342944819032518;
number MathImpl::PI = 3.141592653589793;
number MathImpl::SQRT1_2 = 0.7071067811865476;
number MathImpl::SQRT2 = 1.4142135623730951;
