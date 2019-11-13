#include "core.h"

using namespace js;

std::size_t hash_combine(const std::size_t hivalue, const std::size_t lovalue)
{
    return lovalue + 0x9e3779b9 + (hivalue << 6) + (hivalue >> 2);
}

std::ostream& operator << (std::ostream& os, std::nullptr_t ptr)
{
    return os << "null";
}    

number parseInt(const js::string& value, int base) {
    return number(std::stoi(value._value, 0, base));
}

number parseFloat(const js::string& value) {
    return number(std::stod(value._value, 0));
}

// Number
js::string number::toString() {
    return js::string(std::to_string(_value));
} 

js::string number::toString(js::number radix) {
    return js::string(std::to_string(_value));
} 

// Array
array::array() : _values(), undefined_t(false) {
}

array::array (std::initializer_list<any> values) : _values(values) {
}

// End of Array

// Object
object::object() : _values(), undefined_t(false) {
}

object::object (std::initializer_list<pair> values) {
    for (auto& item : values) {
        _values[item.first] = item.second;
    }
}

ObjectKeys<decltype(object::_values.begin())> object::keys() {
    return ObjectKeys<decltype(object::_values.begin())>(begin(_values), end(_values));
}

const any& object::operator[] (const char* s) const {
    return mutable_(_values)[std::string(s)];
}

const any& object::operator[] (std::string s) const {
    return mutable_(_values)[s];
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
