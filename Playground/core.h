#include <memory>
#include <string>
#include <functional>
#include <type_traits>
#include <vector>
#include <tuple>
#include <unordered_map>
#include <sstream>
#include <ostream>
#include <iostream>
#include <cmath>

namespace js
{

#define OR(x, y) ((bool)(x) ? (x) : (y))
#define AND(x, y) ((bool)(x) ? (y) : (x))

struct boolean {

    bool _value;

    boolean (bool initValue) {
        _value = initValue;
    }

    inline operator bool() {
        return _value;
    }

    friend std::ostream& operator << (std::ostream& os, boolean val)
    {
        return os << ((bool)val ? "true" : "false");
    }       
};

struct number {

    double _value;

    constexpr number() : _value(0) {
    }

    template<class T, class = std::enable_if<std::is_integral_v<T>>>
    number (T initValue) {
        _value = static_cast<T>(initValue);
    }

    template<class T, class = std::enable_if<std::is_integral_v<T>>>
    inline operator T() const {
        return static_cast<T>(_value);
    }

    operator std::string() const {
        return std::to_string(_value);
    }    

    operator size_t() const {
        return (size_t)_value;
    }    

    friend std::ostream& operator << (std::ostream& os, number val)
    {
        return os << val._value;
    }       
};

struct string {

    std::string _value;

    string (std::string initValue) {
        _value = initValue;
    }

    inline operator const char*() {
        return _value.c_str();
    }

    template<class T, class = std::enable_if<std::is_integral_v<T>>>
    string& operator+ (T t) {
        _value.append(std::to_string(t));
        return *this;
    }

    string& operator+ (number value) {
        _value.append(value.operator std::string());
        return *this;
    }

    string& operator+ (string value) {
        _value.append(value._value);
        return *this;
    }

    friend std::ostream& operator << (std::ostream& os, string val)
    {
        return os << val._value;
    }    
};

template < typename T >
struct ReadOnlyArray {
    number length;
    std::vector<T> _values;

    ReadOnlyArray(std::initializer_list<T> values) : _values(values) {
    }

    T operator[] (number n) const {
        return _values[(size_t)n];
    }
};

template < typename T >
struct Array : public ReadOnlyArray<T> {
    Array(std::initializer_list<T> values) : ReadOnlyArray<T>(values) {
    }

    T& operator[] (number n) {
        return _values[(size_t)n];
    }
};

struct any {

    enum anyType {
        number,
        array,
        object
    };

    anyType _type;
    union u {
        js::number _number;
    };

    template<class T, class = std::enable_if<std::is_integral_v<T>>>
    any(T initValue) {
        _type = anyType::number;
        _value.u._number = (T)initValue;
    }

};

string operator ""_S(const char* s, std::size_t size) {
    return string(s);
}


std::ostream& operator << (std::ostream& os, std::nullptr_t ptr)
{
    return os << "null";
}    

static struct Console
{
    Console() {
        std::cout << std::boolalpha;
    }

    template<class ... Args>
    void log(Args ... args) 
    {
        for (auto& arg : {args...}) 
        {
            std::cout << arg;
        }

        std::cout << std::endl;
    }

} console;

} // namespace js
