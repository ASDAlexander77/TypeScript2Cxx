#ifndef CORE_H
#define CORE_H

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
#include <typeinfo>
#include <typeindex>
#include <iomanip>
#include <cmath>
#include <algorithm>
#include <random>

namespace js
{

#define OR(x, y) ((bool)(x) ? (x) : (y))
#define AND(x, y) ((bool)(x) ? (y) : (x))

#define EQUALS(x, y) ((x) == (y))
#define NOT_EQUALS(x, y) (!((x) == (y)))

template <typename R, typename T> 
inline R cast(T t) {
	return (R)t;
}

struct any;
struct object;
struct string;

inline std::size_t hash_combine(const std::size_t hivalue, const std::size_t lovalue);

static struct undefined_t {

    bool isUndefined;

    undefined_t () {
        isUndefined = false;
    }

    undefined_t (bool value) : isUndefined(value) {
    }

    inline operator bool() {
        return !isUndefined;
    }

    inline operator std::nullptr_t() {
        return nullptr;
    }

    friend std::ostream& operator << (std::ostream& os, undefined_t val)
    {
        return os << "undefined";
    }       
} undefined(true);

struct boolean : public undefined_t {

    bool _value;

    boolean () : _value(false), undefined_t(true) {
    }

    boolean (bool initValue) {
        _value = initValue;
    }

    boolean (const undefined_t& undef) : undefined_t(true) {
    }

    operator bool() const {
        if (isUndefined) {
            return false;
        }

        return _value;
    }

    friend std::ostream& operator << (std::ostream& os, boolean val)
    {
        return os << ((bool)val ? "true" : "false");
    }       
};

struct number : public undefined_t {

    double _value;

    number () : _value(0), undefined_t(true) {
    }

    template<class T, class = std::enable_if<std::is_integral_v<T>>>
    number (T initValue) {
        _value = static_cast<T>(initValue);
    }

    number (const undefined_t& undef) : undefined_t(true) {
    }

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    inline operator T() const {
        return static_cast<T>(_value);
    }

    inline operator std::string() const {
        return std::to_string(_value);
    }    

    inline operator size_t() const {
        return (size_t)_value;
    }    

    inline operator double() const {
        return _value;
    }    

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    number operator +(T t) {
        return number(_value + t);
    }

    number operator +(number n) {
        return number(_value + n._value);
    }

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    friend number operator +(T t, number value) {
        return number(t + value._value);
    } 

    number operator +() {
        return number(+_value);
    }    

    number& operator ++() {
        _value += 1;
        return *this;
    }    

    number operator ++(int) {
        return number(_value + 1);
    }    

    number& operator +=(number other){
        _value += other._value;
        return *this;
    }    

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    number operator -(T t) {
        return number(_value - t);
    }

    number operator -(number n) {
        return number(_value - n._value);
    }    

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    friend number operator -(T t, number value) {
        return number(t - value._value);
    } 

    number operator -() {
        return number(-_value);
    }    

    number& operator --() {
        _value -= 1;
        return *this;
    }    

    number operator --(int) {
        return number(_value - 1);
    }        

    number& operator -=(number other){
        _value -= other._value;
        return *this;
    }    

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    number operator *(T t) {
        return number(_value * t);
    }

    number operator *(number n) {
        return number(_value * n._value);
    }   

    number& operator *=(number other){
        _value *= other._value;
        return *this;
    }   

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    friend number operator *(T t, number value) {
        return number(t * value._value);
    }    

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    number operator /(T t) {
        return number(_value / t);
    }

    number operator /(number n) {
        return number(_value / n._value);
    }   

    number& operator /=(number other){
        _value /= other._value;
        return *this;
    }   

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    friend number operator /(T t, number value) {
        return number(t / value._value);
    }    

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    number operator ^(T t) {
        return number((long)_value ^ (long)t);
    }

    number operator ^(number n) {
        return number((long)_value ^ (long)n._value);
    }   

    number& operator ^=(number other){
        _value = (long)_value ^ (long)other._value;
        return *this;
    }   

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    friend number operator ^(T t, number value) {
        return number((long)t ^ (long)value._value);
    } 

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    number operator |(T t) {
        return number((long)_value | (long)t);
    }

    number operator |(number n) {
        return number((long)_value | (long)n._value);
    }   

    number& operator |=(number other){
        _value = (long)_value | (long)other._value;
        return *this;
    }   

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    friend number operator |(T t, number value) {
        return number((long)t | (long)value._value);
    } 

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    bool operator ==(T t) {
        return _value == t;
    }

    bool operator ==(number n) {
        return _value == n._value;
    }    

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    bool operator <(T t) {
        return _value < t;
    }

    bool operator <(number n) {
        return _value < n._value;
    } 

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    bool operator <=(T t) {
        return _value <= t;
    }

    bool operator <=(number n) {
        return _value <= n._value;
    } 

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    bool operator >(T t) {
        return _value > t;
    }

    bool operator >(number n) {
        return _value > n._value;
    }     

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    bool operator >=(T t) {
        return _value >= t;
    }

    bool operator >=(number n) {
        return _value >= n._value;
    }         

    js::string toString();
    js::string toString(js::number radix);
    
    friend std::ostream& operator << (std::ostream& os, number val)
    {
        return os << val._value;
    }       
};

struct string : public undefined_t {

    std::string _value;

    size_t length;

    string () : _value(), undefined_t(true) {
    }    

    string (std::string value) : _value(value), length(value.length()) {
    }

    string (const char* value) : _value(value) {
        length = _value.length();
    }    

    string (const undefined_t& undef) : undefined_t(true) {
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

    friend bool operator ==(const js::string& value, const js::string& other) {
        return value._value.compare(other._value) == 0;
    }    

    friend bool operator !=(const js::string& value, const js::string& other) {
        return value._value.compare(other._value) != 0;
    }    

    string toUpperCase() {
        std::string result(*this);
        for (auto& c: result) {
            c = toupper(c);
        }

        return string(result);
    }

    string toLowerCase() {
        std::string result(*this);
        for (auto& c: result) {
            c = tolower(c);
        }

        return string(result);
    }

    template<class T, class = std::enable_if<std::is_integral_v<T>>>
    string substring(T begin, T end) {
        return string(_value.substr(begin, end - begin));
    }    
    
    string substring(number begin, number end) {
        return string(_value.substr(begin, end - begin));
    }    

    friend std::ostream& operator << (std::ostream& os, string val)
    {
        return os << val._value;
    }    
};

static js::string operator ""_S(const char* s, std::size_t size) {
    return js::string(s);
}

struct function {
    virtual void invoke(std::initializer_list<int> args) = 0;

    void operator()(void) {
        invoke({});
    }

    template < typename ... Args > void operator()(Args... args) {
        invoke({args...});
    }

    template < typename R, typename ... Args > R operator()(Args... args) {
        invoke({args...});
    }
};

template< class F >
struct function_t : public function {
    F _f;

    function_t (const F& f) : _f(f) {
    } 

    virtual void invoke(std::initializer_list<int> args) override {
        auto _result = std::invoke(_f, 1);
    }
};

struct array : public undefined_t {

    std::vector<any> _values;

    array ();

    array (std::initializer_list<any> values);

    array (const undefined_t& undef) : undefined_t(true) {
    }    

    template<class T, class = std::enable_if<std::is_integral_v<T> || std::is_same_v<T, number>>>
    any& operator[] (T t);

    friend std::ostream& operator << (std::ostream& os, array val)
    {
        return os << "[array]";
    }
};

struct object : public undefined_t {

    using pair = std::pair<std::string, any>;

    std::unordered_map<std::string, any> _values;

    object ();

    object (std::initializer_list<pair> values);

    object (const undefined_t& undef) : undefined_t(true) {
    }    

    template<class T, class = std::enable_if<std::is_integral_v<T> || std::is_same_v<T, number>>>
    any& operator[] (T t);

    any& operator[] (const char* s);

    any& operator[] (std::string s);

    friend std::ostream& operator << (std::ostream& os, object val)
    {
        return os << "[object]";
    }
};

struct any {

    enum anyTypeId {
        undefined,
        boolean,
        number,
        string,
        function,
        array,
        object
    };

    union anyType  {
        js::boolean _boolean;
        js::number _number;
        void* _data;

        constexpr anyType(): _data(nullptr) {
        }

        inline anyType(bool value): _boolean(value) {
        }

        template<class T, class = std::enable_if<std::is_integral_v<T>>>
        constexpr anyType(T t): _number(t) {
        }     

        constexpr anyType(std::nullptr_t): _data(nullptr) {
        }

        constexpr anyType(void* ptr): _data(ptr) {
        }        
    };

    anyTypeId _type;
    anyType _value;

    any() : _type(anyTypeId::undefined) {
    }

    any (const undefined_t& undef) : _type(anyTypeId::undefined) {
    }        

    template<class T, class = std::enable_if<std::is_integral_v<T>>>
    any(T initValue) : _type(anyTypeId::number), _value((T)initValue) {
    }

    any(bool value) : _type(anyTypeId::boolean), _value(value) {
    }

    any(js::boolean value) : _type(anyTypeId::boolean), _value(value) {
    }

    any(js::number value) : _type(anyTypeId::number), _value(value) {
    }

    any(const js::string& value) : _type(anyTypeId::string), _value((void*)new js::string(value)) {
    }

/*
    any(const js::function& value) : _type(anyTypeId::function), _value((void*)new js::function(value)) {
    }
*/

    any(const js::array& value) : _type(anyTypeId::array), _value((void*)new js::array(value)) {
    }   

    any(const js::object& value) : _type(anyTypeId::object), _value((void*)new js::object(value)) {
    }   

    template<class T>
    any& operator[] (T t) {
        if (_type == anyTypeId::array) {
            return (*(js::array*)_value._data)[t];
        }

        if (_type == anyTypeId::object) {
            return (*(js::object*)_value._data)[t];
        }

        throw "wrong type";
    }

    operator string() {
        if (_type == anyTypeId::string) {
            return *(js::string*)_value._data;
        }

        throw "wrong type";        
    } 

    operator bool() {
        return _type != anyTypeId::undefined;
    }

    friend bool operator ==(const js::any& value, const js::any& other) {
        if (value._type != other._type) {
            return false;
        }

        switch (value._type) {
            case anyTypeId::undefined:
                return true;
            case anyTypeId::boolean:
                return value._value._boolean._value == other._value._boolean._value;
            case anyTypeId::number:
                return value._value._number._value == other._value._number._value;
            case anyTypeId::string:
                return std::strcmp(((js::string*)value._value._data)->_value.c_str(), ((js::string*)other._value._data)->_value.c_str()) == 0;
            case anyTypeId::object:
                return ((js::object*)value._value._data) == ((js::object*)other._value._data);
        }

        throw "not implemented";
    }    

    any operator +(const any& t) {
        switch (_type) {
            case anyTypeId::number:
                switch (t._type) {
                    case anyTypeId::number:
                        return any(_value._number + t._value._number);
                }
                break;
        }

        throw "not implemented";
    }

    any operator -(const any& t) {
        switch (_type) {
            case anyTypeId::number:
                switch (t._type) {
                    case anyTypeId::number:
                        return any(_value._number - t._value._number);
                }
                break;
        }

        throw "not implemented";
    }

    any operator *(const any& t) {
        switch (_type) {
            case anyTypeId::number:
                switch (t._type) {
                    case anyTypeId::number:
                        return any(_value._number * t._value._number);
                }
                break;
        }

        throw "not implemented";
    }

    any operator /(const any& t) {
        switch (_type) {
            case anyTypeId::number:
                switch (t._type) {
                    case anyTypeId::number:
                        return any(_value._number / t._value._number);
                }
                break;
        }

        throw "not implemented";
    }    

    any operator /(const js::number& t) {
        switch (_type) {
            case anyTypeId::number:
                return any(_value._number / t);
                break;
        }

        throw "not implemented";
    }

    js::string typeOf()
    {
        switch (_type)
        {
        case anyTypeId::undefined:
            return "undefined";

        case anyTypeId::boolean:
            return "boolean";

        case anyTypeId::number:
            return "number";

        case anyTypeId::string:
            return "string";

        case anyTypeId::array:
            return "array";

        case anyTypeId::object:
            return "object";

        default:
            return "error";
        }
    }

    void Delete(const char *field)
    {
        switch (_type)
        {
        case anyTypeId::object:
            ((js::object*)_value._data)->_values.erase(field);
            break;

        default:
            throw "wrong type";
        }
    }    

    int hash(void) const noexcept
    {
        size_t const h1 ( std::hash<int>{}((int)_type) );
        size_t h2;

        switch (_type)
        {
        case anyTypeId::undefined:
            h2 = 0;
            break;

        case anyTypeId::boolean:
            h2 = std::hash<bool>{} (_value._boolean._value);
            break;

        case anyTypeId::number:
            h2 = std::hash<double>{} (_value._number._value);
            break;

        case anyTypeId::string:
            h2 = std::hash<std::string>{} (((js::string*)_value._data)->_value);
            break;

        case anyTypeId::object:
            h2 = std::hash<void*>{} ((js::object*)_value._data);
            break;            

        default:
            h2 = 0;
        }

        return hash_combine(h1, h2);
    }    

    friend std::ostream& operator << (std::ostream& os, any val)
    {
        if (val._type == anyTypeId::undefined) {
            return os << "undefined";
        }

        if (val._type == anyTypeId::boolean) {
            return os << val._value._boolean;
        }

        if (val._type == anyTypeId::number) {
            return os << val._value._number;
        }

        if (val._type == anyTypeId::string) {
            return os << *(js::string*)val._value._data;
        }

        if (val._type == anyTypeId::function) {
            return os << "[function]";
        }

        if (val._type == anyTypeId::array) {
            return os << "[array]";
        }

        if (val._type == anyTypeId::object) {
            return os << "[object]";
        }

        return os << "[any]";
    }    
};

// End of Object
/*
template < typename T >
struct Element {
    bool _undefined;
    T _t;
    Element() : _undefined(true), _t(T())  {}
    Element(const T t) : _undefined(false), _t(t)  {}

    inline operator bool() {
        return !_undefined;
    }

    template<class I>
    inline decltype(_t[I()]) operator[] (I i) {
        return _t[i];
    }     

    friend std::ostream& operator << (std::ostream& os, Element<T> val)
    {
        os << "item:"; 
        if (_undefined) {
            return os << "undefined";    
        }

        return os << val._t;
    }        
};

template < typename T >
struct ElementReference {
    bool _undefined;
    T& _t;
    ElementReference() : _undefined(true), _t(T())  {}
    ElementReference(const T& t) : _undefined(false), _t(t)  {}

    inline operator bool() {
        return !_undefined;
    }

    inline operator T&() {
        return _t;
    }

    template<class I>
    inline decltype(_t[I()])& operator[] (I i) {
        return _t[i];
    }     

    friend std::ostream& operator << (std::ostream& os, ElementReference<T> val)
    {
        os << "ref:"; 
        if (_undefined) {
            return os << "undefined";    
        }

        return os << val._t;
    }    
};
*/

template < typename T >
struct ReadOnlyArray {
    number length;
    std::vector<T> _values;

    ReadOnlyArray() : _values() {
    }

    ReadOnlyArray(std::initializer_list<T> values) : _values(values) {
    }

    template<class I, class = std::enable_if<std::is_integral_v<I> || std::is_same_v<I, number>>>
    T operator[] (I i) const {
        if ((size_t)i >= _values.size()) {
            return T(undefined);
        }

        return _values[(size_t)i];
    }
};

template < typename T >
struct Array : public ReadOnlyArray<T> {

    Array() : ReadOnlyArray<T>() {
    }

    Array(std::initializer_list<T> values) : ReadOnlyArray<T>(values) {
    }

    template<class I, class = std::enable_if<std::is_integral_v<I> || std::is_same_v<I, number>>>
    T& operator[] (I i) {
        if ((size_t)i >= _values.size()) {
            return T(undefined);
        }

        return _values[(size_t)i];
    }

    void push(T t) {
        _values.push_back(t);
    }

    template <typename ... Args>
    void push(Args... args) {
        for (const auto& item : {args...}) {
            _values.push_back(item);
        }
    }

    T pop() {
        return _values.pop_back();
    }    
};

template < typename I, typename T> 
inline bool is(T* t) {
    return dynamic_cast<I*>(t) != nullptr;
}

template < typename I, typename T> 
inline bool __is(T* t) {
    return std::type_index(typeid(I*)) == std::type_index(typeid(t))
           || is<I>(t);
}

template <class T>
static string typeOf(T value);
template <>
static string typeOf(boolean value)
{
    return "boolean"_S;
}
template <>
static string typeOf(number value)
{
    return "number"_S;
}
template <>
static string typeOf(string value)
{
    return "string"_S;
}
template <>
static string typeOf(object value)
{
    return "object"_S;
}
static string typeOf(any value)
{
    return value.typeOf();
}

template< class T > static any Void(T value);
template<> 
static any Void(any value)
{
    return any();
}

struct Finally
{
private:    
	std::function<void()> _dtor;
public:
	Finally(std::function<void()> dtor) : _dtor(dtor) {};
	~Finally() { _dtor(); }
};

template <typename T>
inline auto isNaN(T t) {
    return std::isnan(NAN);
}

struct Date {
    number getHours() {
        return number(0);
    }
    
    number getMinutes() {
        return number(0);
    }

    number getSeconds() {
        return number(0);
    }
};

struct Function {

};

struct RegExp {

    js::string _pattern;

    RegExp (js::string pattern) : _pattern(pattern) {
    }

    js::boolean test(js::string val) {
        return false;
    }
};

template <typename T>
struct TypedArray {
    js::number length;
    TypedArray(js::number length_) : length(length_) {
    }
};

struct Int16Array : TypedArray<short> {
    Int16Array(js::number length_) : TypedArray(length_) {
    }
};

struct Uint16Array : TypedArray<unsigned short> {
    Uint16Array(js::number length_) : TypedArray(length_) {
    }
};

struct Float32Array : TypedArray<float> {
    Float32Array(js::number length_) : TypedArray(length_) {
    }
};

struct Float64Array : TypedArray<double> {
    Float64Array(js::number length_) : TypedArray(length_) {
    }
};

struct Int32Array : TypedArray<int> {
    Int32Array(js::number length_) : TypedArray(length_) {
    }
};

struct Uint32Array : TypedArray<unsigned int> {
    Uint32Array(js::number length_) : TypedArray(length_) {
    }
};

struct Int64Array : TypedArray<long> {
    Int64Array(js::number length_) : TypedArray(length_) {
    }
};

struct Uint64Array : TypedArray<unsigned long> {
    Uint64Array(js::number length_) : TypedArray(length_) {
    }
};

struct ArrayBuffer {
};

struct ArrayBufferView {
};

number parseInt(const js::string& value, int base = 10);

number parseFloat(const js::string& value);

template <typename T>
struct Promise {
    static void all() {
    }

    void _catch() {
    }

    void finally() {
    }

    void then() {
    }

    static void race() {
    }

    static void reject() {
    }

    static void resolve() {
    }
};

static struct MathImpl
{
    static js::number E;
    static js::number LN10;
    static js::number LN2;
    static js::number LOG2E;
    static js::number LOG10E;
    static js::number PI;
    static js::number SQRT1_2;
    static js::number SQRT2;

    static number pow(number op, number op2) {
        return number(std::pow((double)op, (double)op2));
    }

    static number min(number op, number op2) {
        return number(std::min((double)op, (double)op2));
    }

    static number max(number op, number op2) {
        return number(std::max((double)op, (double)op2));
    }

    static number sin(number op) {
        return number(std::sin((double)op));
    }

    static number cos(number op) {
        return number(std::cos((double)op));
    }

    static number asin(number op) {
        return number(std::asin((double)op));
    }

    static number acos(number op) {
        return number(std::acos((double)op));
    }

    static number abs(number op) {
        return number(std::abs((double)op));
    }

    static number floor(number op) {
        return number(std::floor((double)op));
    }

    static number round(number op, int numDecimalPlaces = 0) {
        const auto mult = 10 ^ (numDecimalPlaces);
        return number(std::floor((double)op * mult + 0.5) / mult);
    }

    static number sqrt(number op) {
        return number(std::sqrt((double)op));
    }

    static number tan(number op) {
        return number(std::tan((double)op));
    }

    static number atan(number op) {
        return number(std::atan((double)op));
    }

    static number atan2(number op1, number op2) {
        return number(std::atan2((double)op1, (double)op2));
    }

    static number log(number op) {
        return number(std::log((double)op));
    }

    static number exp(number op) {
        return number(std::exp((double)op));
    }

    static number random() {
        std::default_random_engine generator;
        std::uniform_real_distribution<double> distribution(0.0, 1.0);
        auto rnd = distribution(generator);
        return number(rnd);
    }
} Math;

std::ostream& operator << (std::ostream& os, std::nullptr_t ptr);

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

    template<class ... Args>
    void warn(Args ... args) 
    {
        for (auto& arg : {args...}) 
        {
            std::clog << arg;
        }

        std::clog << std::endl;
    }

    template<class ... Args>
    void error(Args ... args) 
    {
        for (auto& arg : {args...}) 
        {
            std::cerr << arg;
        }

        std::cerr << std::endl;
    }

} console;

struct XMLHttpRequest {    
};

template <typename T>
using ArrayLike = Array<T>;

struct HTMLElement {
};

struct HTMLImageElement {
};

} // namespace js

namespace std
{
    template<> struct hash<js::any>
    {
        typedef js::any argument_type;
        typedef std::size_t result_type;
        result_type operator()(argument_type const& value) const
        {
            return value.hash();
        }
    };
}

#endif // CORE_H