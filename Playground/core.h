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
#include <regex>
#include <limits>
#include <algorithm>
#include <numeric>

namespace js
{

//#define OR(x, y) ((bool)(x) ? (x) : (y))
//#define AND(x, y) ((bool)(x) ? (y) : (x))
#define OR(x, y) ([&]() { auto vx = (x); return (static_cast<bool>(vx)) ? vx : (y); })()
#define AND(x, y) ([&]() { auto vx = (x); return (static_cast<bool>(vx)) ? (y) : vx; })()

struct undefined_t;
struct pointer_t;
struct any;
struct object;
struct string;

namespace tmpl {
    template <typename T> struct number;
}
typedef tmpl::number<double> number;

template<class _Ty>
struct is_stringish : std::bool_constant<std::is_same_v<_Ty, const char*> || std::is_same_v<_Ty, std::string> || std::is_same_v<_Ty, string> || std::is_same_v<_Ty, any>>
{
};

template<class _Ty>
constexpr bool is_stringish_v = is_stringish<_Ty>::value;

template <typename T>
struct _Deduction_MethodPtr;

inline std::size_t hash_combine(const std::size_t hivalue, const std::size_t lovalue)
{
    return lovalue + 0x9e3779b9 + (hivalue << 6) + (hivalue >> 2);
}

static std::ostream &operator<<(std::ostream &os, std::nullptr_t ptr)
{
    return os << "null";
}

template <typename I, typename T>
inline bool is(T *t)
{
    return dynamic_cast<I *>(t) != nullptr;
}

template <typename I, typename T>
inline bool is(const std::shared_ptr<T> &t)
{
    return std::dynamic_pointer_cast<I>(t) != nullptr;
}

template <typename I, typename T>
inline bool __is(T *t)
{
    return std::type_index(typeid(I *)) == std::type_index(typeid(t)) || is<I>(t);
}

template <class T>
static string type_of(T value);

template <typename T>
inline auto isNaN(T t)
{
    return std::isnan(static_cast<double>(t));
}

template <typename R, typename T>
inline R cast(T t)
{
    return static_cast<R>(t);
}

template <typename T>
constexpr const T &const_(T &t)
{
    return static_cast<const T &>(t);
}

template <typename T>
constexpr const T *const_(T *t)
{
    return static_cast<const T *>(t);
}

/*
template <typename T> 
constexpr const T const_(T t) {
	return static_cast<const T>(t);
}
*/

template <typename T>
constexpr T &mutable_(const T &t)
{
    return const_cast<T &>(t);
}

template <typename T>
constexpr T *mutable_(const T *t)
{
    return const_cast<T *>(t);
}

template <typename T>
constexpr T &deref_(T *t)
{
    return *t;
}

template <typename T>
constexpr T deref_(T t)
{
    return t;
}

template <typename T>
constexpr auto keys_(const T &t) -> decltype(mutable_(t)->keys())
{
    return mutable_(t)->keys();
}

template <typename T>
constexpr auto keys_(T &t) -> decltype(t->keys())
{
    return t->keys();
}

namespace bitwise
{
template <typename T1, typename T2>
constexpr auto rshift(T1 op1, T2 op2)
{
    auto op1ll = static_cast<long long>(op1);
    auto op1l = static_cast<long>(op1ll);
    auto op2ll = static_cast<long long>(op2);
    auto op2ul = static_cast<unsigned long>(op2ll);
    auto op2ul32 = op2ul & 0x1f;
    auto r = op1l >> op2ul32;
    auto rl = static_cast<long>(r);
    return static_cast<T1>(rl);    
}

template <typename T1, typename T2>
constexpr auto rshift_nosign(T1 op1, T2 op2)
{
    auto op1ll = static_cast<long long>(op1);
    auto op1ul = static_cast<unsigned long>(op1ll);
    auto op2ll = static_cast<long long>(op2);
    auto op2ul = static_cast<unsigned long>(op2ll);
    auto op2ul32 = op2ul & 0x1f;
    auto r = op1ul >> op2ul32;
    auto rul = static_cast<unsigned long>(r);
    return static_cast<T1>(rul);    
}

template <typename T1, typename T2>
constexpr auto lshift(T1 op1, T2 op2)
{
    auto op1ll = static_cast<long long>(op1);
    auto op1l = static_cast<long>(op1ll);
    auto op2ll = static_cast<long long>(op2);
    auto op2ul = static_cast<unsigned long>(op2ll);
    auto op2ul32 = op2ul & 0x1f;
    auto r = op1l << op2ul32;
    auto rl = static_cast<long>(r);
    return static_cast<T1>(rl);
}

} // namespace bitwise

static struct undefined_t
{
    constexpr undefined_t()
    {
    }

    constexpr undefined_t(const undefined_t &)
    {
    }    

    constexpr operator bool()
    {
        return false;
    }

    constexpr operator std::nullptr_t()
    {
        return nullptr;
    }

    constexpr bool operator==(undefined_t)
    {
        return true;
    }

    constexpr bool operator!=(undefined_t)
    {
        return false;
    }

    constexpr bool operator==(const pointer_t&)
    {
        return false;
    }

    constexpr bool operator!=(const pointer_t&)
    {
        return true;
    }

    friend std::ostream &operator<<(std::ostream &os, undefined_t)
    {
        return os << "undefined";
    }
} undefined;

struct void_t
{
    constexpr operator void()
    {
    }

    constexpr operator bool()
    {
        return false;
    }

    constexpr bool operator==(void_t)
    {
        return true;
    }

    constexpr bool operator!=(void_t)
    {
        return false;
    }     

    constexpr bool operator==(undefined_t)
    {
        return true;
    }

    constexpr bool operator!=(undefined_t)
    {
        return false;
    }        

    template <typename T>
    constexpr bool operator==(T)
    {
        return false;
    }

    template <typename T>
    constexpr bool operator!=(T)
    {
        return true;
    }        
};

static struct pointer_t
{
    bool isUndefined;
    void* _ptr;

    pointer_t() : _ptr(nullptr), isUndefined(false) 
    {
    };

    pointer_t(const pointer_t& other) : _ptr(other._ptr), isUndefined(other.isUndefined) 
    {
    };

    pointer_t(void* ptr) : _ptr(ptr), isUndefined(false) 
    {
    };

    pointer_t(std::nullptr_t) : _ptr(nullptr), isUndefined(false) 
    {
    };

    pointer_t(number);
    
    pointer_t(const undefined_t &undef) : _ptr(nullptr), isUndefined(true)
    {
    }

    constexpr operator bool()
    {
        return !isUndefined && _ptr != nullptr;
    }

    bool operator==(undefined_t)
    {
        return isUndefined;
    }

    bool operator!=(undefined_t)
    {
        return !isUndefined;
    }

    bool operator==(pointer_t p)
    {
        return isUndefined == p.isUndefined && _ptr == p._ptr;
    }

    bool operator!=(pointer_t p)
    {
        return isUndefined != p.isUndefined || _ptr != p._ptr;
    }

    bool operator==(js::number n);

    bool operator!=(js::number n);

    friend bool operator==(js::number n, pointer_t p);

    friend bool operator!=(js::number n, pointer_t p);

/*
    constexpr operator std::nullptr_t()
    {
        return nullptr;
    }
*/

    template <typename T>
    constexpr operator std::shared_ptr<T>()
    {
        return std::shared_ptr<T>(static_cast<T*>(_ptr));
    }  

    template <typename T>
    constexpr operator const T*()
    {
        return isUndefined ? static_cast<const T*>(nullptr) : static_cast<const T*>(_ptr);
    }  

    friend std::ostream &operator<<(std::ostream &os, pointer_t val)
    {
        if (!val.isUndefined && val._ptr == nullptr) {
            return os << "null";
        }

        return os << val._ptr;
    }      
} null;


template <typename L, typename R>
constexpr bool equals(L l, R r)
{
    auto lIsUndef = l == undefined;
    auto lIsNull = l == null;
    auto rIsUndef = r == undefined;
    auto rIsNull = r == null;
    return ((lIsUndef || lIsNull) && (rIsUndef || rIsNull)) || l == r;
}

template <typename L, typename R>
constexpr bool not_equals(L l, R r)
{
    return !equals(l, r);
}

struct boolean
{
    using value_type = int;
    value_type _control;

    constexpr boolean() : _control(2)
    {
    }

    inline boolean(const boolean &value) : _control(value._control)
    {
    }    

    inline boolean(bool value) : _control(value)
    {
    }

    constexpr boolean(const undefined_t &) : boolean()
    {
    }

    constexpr operator bool() const
    {
        return _control == 1;
    }

    constexpr operator bool()
    {
        return _control == 1;
    }

    constexpr boolean *operator->()
    {
        return this;
    }

    inline bool operator==(undefined_t) const {
        return _control == 2;
    }   

    inline bool operator!=(undefined_t) const {
        return _control != 2;
    }    

    inline bool operator==(pointer_t) const {
        return false;
    }       

    inline bool operator!=(pointer_t) const {
        return true;
    }       

    inline bool operator==(undefined_t) {
        return _control == 2;
    }   

    inline bool operator!=(undefined_t) {
        return _control != 2;
    }    

    inline bool operator==(pointer_t) {
        return false;
    }       

    inline bool operator!=(pointer_t) {
        return true;
    }       

    inline bool operator==(boolean other) {
        return static_cast<bool>(*this) == static_cast<bool>(other);
    }    

    friend std::ostream &operator<<(std::ostream &os, boolean val)
    {
        if (val._control == std::numeric_limits<value_type>::max())
        {
            return os << "undefined";
        }

        return os << (static_cast<bool>(val) ? "true" : "false");
    }
};

static struct boolean true_t(true);
static struct boolean false_t(false);

namespace tmpl
{
template <typename V>
struct number
{
    using number_t = number<V>;
    V _value;

    number() : _value{-std::numeric_limits<V>::quiet_NaN()}
    {
    }

    number(const number& value) : _value{value._value}
    {
    }

    template <typename T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    number(T initValue) :  _value{static_cast<V>(initValue)}
    {
    }

    template <typename T>
    number(T initValue, std::enable_if_t<std::is_enum_v<T>, int> = 0) : _value{static_cast<int>(initValue)}
    {
    }    

    number(const undefined_t &undef) : _value{-std::numeric_limits<V>::quiet_NaN()}
    {
    }

    inline bool isUndefined() {
        return std::signbit(_value) && std::isnan(_value);
    }

    constexpr operator size_t()
    {
        return static_cast<size_t>(_value);
    }

    constexpr operator bool()
    {
        return std::isnormal(_value);
    }

    constexpr operator double()
    {
        return _value;
    }

    constexpr operator long long()
    {
        return static_cast<long long>(_value);
    }    

    constexpr number_t *operator->()
    {
        return this;
    }

    operator std::string() const
    {
        std::ostringstream streamObj2;
        streamObj2 << _value;
        return streamObj2.str();
    }    

    operator std::string()
    {
        std::ostringstream streamObj2;
        streamObj2 << _value;
        return streamObj2.str();
    }

    operator string();

    number_t operator+()
    {
        return +_value;
    }

    number_t &operator++()
    {
        _value += 1;
        return *this;
    }

    number_t operator++(int)
    {
        number_t tmp(*this);
        operator++();
        return tmp;
    }

    friend number_t operator+(const number_t n, number_t value)
    {
        return n._value + value._value;
    }

    number_t &operator+=(number_t other)
    {
        _value += other._value;
        return *this;
    }

    number_t operator-(number_t n)
    {
        return _value - n._value;
    }

    number_t operator-()
    {
        return -_value;
    }

    number_t &operator--()
    {
        _value -= 1;
        return *this;
    }

    number_t operator--(int)
    {
        number_t tmp(*this);
        operator--();
        return tmp;
    }

    number_t &operator-=(number_t other)
    {
        _value -= other._value;
        return *this;
    }

    number_t operator*(number_t n)
    {
        return _value * n._value;
    }

    number_t &operator*=(number_t other)
    {
        _value *= other._value;
        return *this;
    }

    number_t operator/(number_t n)
    {
        return _value / n._value;
    }

    number_t &operator/=(number_t other)
    {
        _value /= other._value;
        return *this;
    }

    number_t operator^(number_t n)
    {
        return number_t(static_cast<long>(_value) ^ static_cast<long>(n._value));
    }

    number_t &operator^=(number_t other)
    {
        _value = static_cast<long>(_value) ^ static_cast<long>(other._value);
        return *this;
    }

    number_t operator|(number_t n)
    {
        return number_t(static_cast<long>(_value) | static_cast<long>(n._value));
    }

    number_t &operator|=(number_t other)
    {
        _value = static_cast<long>(_value) | static_cast<long>(other._value);
        return *this;
    }

    number_t operator&(number_t n)
    {
        return number_t(static_cast<long>(_value) & static_cast<long>(n._value));
    }

    number_t &operator&=(number_t other)
    {
        _value = static_cast<long>(_value) & static_cast<long>(other._value);
        return *this;
    }

    number_t operator%(number_t n)
    {
        return number_t(static_cast<long>(_value) % static_cast<long>(n._value));
    }

    number_t &operator%=(number_t other)
    {
        _value = static_cast<long>(_value) % static_cast<long>(other._value);
        return *this;
    }

    number_t operator<<(number_t n)
    {
        return number_t(static_cast<long>(_value) << static_cast<long>(n._value));
    }

    number_t &operator<<=(number_t other)
    {
        _value = static_cast<long>(_value) << static_cast<long>(other._value);
        return *this;
    }    

    number_t operator>>(number_t n)
    {
        return number_t(static_cast<long>(_value) >> static_cast<long>(n._value));
    }    

    number_t &operator>>=(number_t other)
    {
        _value = static_cast<long>(_value) >> static_cast<long>(other._value);
        return *this;
    }    

    number_t operator~()
    {
        return ~static_cast<long>(_value);
    }

    bool operator==(const undefined_t&)
    {
        return isUndefined();
    }

    bool operator!=(const undefined_t&)
    {
        return !isUndefined();
    }

    bool operator==(number_t n)
    {
        return _value == n._value;
    }

    bool operator!=(number_t n)
    {
        return _value != n._value;
    }

    bool operator<(number_t n)
    {
        return _value < n._value;
    }

    bool operator<=(number_t n)
    {
        return _value <= n._value;
    }

    bool operator>(number_t n)
    {
        return _value > n._value;
    }

    bool operator>=(number_t n)
    {
        return _value >= n._value;
    }

    js::string toString();
    js::string toString(number_t radix);

    friend std::ostream &operator<<(std::ostream &os, number_t val)
    {
        if (val.isUndefined())
        {
            return os << "undefined";
        }

        if (std::isnan(val))
        {
            return os << "NaN";
        }        

        return os << val._value;
    }
};
}

struct string
{
    int _control; // 0 - defined, 1 - null, 2 - undefined
    std::string _value;

    string() : _value(), _control(2)
    {
    }

    string(const string& value) : _value(value._value), _control(value._control)
    {
    }

    string(pointer_t v) : _value(v ? static_cast<const char *>(v) : ""), _control(v ? 0 : 1)
    {
    }    

    string(std::string value) : _value(value), _control(0)
    {
    }

    string(const char *value) : _value(value), _control(value == nullptr ? 1 : 0)
    {
    }

    string(const char value) : _value(1, value), _control(0)
    {
    }

    string(const undefined_t &) : _control(2)
    {
    }

    string(any val);

    inline operator const char *()
    {
        return _value.c_str();
    }

    inline operator bool()
    {
        return _control == 0 && !_value.empty();
    }

    inline operator double()
    {
        return !(*this) ? 0 : std::stod(_value);
    }

    inline operator size_t()
    {
        return _value.size();
    }    

    inline bool is_null() const
    {
        return _control == 1;
    }

    inline bool is_undefined() const
    {
        return _control == 2;
    }

    js::number get_length()
    {
        return js::number(_value.size());
    }

    constexpr string *operator->()
    {
        return this;
    }

    string operator[](number n) const
    {
        return string(_value[n]);
    }

    string operator+(boolean b)
    {
        return string(_value + (b ? "true" : "false"));
    }

    string operator+(number value)
    {
        return string(_value + value.operator std::string());
    }

    string operator+(string value)
    {
        return string(_value + value._value);
    }

    friend string operator+(const string& value, string other)
    {
        return mutable_(value) + other;
    }

    string operator+(pointer_t ptr)
    {
        return string(_value + ((!ptr) ? "null" : std::to_string(ptr)));
    }    

    string operator+(any value);

    string &operator+=(char c)
    {
        _control = 0;
        _value.append(string(c));
        return *this;
    }    

    string &operator+=(number n)
    {
        auto value = n.operator std::string();
        _control = 0;
        _value.append(value);
        return *this;
    }

    string &operator+=(string value)
    {
        _control = 0;
        _value.append(value._value);
        return *this;
    }

    string &operator+=(any value);

    bool operator==(const js::string &other) const
    {
        return !_control && _value.compare(other._value) == 0;
    }

    bool operator==(const js::string &other)
    {
        return !_control && _value.compare(other._value) == 0;
    }

    bool operator!=(const js::string &other) const
    {
        return !_control && _value.compare(other._value) != 0;
    }

    bool operator!=(const js::string &other)
    {
        return !_control && _value.compare(other._value) != 0;
    }

    bool operator==(undefined_t)
    {
        return _control == 2;
    }

    friend bool operator==(undefined_t, const js::string& other)
    {
        return other._control == 2;
    }    

    bool operator!=(undefined_t)
    {
        return _control != 2;
    }    

    friend bool operator!=(undefined_t, const js::string& other)
    {
        return other._control != 2;
    }   

    bool operator==(pointer_t ptr)
    {
        return _control == 1 && (!ptr);
    }

    friend bool operator==(pointer_t ptr, const js::string& other)
    {
        return other._control == 1 && (!ptr);
    }    

    bool operator!=(pointer_t ptr)
    {
        return !_control && (!ptr);
    }    

    friend bool operator!=(pointer_t ptr, const js::string& other)
    {
        return !other._control && (!ptr);
    }   

    string concat(string value)
    {
        return _value + value._value;
    }

    string charAt(number n) const
    {
        return _value[n];
    }

    number charCodeAt(number n) const
    {
        return _value[n];
    }

    string fromCharCode(number n) const
    {
        return static_cast<char>(static_cast<size_t>(n));
    }

    string toUpperCase()
    {
        std::string result(*this);
        for (auto &c : result)
        {
            c = toupper(c);
        }

        return string(result);
    }

    string toLowerCase()
    {
        std::string result(*this);
        for (auto &c : result)
        {
            c = tolower(c);
        }

        return string(result);
    }

    string substring(number begin, number end)
    {
        return _value.substr(begin, end - begin);
    }

    string slice(number begin)
    {
        return _value.substr(begin < number(0) ? get_length() + begin : begin, get_length() - begin);
    }

    string slice(number begin, number end)
    {
        auto endStart = end < number(0) ? get_length() + end : end;
        auto endPosition = begin < number(0) ? get_length() + begin : begin;
        return _value.substr(begin < number(0) ? get_length() + begin : begin, (endStart >= endPosition) ? endStart - endPosition : number(0));
    }

    auto begin() -> decltype(_value.begin())
    {
        return _value.begin();
    }

    auto end() -> decltype(_value.end())
    {
        return _value.end();
    }

    friend std::ostream &operator<<(std::ostream &os, string val)
    {
        if (val._control == 2)
        {
            return os << "undefined";
        }

        return os << val._value;
    }

    size_t hash(void) const noexcept
    {
        return std::hash<std::string>{}(_value);
    }    
};

static js::string operator""_S(const char *s, std::size_t size)
{
    return js::string(s);
}

static js::number operator""_N(long double value)
{
    return js::number(value);
}

static js::number operator""_N(unsigned long long value)
{
    return js::number(value);
}

static js::number operator+(const string& v)
{
    return number(static_cast<double>(mutable_(v)));
}

static js::number operator+(pointer_t ptr)
{
    return number(reinterpret_cast<size_t>(ptr._ptr));
}

template <typename Rx, typename _Cls, typename... Args>
struct _Deduction_MethodPtr<Rx (__thiscall _Cls::*)(Args...) const>
{
    using _ReturnType = Rx;
    const static size_t _CountArgs = sizeof...(Args);
};

template <typename Rx, typename _Cls, typename... Args>
struct _Deduction_MethodPtr<Rx (__thiscall _Cls::*)(Args...)>
{
    using _ReturnType = Rx;
    const static size_t _CountArgs = sizeof...(Args);
};

template <typename Rx, typename... Args>
struct _Deduction_MethodPtr<Rx (__cdecl *)(Args...)>
{
    using _ReturnType = Rx;
    const static size_t _CountArgs = sizeof...(Args);
};

template <typename F, typename _type = decltype(&F::operator())>
struct _Deduction
{
    using type = _type;
};

template <typename F, typename Array, std::size_t... I>
auto invoke_seq_impl(const F &f, Array &a, std::index_sequence<I...>)
{
    return std::invoke(f, a[I]...);
}

template <std::size_t N, typename F, typename Array, typename Indices = std::make_index_sequence<N>>
auto invoke_seq(const F &f, Array &a)
{
    return invoke_seq_impl(f, a, Indices{});
}

template <typename F, typename Array, std::size_t... I>
auto invoke_seq_impl(F &f, Array &a, std::index_sequence<I...>)
{
    return std::invoke(f, a[I]...);
}

template <std::size_t N, typename F, typename Array, typename Indices = std::make_index_sequence<N>>
auto invoke_seq(F &f, Array &a)
{
    return invoke_seq_impl(f, a, Indices{});
}

struct function
{
    virtual any invoke(std::initializer_list<any> args_) = 0;

    template <typename... Args>
    auto operator()(Args... args);
};

template <typename F, typename _MethodType = typename _Deduction<F>::type>
struct function_t : function
{
    using _MethodPtr = _Deduction_MethodPtr<_MethodType>;
    using _ReturnType = typename _MethodPtr::_ReturnType;

    F _f;

    function_t(const F &f) : _f{f}
    {
    }

    virtual any invoke(std::initializer_list<any> args_) override;
};

template <typename T>
struct ArrayKeys
{
    typedef ArrayKeys<T> iterator;

    T _index;
    T _end;

    ArrayKeys(T end_) : _index(0), _end(end_)
    {
    }

    iterator &begin()
    {
        return *this;
    }

    iterator &end()
    {
        return *this;
    }

    const T &operator*()
    {
        return _index;
    }

    bool operator!=(const iterator &rhs)
    {
        return _index != rhs._end;
    }

    iterator &operator++()
    {
        _index++;
        return *this;
    }
};

namespace tmpl
{
template <typename E>
struct array
{
    using array_type = std::vector<E>;
    using array_type_ptr = std::shared_ptr<array_type>;
    using array_type_ref = array_type&;

    bool isUndefined;
    array_type_ptr _values;

    array() : _values(std::make_shared<array_type>()), isUndefined(false)
    {
    }

    array(const array& value) : _values(value._values), isUndefined(value.isUndefined)
    {
    }    

    array(std::initializer_list<E> values) : _values(std::make_shared<array_type>(values)), isUndefined(false)
    {
    }

    array(std::vector<E> values) : _values(std::make_shared<array_type>(values)), isUndefined(false)
    {
    }    

    array(const undefined_t &undef) : isUndefined(true)
    {
    }

    constexpr operator bool()
    {
        return !isUndefined;
    }

    constexpr array *operator->()
    {
        return this;
    }

    inline array_type_ref get() const {
        return *_values.get();
    }

    js::number get_length() {
        return js::number(get().size());
    }

    E &operator[](js::number i) const
    {
        if (static_cast<size_t>(i) >= get().size())
        {
            return E(undefined);
        }

        return mutable_(get())[static_cast<size_t>(i)];
    }

    E &operator[](js::number i)
    {
        while (static_cast<size_t>(i) >= get().size())
        {
            get().push_back(undefined_t());
        }

        return get()[static_cast<size_t>(i)];
    }

    ArrayKeys<js::number> keys()
    {
        return ArrayKeys<js::number>(get().size());
    }

    void push(E t)
    {
        get().push_back(t);
    }

    template <typename... Args>
    void push(Args... args)
    {
        for (const auto &item : {args...})
        {
            get().push_back(item);
        }
    }

    E pop()
    {
        return get().pop_back(); 
    }

    template <typename... Args>
    void splice(size_t position, size_t size, Args... args) 
    {
        get().erase(get().cbegin() + position, get().cbegin() + position + size);
        get().insert(get().cbegin() + position, {args...});
    }

    array slice(size_t first, size_t last) 
    {
        return array(std::vector<E>(get().cbegin() + first, get().cbegin() + last + 1));
    }

    js::number indexOf(E e) 
    {
        return js::number(get().cend() - std::find(get().cbegin(), get().cend(), e) - 1);
    }

    js::boolean removeElement(E e) 
    {
        return js::boolean(get().erase(std::find(get().cbegin(), get().cend(), e)) != get().cend());
    }

    auto begin() -> decltype(get().begin())
    {
        return get().begin();
    }

    auto end() -> decltype(get().end())
    {
        return get().end();
    }

    friend std::ostream &operator<<(std::ostream &os, array val)
    {
        if (val.isUndefined)
        {
            return os << "undefined";
        }

        return os << "[array]";
    }

    bool exists(js::number i) const
    {
        return static_cast<size_t>(i) < get().size();
    }

    template <class T>
    bool exists(T) const
    {
        return false;
    }

    array filter(std::function<bool(E)> p) {
        std::vector<E> result;
        std::copy_if(_values.get()->begin(), _values.get()->end(), std::back_inserter(result), p);
        return result;
    }

    array filter(std::function<bool(E, js::number)> p) {
        std::vector<E> result;
        auto first = &(*_values.get())[0];
        std::copy_if(_values.get()->begin(), _values.get()->end(), std::back_inserter(result), [=] (auto& v) {
            js::number index = &v - first;
            return p(v, index);
        });
        return result;
    }    

    array map(std::function<void()> p) {
        std::vector<E> result;
        std::transform(_values.get()->begin(), _values.get()->end(), std::back_inserter(result), [=] (auto& v) {
            p();
            return E();
        });
        return result;
    }

    array map(std::function<E()> p) {
        std::vector<E> result;
        std::transform(_values.get()->begin(), _values.get()->end(), std::back_inserter(result), [=] (auto& v) {
            return p();
        });
        return result;
    }

    array map(std::function<E(E)> p) {
        std::vector<E> result;
        std::transform(_values.get()->begin(), _values.get()->end(), std::back_inserter(result), p);
        return result;
    }

    array map(std::function<E(E, js::number)> p) {
        std::vector<E> result;
        auto first = &(*_values.get())[0];
        std::transform(_values.get()->begin(), _values.get()->end(), std::back_inserter(result), [=] (auto& v) {
            js::number index = &v - first;
            return p(v, index);
        });
        return result;
    }

    template <typename P>
    any reduce(P p) {
        return std::reduce(_values.get()->begin(), _values.get()->end(), 0_N, p);
    }    

    template <typename P, typename I>
    any reduce(P p, I initial) {
        return std::reduce(_values.get()->begin(), _values.get()->end(), initial, p);
    }    

    template <typename P>
    boolean every(P p) {
        return std::all_of(_values.get()->begin(), _values.get()->end(), p);
    }    

    template <typename P>
    boolean some(P p) {
        return std::any_of(_values.get()->begin(), _values.get()->end(), p);
    }    

    string join(string s)
    {
        return std::accumulate(_values.get()->begin(), _values.get()->end(), string{}, [&] (auto &res, const auto &piece) -> decltype(auto) { 
            return res += (res) ? s + piece : piece; 
        });
    } 

    void forEach(std::function<void(E)> p) {
        std::for_each(_values.get()->begin(), _values.get()->end(), p);
    }

    void forEach(std::function<void(E, js::number)> p) {
        auto first = &(*_values.get())[0];
        std::result(_values.get()->begin(), _values.get()->end(), [=] (auto& v) {
            js::number index = &v - first;
            return p(v, index);
        });
    }    
};

} // namespace tmpl

typedef tmpl::array<any> array;

template <typename TKey, typename TMap>
struct ObjectKeys
{
    typedef ObjectKeys<TKey, TMap> iterator;
    typedef decltype(((TMap*)nullptr)->begin()) TIterator_map;

    TIterator_map _index;
    const TIterator_map _end;

    ObjectKeys(TMap &values_) : _index(values_.begin()), _end(values_.end())
    {
    }

    iterator &begin()
    {
        return *this;
    }

    iterator &end()
    {
        return *this;
    }

    const TKey &operator*()
    {
        return _index->first;
    }

    bool operator!=(const iterator &rhs)
    {
        return _index != rhs._end;
    }

    iterator &operator++()
    {
        ++_index;
        return *this;
    }
};

struct object
{
    struct string_hash
    {
        typedef js::string argument_type;
        typedef std::size_t result_type;
        result_type operator()(argument_type const &value) const
        {
            return value.hash();
        }
    };

    struct string_equal_to
    {
        typedef js::string argument_type;
        bool operator()(argument_type const &value, argument_type const &other) const
        {
            return value == other;
        }
    };

    using object_type = std::unordered_map<string, any, string_hash, string_equal_to>;
    using object_type_ptr = std::shared_ptr<object_type>;
    using object_type_ref = object_type&;
    using pair = std::pair<string, any>;

    bool isUndefined;
    object_type_ptr _values;

    object();

    object(const object& value);

    object(std::initializer_list<pair> values);

    object(const undefined_t &undef) : isUndefined(true)
    {
    }

    virtual ~object()
    {
    }

    constexpr operator bool()
    {
        return !isUndefined;
    }

    inline object_type_ref get() const {
        return *_values.get();
    }

    ObjectKeys<js::string, object_type> keys();

    constexpr object *operator->()
    {
        return this;
    }

    any &operator[](number n) const;

    any &operator[](const char *s) const;

    any &operator[](std::string s) const;

    any &operator[](string s) const;

    any &operator[](number n);

    any &operator[](const char *s);

    any &operator[](std::string s);

    any &operator[](string s);

    any &operator[](undefined_t undef);

    inline bool operator==(const object& other) {
        // TODO - finish it
        return isUndefined == other.isUndefined && isUndefined == true;
    }

    void Delete(const char *field)
    {
        get().erase(field);
    }

    template <class T>
    bool exists(T i) const
    {
        if constexpr (std::is_same_v<T, js::number> || is_stringish_v<T>) 
        {
            return get().find(i) != get().end();
        }

        return false;
    }

    virtual js::string toString()
    {
        std::ostringstream streamObj2;
        streamObj2 << *this;
        return streamObj2.str();
    }

    friend std::ostream &operator<<(std::ostream &os, object val)
    {
        if (val.isUndefined)
        {
            return os << "undefined";
        }

        return os << "[object]";
    }
};

struct any
{
    struct any_hash
    {
        typedef js::any argument_type;
        typedef std::size_t result_type;
        result_type operator()(argument_type const &value) const
        {
            return value.hash();
        }
    };

    struct any_equal_to
    {
        typedef js::any argument_type;
        bool operator()(argument_type const &value, argument_type const &other) const
        {
            return value == other;
        }
    };

    enum struct anyTypeId
    {
        undefined_type,
        boolean_type,
        number_type,
        string_type,
        function_type,
        array_type,
        object_type,
        class_type
    };

    union anyType {
        void *_data;
        js::boolean _boolean;
        js::number _number;
        js::function *_function;

        constexpr anyType() : _data(nullptr)
        {
        }

        constexpr anyType(const anyType& value) : _data(value._data)
        {
        }        

        inline anyType(const js::boolean& value) : _boolean(value)
        {
        }

        inline anyType(const js::number& value) : _number(value)
        {
        }

        constexpr anyType(const pointer_t& ptr) : _data(ptr._ptr)
        {
        }

        constexpr anyType(std::nullptr_t) : _data(nullptr)
        {
        }

        constexpr anyType(void *ptr) : _data(ptr)
        {
        }

        constexpr anyType(js::function *funcPtr) : _function(funcPtr)
        {
        }
    };

    anyTypeId _type;
    anyType _value;
    long* _counter;

    any() : _type(anyTypeId::undefined_type), _value(nullptr), _counter(nullptr)
    {
    }

    any(void_t) : _type(anyTypeId::undefined_type), _value(nullptr), _counter(nullptr)
    {
    }

    any(const js::any &value) : _type(value._type), _value(value._value), _counter(value._counter)
    {
        switch (_type) {
            case anyTypeId::boolean_type: 
                _value._boolean = value._value._boolean;
                break;
            case anyTypeId::number_type:
                _value._number = value._value._number;
                break;
        }

        if (_counter != nullptr) 
        {
            ++(*_counter);
        }
    }

    any(const undefined_t &undef) : _type(anyTypeId::undefined_type), _counter(nullptr)
    {
    }

    any(pointer_t v) : _type(anyTypeId::number_type), _counter(nullptr)
    {
        if (v.isUndefined) {
            _value._number = (long long) v._ptr;
        } else {
            _type = anyTypeId::object_type;
            _value._data = v._ptr;
        }
    }

    any(bool value) : _type(anyTypeId::boolean_type), _value(js::boolean(value)), _counter(nullptr)
    {
    }

    template <typename T>
    any(T value, std::enable_if_t<std::is_enum_v<T>, int> = 0) : _type(anyTypeId::number_type), _value(js::number((int)value)), _counter(nullptr)
    {
    }

    any(char value) : _type(anyTypeId::string_type), _value((void *)new js::string(value)), _counter(new long)
    {
    }

    any(const js::boolean &value) : _type(anyTypeId::boolean_type), _value(value), _counter(nullptr)
    {
    }

    any(const js::number &value) : _type(anyTypeId::number_type), _value(value), _counter(nullptr)
    {
    }

    any(const std::string &value) : _type(anyTypeId::string_type), _value((void *)new js::string(value)), _counter(new long)
    {
        *_counter = 1;
    }

    any(const js::string &value) : _type(anyTypeId::string_type), _value((void *)new js::string(value)), _counter(new long)
    {
        *_counter = 1;
    }

    any(const js::array &value) : _type(anyTypeId::array_type), _value((void *)new js::array(value)), _counter(new long)
    {
        *_counter = 1;
    }

    any(const js::object &value) : _type(anyTypeId::object_type), _value((void *)new js::object(value)), _counter(new long)
    {
        *_counter = 1;
    }

    template <typename F, class = std::enable_if_t<std::is_member_function_pointer_v<typename _Deduction<F>::type>>>
    any(const F &value) : _type(anyTypeId::function_type), _value((js::function *)new js::function_t<F>(value)), _counter(new long)
    {
        *_counter = 1;
    }

    template <typename Rx, typename... Args>
    any(Rx (__cdecl *value)(Args...)) : _type(anyTypeId::function_type), _value((js::function *)new js::function_t<Rx (__cdecl *)(Args...), Rx (__cdecl *)(Args...)>(value)), _counter(new long)
    {
        *_counter = 1;
    }

    template <typename C>
    any(std::shared_ptr<C> value) : _type(anyTypeId::class_type), _value((void *)new std::shared_ptr<js::object>(value)), _counter(new long)
    {
        *_counter = 1;
    }

    ~any()
    {
        if (_value._data == nullptr || _counter == nullptr || !*_counter || --(*_counter) > 0)
        {
            return;
        }

        switch (_type)
        {
            case anyTypeId::undefined_type:
            case anyTypeId::boolean_type:
            case anyTypeId::number_type:
                break;
            case anyTypeId::string_type:
                delete (js::string*)_value._data;
                break;
            case anyTypeId::object_type:
                delete (js::object*)_value._data;
                break;
            case anyTypeId::array_type:
                delete (js::array*)_value._data;
                break;
            case anyTypeId::class_type:
                delete (std::shared_ptr<js::object>*)_value._data;
                break;
            default:
                break;
        }

        delete _counter;
        _counter = nullptr;
        _value._data = nullptr;
    }

    constexpr any *operator->()
    {
        return this;
    }

    constexpr const js::string& string_ref_const() const
    {
        return *(js::string*)_value._data;
    }    

    constexpr js::string& string_ref()
    {
        return *(js::string*)_value._data;
    }

    constexpr const array& array_ref_const() const
    {
        return *(array*)_value._data;
    }

    constexpr array& array_ref()
    {
        return *(array*)_value._data;
    }

    constexpr const object& object_ref_const() const
    {
        return *(object*)_value._data;
    }    

    constexpr object& object_ref()
    {
        return *(object*)_value._data;
    }

    constexpr const std::shared_ptr<js::object>& class_ref_const() const 
    {
        return *(std::shared_ptr<js::object>*)_value._data;
    }  

    constexpr std::shared_ptr<js::object>& class_ref() 
    {
        return *(std::shared_ptr<js::object>*)_value._data;
    }    

    any& operator=(const any& other)
    {
        _type = other._type;
        _value = other._value;  
        _counter = other._counter;
        if (_counter != nullptr) 
        {
            ++(*_counter);
        }

        return *this;
    }

    template <class T>
    any &operator[](T t) const
    {
        if constexpr (std::is_same_v<T, js::number>)
        {
            if (_type == anyTypeId::array_type)
            {
                return mutable_(array_ref())[t];
            }
        }

        if constexpr (is_stringish_v<T>)
        {
            if (_type == anyTypeId::object_type)
            {
                return (object_ref())[t];
            }
        }

        throw "wrong type";
    }  

    template <class T>
    any &operator[](T t)
    {
        if constexpr (std::is_same_v<T, js::number>)
        {
            if (_type == anyTypeId::array_type)
            {
                return (array_ref())[t];
            }
        }

        if constexpr (is_stringish_v<T>)
        {
            if (_type == anyTypeId::object_type)
            {
                return (object_ref())[t];
            }
        }

        throw "wrong type";
    }  

    operator js::pointer_t()
    {
        if (_type == anyTypeId::string_type && string_ref().is_null())
        {
            return null;
        }

        if (_type == anyTypeId::object_type && _value._data == nullptr)
        {
            return null;
        }

        if (_type == anyTypeId::number_type)
        {
            return pointer_t(_value._number);
        }        

        return pointer_t(_value._data);
    }

    operator js::boolean()
    {
        if (_type == anyTypeId::boolean_type)
        {
            return _value._boolean;
        }

        throw "wrong type";
    }

    operator js::number()
    {
        if (_type == anyTypeId::number_type)
        {
            return _value._number;
        }

        if (_type == anyTypeId::string_type)
        {
            return js::number(std::atof(string_ref().operator const char *()));
        }

        if (_type == anyTypeId::object_type && _value._data == nullptr)
        {
            return js::number(0);
        }        

        throw "wrong type";
    }

    operator js::string()
    {
        if (_type == anyTypeId::string_type)
        {
            return string_ref();
        }

        if (_type == anyTypeId::number_type)
        {
            return js::string(_value._number.operator std::string());
        }

        if (_type == anyTypeId::object_type && _value._data == nullptr)
        {
            return js::string(null);
        }

        throw "wrong type";
    }

    operator js::object()
    {
        if (_type == anyTypeId::object_type)
        {
            return object_ref();
        }

        throw "wrong type";
    }

    operator js::array()
    {
        if (_type == anyTypeId::array_type)
        {
            return array_ref();
        }

        throw "wrong type";
    }

    operator bool()
    {
        switch (_type)
        {
        case anyTypeId::undefined_type:
            return false;
        case anyTypeId::boolean_type:
            return static_cast<bool>(_value._boolean);
        case anyTypeId::number_type:
            return _value._number._value != 0.0;
        case anyTypeId::string_type:
            return string_ref()._value.length() > 0;
        case anyTypeId::object_type:
            return _value._data != nullptr && object_ref()->get().size() > 0;
        case anyTypeId::array_type:
            return ((js::array *)_value._data)->get().size() > 0;
        case anyTypeId::class_type:
            return _value._data != nullptr;
        default:
            break;
        }

        return false;
    }

    operator double()
    {
        switch (_type)
        {
        case anyTypeId::undefined_type:
            return 0;
        case anyTypeId::boolean_type:
            return static_cast<bool>(_value._boolean) ? 1 : 0;
        case anyTypeId::number_type:
            return _value._number._value;
        }

        throw "wrong type";
    }  

    template <typename T>
    using std_shared_ptr = std::shared_ptr<T>;
    template <typename T>
    operator std_shared_ptr<T>()
    {
        if (_type == anyTypeId::class_type)
        {
            return std::shared_ptr<T>(*(std::shared_ptr<js::object> *)_value._data);
        }

        throw "wrong type";
    }

    template <typename Rx, typename... Args>
    operator std::function<Rx(Args...)>()
    {
        if (_type == anyTypeId::function_type)
        {
            auto func = _value._function;
            return std::function<Rx(Args...)>([=](Args... args) -> Rx {
                return func->invoke({args...});
            });
        }

        throw "wrong type";
    }

    operator std::string()
    {
        std::ostringstream streamObj2;
        streamObj2 << *this;
        return streamObj2.str();
    }

    bool operator==(const js::any &other) const
    {
        if (_type != other._type)
        {
            return false;
        }

        switch (_type)
        {
        case anyTypeId::undefined_type:
            return true;
        case anyTypeId::boolean_type:
            return static_cast<bool>(_value._boolean) == static_cast<bool>(other._value._boolean);
        case anyTypeId::number_type:
            return _value._number._value == other._value._number._value;
        case anyTypeId::string_type:
            return string_ref_const() == mutable_(other).string_ref();
        case anyTypeId::object_type:
            return object_ref_const() == mutable_(other).object_ref();
        }

        throw "not implemented";
    }

    bool operator!=(const js::any &other) const
    {
        return !(*this == other);
    }

    bool operator==(const js::undefined_t &) const
    {
        return _type == anyTypeId::undefined_type;
    }

    bool operator!=(const js::undefined_t &) const
    {
        return _type != anyTypeId::undefined_type;
    }

    bool operator==(const pointer_t &other) const
    {
        switch (_type)
        {
        case anyTypeId::undefined_type:
        case anyTypeId::boolean_type:
        case anyTypeId::number_type:
            return false;
        case anyTypeId::string_type:
            return string_ref_const().is_null() && other._ptr == nullptr;
        case anyTypeId::object_type:
        case anyTypeId::class_type:
            return _value._data == other._ptr;
        }

        throw "not implemented";
    } 

    bool operator!=(const pointer_t &other) const
    {
        return !operator==(other);
    } 

    bool operator==(const js::boolean &other) const
    {
        return static_cast<js::boolean>(*mutable_(this)) == other;
    }

    bool operator!=(const js::boolean &other) const
    {
        return static_cast<js::boolean>(*mutable_(this)) != other;
    }    

    bool operator==(const js::number &other) const
    {
        return static_cast<js::number>(*mutable_(this)) == other;
    }

    bool operator!=(const js::number &other) const
    {
        return static_cast<js::number>(*mutable_(this)) != other;
    }    

    bool operator==(const js::string &other) const
    {
        return static_cast<js::string>(*mutable_(this)) == other;
    }

    bool operator!=(const js::string &other) const
    {
        return static_cast<js::string>(*mutable_(this)) != other;
    }

    any operator+(js::number t)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            return any(_value._number + t);
        }

        throw "not implemented";
    }

    any operator+(string t)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            return any(_value._number.operator js::string() + t);
        case anyTypeId::string_type:
            return any(string_ref() + t);
        }

        throw "not implemented";
    }  

    inline any operator+(any t) const
    {
        return mutable_(this)->operator+(t);        
    }

    any operator+(any t)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            switch (t._type)
            {
            case anyTypeId::number_type:
                return any(_value._number + t._value._number);
            case anyTypeId::string_type:
                return any(_value._number.operator js::string() + t.string_ref());
            }
            break;
        case anyTypeId::string_type:
            switch (t._type)
            {
            case anyTypeId::string_type:
                return any(string_ref() + t.string_ref());
            }
            break;
        }

        throw "not implemented";
    }

    any &operator++()
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            _value._number += 1;
            return *this;
        }

        throw "not implemented";
    }

    any operator++(int)
    {
        any tmp(*this);
        operator++();
        return tmp;
    }

    any &operator+=(js::number other)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            _value._number += other;
            return *this;
        }  

        throw "not implemented";
    }

    friend js::number operator+=(js::number& t, any value)
    {
        switch (value._type)
        {
        case anyTypeId::number_type:
            return t += value._value._number;
        }

        throw "not implemented";
    }

    any operator-(js::number t)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            return any(_value._number - t);
        }

        throw "not implemented";
    }

    any operator-(any t)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            switch (t._type)
            {
            case anyTypeId::number_type:
                return any(_value._number - t._value._number);
            }
            break;
        }

        throw "not implemented";
    }

    any &operator--()
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            _value._number -= 1;
            return *this;
        }

        throw "not implemented";
    }

    any operator--(int)
    {
        any tmp(*this);
        operator--();
        return tmp;
    }

    any &operator-=(js::number other)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            _value._number -= other;
            return *this;
        }

        throw "not implemented";
    }

    friend js::number operator-=(js::number& t, any value)
    {
        switch (value._type)
        {
        case anyTypeId::number_type:
            return t -= value._value._number;
        }

        throw "not implemented";
    }

    any operator*(js::number t)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            return any(_value._number * t);
        }

        throw "not implemented";
    }

    any operator*(any t)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            switch (t._type)
            {
            case anyTypeId::number_type:
                return any(_value._number * t._value._number);
            }
            break;
        }

        throw "not implemented";
    }

    any &operator*=(js::number other)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            _value._number *= other;
            return *this;
        }

        throw "not implemented";
    }

    friend any operator*(js::number n, any value)
    {
        switch (value._type)
        {
        case anyTypeId::number_type:
            return any(n * value._value._number);
        }

        throw "not implemented";
    }

    any operator/(js::number t)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            return any(_value._number / t);
        }

        throw "not implemented";
    }

    any operator/(any t)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            switch (t._type)
            {
            case anyTypeId::number_type:
                return any(_value._number / t._value._number);
            }
            break;
        }

        throw "not implemented";
    }

    friend any operator/(js::number t, any value)
    {
        switch (value._type)
        {
        case anyTypeId::number_type:
            return any(t / value._value._number);
        }

        throw "not implemented";
    }

    any &operator/=(js::number other)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            _value._number /= other;
            return *this;
        }

        throw "not implemented";
    }

    any operator%(number t)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            return any(_value._number % t);
        }

        throw "not implemented";
    }

    any operator%(any t)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            switch (t._type)
            {
            case anyTypeId::number_type:
                return any(_value._number % t._value._number);
            }
            break;
        }

        throw "not implemented";
    }

    friend any operator%(number t, any value)
    {
        switch (value._type)
        {
        case anyTypeId::number_type:
            return any(t % value._value._number);
        }

        throw "not implemented";
    }

    any &operator%=(js::number other)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            _value._number %= other;
            return *this;
        }

        throw "not implemented";
    }

    bool operator>(js::number n)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            return _value._number > n;
        }

        throw "not implemented";
    }

    any operator>(any t)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            switch (t._type)
            {
            case anyTypeId::number_type:
                return any(_value._number > t._value._number);
            }
            break;
        }

        throw "not implemented";
    }

    bool operator>=(js::number n)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            return _value._number >= n;
        }

        throw "not implemented";
    }

    any operator>=(any t)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            switch (t._type)
            {
            case anyTypeId::number_type:
                return any(_value._number >= t._value._number);
            }
            break;
        }

        throw "not implemented";
    }

    bool operator<(js::number n)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            return _value._number < n;
        }

        throw "not implemented";
    }

    any operator<(any t)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            switch (t._type)
            {
            case anyTypeId::number_type:
                return any(_value._number < t._value._number);
            }
            break;
        }

        throw "not implemented";
    }

    bool operator<=(js::number n)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            return _value._number <= n;
        }

        throw "not implemented";
    }

    any operator<=(any t)
    {
        switch (_type)
        {
        case anyTypeId::number_type:
            switch (t._type)
            {
            case anyTypeId::number_type:
                return any(_value._number <= t._value._number);
            }
            break;
        }

        throw "not implemented";
    }

    template <typename... Args>
    any operator()(Args... args) const
    {
        switch (_type)
        {
        case anyTypeId::function_type:
            return _value._function->invoke({args...});
        }

        throw "not implemented";
    }

    template <typename... Args>
    any operator()(Args... args)
    {
        switch (_type)
        {
        case anyTypeId::function_type:
            return _value._function->invoke({args...});
        }

        throw "not implemented";
    }

    js::string type_of()
    {
        switch (_type)
        {
        case anyTypeId::undefined_type:
            return "undefined";

        case anyTypeId::boolean_type:
            return "boolean";

        case anyTypeId::number_type:
            return "number";

        case anyTypeId::string_type:
            return "string";

        case anyTypeId::array_type:
            return "array";

        case anyTypeId::object_type:
            return "object";

        default:
            return "error";
        }
    }

    void Delete(const char *field)
    {
        switch (_type)
        {
        case anyTypeId::object_type:
            object_ref().get().erase(field);
            break;

        default:
            throw "wrong type";
        }
    }

    js::number get_length()
    {
        switch (_type)
        {
        case anyTypeId::string_type:
            return string_ref().get_length();
        case anyTypeId::array_type:
            return array_ref().get_length();
        default:
            throw "wrong type";
        }
    }    

    auto begin() -> decltype(array_ref().begin())
    {
        switch (_type)
        {
        case anyTypeId::array_type:
            return array_ref().begin();
        default:
            throw "wrong type";
        }        
    }

    auto end() -> decltype(array_ref().end())
    {
        switch (_type)
        {
        case anyTypeId::array_type:
            return array_ref().end();
        default:
            throw "wrong type";
        }        
    }    

    size_t hash(void) const noexcept
    {
        size_t const h1(std::hash<int>{}(static_cast<int>(_type)));
        size_t h2;

        switch (_type)
        {
        case anyTypeId::undefined_type:
            h2 = 0;
            break;

        case anyTypeId::boolean_type:
            h2 = std::hash<bool>{}(_value._boolean);
            break;

        case anyTypeId::number_type:
            h2 = std::hash<double>{}(_value._number._value);
            break;

        case anyTypeId::string_type:
            h2 = std::hash<std::string>{}(string_ref_const()._value);
            break;

        case anyTypeId::array_type:
        case anyTypeId::object_type:
        case anyTypeId::class_type:
            h2 = std::hash<void*>{}((void*)_value._data);
            break;

        default:
            h2 = 0;
        }

        return hash_combine(h1, h2);
    }

    friend std::ostream &operator<<(std::ostream &os, any val)
    {
        if (val._type == anyTypeId::undefined_type)
        {
            return os << "undefined";
        }

        if (val._type == anyTypeId::boolean_type)
        {
            return os << val._value._boolean;
        }

        if (val._type == anyTypeId::number_type)
        {
            return os << val._value._number;
        }

        if (val._value._data == nullptr)
        {
            return os << "null";
        }

        if (val._type == anyTypeId::string_type)
        {
            return os << *(js::string *)val._value._data;
        }

        if (val._type == anyTypeId::function_type)
        {
            return os << "[function]";
        }

        if (val._type == anyTypeId::array_type)
        {
            return os << "[array]";
        }

        if (val._type == anyTypeId::object_type)
        {
            return os << "[object]";
        }

        if (val._type == anyTypeId::class_type)
        {
            return os << val.class_ref().get()->toString();
        }

        return os << "[any]";
    }
};

// TODO: put into class undefined
static js::number operator+(const undefined_t& v)
{
    return number(NAN);
}

// TODO: put into class boolean
static js::number operator+(const boolean& v)
{
    return number((mutable_(v)) ? 1 : 0);
}

template <>
string type_of(boolean value)
{
    return "boolean"_S;
}

template <>
string type_of(number value)
{
    return "number"_S;
}

template <>
string type_of(string value)
{
    return "string"_S;
}

template <>
string type_of(object value)
{
    return "object"_S;
}

template <>
string type_of(any value)
{
    return value.type_of();
}

template <class T>
static any Void(T value) {
    return any();
}

template <typename I>
constexpr bool is(js::any t) {
    return false;
}

template <>
inline bool is<js::boolean>(js::any t)
{
    return t && t._type == any::anyTypeId::boolean_type;
}

template <>
inline bool is<js::number>(js::any t)
{
    return t && t._type == any::anyTypeId::number_type;
}

template <>
inline bool is<js::string>(js::any t)
{
    return t && t._type == any::anyTypeId::string_type;
}

template <>
inline bool is<js::array>(js::any t)
{
    return t && t._type == any::anyTypeId::array_type;
}

template <>
inline bool is<js::object>(js::any t)
{
    return t && t._type == any::anyTypeId::object_type;
}

template <>
inline bool is<js::function>(js::any t)
{
    return t && t._type == any::anyTypeId::function_type;
}

struct Finally
{
private:
    std::function<void()> _dtor;

public:
    Finally(std::function<void()> dtor) : _dtor(dtor){};
    ~Finally() { _dtor(); }
};

namespace Utils
{
    template <typename... Args>
    object assign(object &dst, const Args &... args)
    {
        for (auto src : {args...})
        {
            for (auto &k : keys_(src))
            {
                dst[k] = const_(src)[k];
            }
        }

        return dst;
    }
};

template <typename... Args>
auto function::operator()(Args... args)
{
    return invoke({args...});
}

template <typename F, typename _MethodType>
any function_t<F, _MethodType>::invoke(std::initializer_list<any> args_)
{
    auto args_vector = std::vector<any>(args_);
    if constexpr (std::is_void_v<_ReturnType>)
    {
        invoke_seq<_MethodPtr::_CountArgs>(_f, args_vector);
        return any();
    }
    else
    {
        return invoke_seq<_MethodPtr::_CountArgs>(_f, args_vector);
    }
}

template <typename V>
constexpr bool in(V v, const array &a)
{
    return a.exists(v);
}

template <typename V>
constexpr bool in(V v, const object &a)
{
    return a.exists(v);
}

template <typename V, class Ax, class=std::enable_if_t<std::is_member_function_pointer_v<decltype(&Ax::exists)>>>
constexpr bool in(V v, const Ax &a)
{
    return a.exists(v);
}

template <typename V, class Ax, class=std::enable_if_t<std::is_member_function_pointer_v<decltype(&Ax::exists)>>>
constexpr bool in(V v, Ax *a)
{
    return a->exists(v);
}

template <typename V, class O>
constexpr bool in(V v, O o)
{
    return false;
}

// Number
static js::number Infinity(std::numeric_limits<double>::infinity());
static js::number NaN(std::numeric_limits<double>::quiet_NaN());

namespace tmpl {

template <typename V>
number<V>::operator js::string() {
    return js::string(static_cast<std::string>(*this));
}    

template <typename V>
js::string number<V>::toString() {
    std::ostringstream streamObj2;
    streamObj2 << _value;
    return streamObj2.str();
} 

template <typename V>
js::string number<V>::toString(number_t radix) {
    return js::string(std::to_string(_value));
}

} // namespace tmpl

} // namespace js

#define MAIN \
int main(int argc, char** argv) \
{   \
    try \
    {   \
        Main(); \
    }   \
    catch (const js::string& s)  \
    {   \
        std::cout << "Exception: " << s << std::endl;    \
    }   \
    catch (const js::any& a)  \
    {   \
        std::cout << "Exception: " << a << std::endl;    \
    }   \
    catch (const std::exception& exception)   \
    {   \
        std::cout << "Exception: " << exception.what() << std::endl; \
    }   \
    catch (const std::string& s)  \
    {   \
        std::cout << "Exception: " << s << std::endl;    \
    }   \
    catch (const char* s) \
    {   \
        std::cout << "Exception: " << s << std::endl;    \
    }   \
    catch (...) \
    {   \
        std::cout << "General failure." << std::endl;    \
    }   \
    return 0;   \
}

// JS Core classes
namespace js {
    
static number parseInt(const js::string &value, int base = 10)
{
    return number(std::stol(value._value, 0, base));
}

static number parseFloat(const js::string &value)
{
    auto r = NaN;
    try
    {
        r = number(std::stod(value._value, 0));
    }
    catch(const std::exception&)
    {
    }

    return r;    
}

static object Object;

static string String;

template <typename T>
using ReadonlyArray = tmpl::array<T>;

template <typename T>
using Array = tmpl::array<T>;

struct Date
{
    number getHours()
    {
        return number(0);
    }

    number getMinutes()
    {
        return number(0);
    }

    number getSeconds()
    {
        return number(0);
    }
};

struct Function
{
};

struct RegExp
{

    std::regex re;

    RegExp(js::string pattern) : re((const char *)pattern)
    {
    }

    js::boolean test(js::string val)
    {
        try
        {
            if (std::regex_search((const char *)val, re))
            {
                return true;
            }
        }
        catch (std::regex_error &)
        {
        }

        return false;
    }
};

template <typename T>
struct TypedArray : public Array<T>
{
    typedef Array<T> super__;
    js::number _length;

    TypedArray(js::number length_) : super__()
    {
        _length = length_;
    }
};

struct Int16Array : TypedArray<short>
{
    Int16Array(js::number length_) : TypedArray(length_)
    {
    }
};

struct Uint16Array : TypedArray<unsigned short>
{
    Uint16Array(js::number length_) : TypedArray(length_)
    {
    }
};

struct Float32Array : TypedArray<float>
{
    Float32Array(js::number length_) : TypedArray(length_)
    {
    }
};

struct Float64Array : TypedArray<double>
{
    Float64Array(js::number length_) : TypedArray(length_)
    {
    }
};

struct Int32Array : TypedArray<int>
{
    Int32Array(js::number length_) : TypedArray(length_)
    {
    }
};

struct Uint32Array : TypedArray<unsigned int>
{
    Uint32Array(js::number length_) : TypedArray(length_)
    {
    }
};

struct Int64Array : TypedArray<long long>
{
    Int64Array(js::number length_) : TypedArray(length_)
    {
    }
};

struct Uint64Array : TypedArray<unsigned long long>
{
    Uint64Array(js::number length_) : TypedArray(length_)
    {
    }
};

struct ArrayBuffer
{
};

struct ArrayBufferView
{
};

template <typename T>
struct Promise
{
    static void all()
    {
    }

    void _catch()
    {
    }

    void finally()
    {
    }

    void then()
    {
    }

    static void race()
    {
    }

    static void reject()
    {
    }

    static void resolve()
    {
    }
};

static struct math_t
{
    static number E;
    static number LN10;
    static number LN2;
    static number LOG2E;
    static number LOG10E;
    static number PI;
    static number SQRT1_2;
    static number SQRT2;

    constexpr math_t *operator->()
    {
        return this;
    }

    static number pow(number op, number op2)
    {
        return number(std::pow(static_cast<double>(op), static_cast<double>(op2)));
    }

    static number min(number op, number op2)
    {
        return number(std::min(static_cast<double>(op), static_cast<double>(op2)));
    }

    static number max(number op, number op2)
    {
        return number(std::max(static_cast<double>(op), static_cast<double>(op2)));
    }

    static number sin(number op)
    {
        return number(std::sin(static_cast<double>(op)));
    }

    static number cos(number op)
    {
        return number(std::cos(static_cast<double>(op)));
    }

    static number asin(number op)
    {
        return number(std::asin(static_cast<double>(op)));
    }

    static number acos(number op)
    {
        return number(std::acos(static_cast<double>(op)));
    }

    static number abs(number op)
    {
        return number(std::abs(static_cast<double>(op)));
    }

    static number floor(number op)
    {
        return number(std::floor(static_cast<double>(op)));
    }

    static number round(number op, int numDecimalPlaces = 0)
    {
        const auto mult = 10 ^ (numDecimalPlaces);
        return number(std::floor(static_cast<double>(op) * mult + 0.5) / mult);
    }

    static number sqrt(number op)
    {
        return number(std::sqrt(static_cast<double>(op)));
    }

    static number tan(number op)
    {
        return number(std::tan(static_cast<double>(op)));
    }

    static number atan(number op)
    {
        return number(std::atan(static_cast<double>(op)));
    }

    static number atan2(number op1, number op2)
    {
        return number(std::atan2(static_cast<double>(op1), static_cast<double>(op2)));
    }

    static number log(number op)
    {
        return number(std::log(static_cast<double>(op)));
    }

    static number exp(number op)
    {
        return number(std::exp(static_cast<double>(op)));
    }

    static number random()
    {
        std::default_random_engine generator;
        std::uniform_real_distribution<double> distribution(0.0, 1.0);
        auto rnd = distribution(generator);
        return number(rnd);
    }

    static number sign(number op)
    {
        auto d = static_cast<double>(op);
        return number(d < 0 ? -1 : d > 0 ? 1 : 0);
    }
} Math;

static struct Console
{
    Console()
    {
        std::cout << std::boolalpha;
    }

    constexpr Console *operator->()
    {
        return this;
    }

    template <class Arg1>
    inline void log_req(Arg1 arg1)
    {
        if constexpr (std::is_enum_v<Arg1>) {
            std::cout << static_cast<int>(arg1);
        } else {
            std::cout << arg1;
        }
    }

    template <class Arg1, class... Args>
    inline void log_req(Arg1 arg1, Args... args)
    {
        std::cout << arg1;
        log_req(args...);
    }

    template <class... Args>
    void log(Args... args)
    {
        log_req(args...);
        std::cout << std::endl;
    }

    template <class Arg1>
    inline void warn_req(Arg1 arg1)
    {
        if constexpr (std::is_enum_v<Arg1>) {
            std::clog << static_cast<int>(arg1);
        } else {
            std::clog << arg1;
        }
    }

    template <class Arg1, class... Args>
    inline void warn_req(Arg1 arg1, Args... args)
    {
        std::clog << arg1;
        warn_req(args...);
    }

    template <class... Args>
    void warn(Args... args)
    {
        warn_req(args...);
        std::clog << std::endl;
    }    

    template <class Arg1>
    inline void error_req(Arg1 arg1)
    {
        if constexpr (std::is_enum_v<Arg1>) {
            std::cerr << static_cast<int>(arg1);
        } else {
            std::cerr << arg1;
        }
    }

    template <class Arg1, class... Args>
    inline void error_req(Arg1 arg1, Args... args)
    {
        std::cerr << arg1;
        error_req(args...);
    }

    template <class... Args>
    void error(Args... args)
    {
        error_req(args...);
        std::cerr << std::endl;
    }        

} console;

struct XMLHttpRequest
{
};

template <typename T>
using ArrayLike = Array<T>;

// HTML
struct HTMLElement
{
};

struct HTMLImageElement
{
};

struct EventListenerOptions
{
    boolean capture;
};

struct AddEventListenerOptions : public EventListenerOptions
{
    boolean once;
    boolean passive;
};

struct Blob
{
};

struct DataView
{
};

struct BodyInit
{
};

struct Document
{
};

struct WebGLQuery
{
};

struct HTMLCanvasElement
{
};

struct CanvasRenderingContext2D
{
};

struct WebGLFramebuffer
{
};

struct WebGLRenderbuffer
{
};

struct WebGLTexture
{
};

// end of HTML
} // namespace js

#endif // CORE_H