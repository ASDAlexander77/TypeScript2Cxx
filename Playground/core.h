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

namespace js
{

#define OR(x, y) ((bool)(x) ? (x) : (y))
#define AND(x, y) ((bool)(x) ? (y) : (x))

#define EQUALS(x, y) ((x) == (y))
#define NOT_EQUALS(x, y) (!((x) == (y)))

struct any;
struct object;

inline std::size_t hash_combine(const std::size_t hivalue, const std::size_t lovalue)
{
    return lovalue + 0x9e3779b9 + (hivalue << 6) + (hivalue >> 2);
}

struct undefined_c {

    bool isUndefined;

    undefined_c () {
        isUndefined = false;
    }

    undefined_c (bool value) : isUndefined(value) {
    }

    inline operator bool() {
        return !isUndefined;
    }

    friend std::ostream& operator << (std::ostream& os, undefined_c val)
    {
        return os << "undefined";
    }       
} undefined(true);

struct boolean : public undefined_c {

    bool _value;

    boolean (bool initValue) {
        _value = initValue;
    }

    boolean (const undefined_c& undef) : undefined_c(true) {
    }

    inline operator bool() {
        if (isUndefined) {
            return undefined_c::operator bool();
        }

        return _value;
    }

    friend std::ostream& operator << (std::ostream& os, boolean val)
    {
        return os << ((bool)val ? "true" : "false");
    }       
};

struct number : public undefined_c {

    double _value;

    number() : _value(0) {
    }

    template<class T, class = std::enable_if<std::is_integral_v<T>>>
    number (T initValue) {
        _value = static_cast<T>(initValue);
    }

    number (const undefined_c& undef) : undefined_c(true) {
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

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    number operator +(T t) {
        return number(_value + t);
    }

    number operator +(number n) {
        return number(_value + n._value);
    }

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    number operator -(T t) {
        return number(_value - t);
    }

    number operator -(number n) {
        return number(_value - n._value);
    }    

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    number operator *(T t) {
        return number(_value * t);
    }

    number operator *(number n) {
        return number(_value * n._value);
    }   

    template<class T, class = std::enable_if<std::is_arithmetic_v<T>>>
    number operator /(T t) {
        return number(_value / t);
    }

    number operator /(number n) {
        return number(_value / n._value);
    }   

    friend std::ostream& operator << (std::ostream& os, number val)
    {
        return os << val._value;
    }       
};

struct string : public undefined_c {

    std::string _value;

    string () : _value() {
    }    

    string (std::string value) : _value(value) {
    }

    string (const char* value) : _value(value) {
    }    

    string (const undefined_c& undef) : undefined_c(true) {
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

struct array : public undefined_c {

    std::vector<any> _values;

    array ();

    array (std::initializer_list<any> values);

    array (const undefined_c& undef) : undefined_c(true) {
    }    

    template<class T, class = std::enable_if<std::is_integral_v<T> || std::is_same_v<T, number>>>
    any& operator[] (T t);

    friend std::ostream& operator << (std::ostream& os, array val)
    {
        return os << "[array]";
    }
};

struct object : public undefined_c {

    using pair = std::pair<std::string, any>;

    std::unordered_map<std::string, any> _values;

    object ();

    object (std::initializer_list<pair> values);

    object (const undefined_c& undef) : undefined_c(true) {
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

struct regex : public undefined_c {

    string _pattern;

    regex (string pattern) : _pattern(pattern) {
    }

    regex (const undefined_c& undef) : undefined_c(true) {
    }

    boolean test(string val) {
        return false;
    }

    friend std::ostream& operator << (std::ostream& os, regex val)
    {
        return os << "[regex]";
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

    any (const undefined_c& undef) : _type(anyTypeId::undefined) {
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

// Array
array::array() : _values() {
}

array::array (std::initializer_list<any> values) : _values(values) {
}

template<class T, class>
any& array::operator[] (T t) {
    return _values[(size_t)t];
}

// End of Array

// Object
object::object() : _values() {
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
    Array(std::initializer_list<T> values) : ReadOnlyArray<T>(values) {
    }

    template<class I, class = std::enable_if<std::is_integral_v<I> || std::is_same_v<I, number>>>
    T& operator[] (I i) {
        if ((size_t)i >= _values.size()) {
            return T(undefined);
        }

        return _values[(size_t)i];
    }
};

string operator ""_S(const char* s, std::size_t size) {
    return string(s);
}


std::ostream& operator << (std::ostream& os, std::nullptr_t ptr)
{
    return os << "null";
}    

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