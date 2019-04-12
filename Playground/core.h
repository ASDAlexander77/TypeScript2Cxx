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

};

struct number {

    double _value;

    template<class T, class = std::enable_if<std::is_integral_v<T>>>
    number (T initValue) {
        _value = (T)initValue;
    }

};

struct string {

    std::string _value;

    string (std::string initValue) {
        _value = initValue;
    }

    template<class T, class = std::enable_if<std::is_integral_v<T>>>
    string& operator+ (T value) {
        _value.append(std::to_string(value));
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
