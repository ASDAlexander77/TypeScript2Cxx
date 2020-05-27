#ifndef CORE_H
#define CORE_H

#include <cinttypes>
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
#include <variant>
#include <chrono>
#include <thread>
#include <future>

namespace js
{

//#define OR(x, y) ((bool)(x) ? (x) : (y))
//#define AND(x, y) ((bool)(x) ? (y) : (x))
#define OR(x, y) ([&]() { auto vx = (x); return (static_cast<bool>(vx)) ? vx : (y); })()
#define AND(x, y) ([&]() { auto vx = (x); return (static_cast<bool>(vx)) ? (y) : vx; })()

struct undefined_t;
struct any;
template <typename T>
struct shared;

namespace tmpl
{
template <typename T>
struct pointer_t;

template <typename T>
struct number;

template <typename T>
struct string;

template <typename T>
struct array;

template <typename K, typename V>
struct object;
}

typedef tmpl::pointer_t<void*> pointer_t;

#ifdef UNICODE
typedef tmpl::string<::std::wstring> string;
typedef wchar_t char_t;
#define TXT(quote) L##quote
#define STR(quote) L##quote##_S
using tstring = ::std::wstring;
using tostream = ::std::wostream;
using tostringstream = ::std::wostringstream;
using tstringstream = ::std::wstringstream;
#define to_tstring ::std::to_wstring
#else
typedef tmpl::string<::std::string> string;
typedef char char_t;
#define TXT(quote) quote
#define STR(quote) quote##_S
using tstring = ::std::string;
using tostream = ::std::ostream;
using tostringstream = ::std::ostringstream;
using tstringstream = ::std::stringstream;
#define to_tstring ::std::to_string
#endif

typedef tmpl::number<double> number;
typedef tmpl::object<string, any> object;
template<typename T>
using array = tmpl::array<T>;

typedef array<any> array_any;

template <class T>
concept Arithmetic = std::is_arithmetic_v<T> && !std::is_same_v<T, bool> && !std::is_same_v<T, char_t>;

template <class T>
concept ArithmeticOrEnum = (std::is_arithmetic_v<T> || std::is_enum_v<T>) && !std::is_same_v<T, bool> && !std::is_same_v<T, char_t>;

template <class T>
concept ArithmeticOrEnumOrNumber = (std::is_arithmetic_v<T> || std::is_enum_v<T> || std::is_same_v<T, number>) && !std::is_same_v<T, bool> && !std::is_same_v<T, char_t>;

template <class T>
concept BoolOrBoolean = (std::is_same_v<T, bool> || std::is_same_v<T, boolean>);

template<typename T>
concept can_cast_to_size_t = requires(T t) { static_cast<size_t>(t); };

template<typename T>
concept has_exists_member = requires { T::exists; };

template <class _Ty>
struct is_stringish : 
    std::bool_constant<std::is_same_v<_Ty, const char_t *> 
    || std::is_same_v<_Ty, std::string> 
    || std::is_same_v<_Ty, std::wstring> 
    || std::is_same_v<_Ty, std::string_view> 
    || std::is_same_v<_Ty, std::wstring_view> 
    || std::is_same_v<_Ty, string> 
    || std::is_same_v<_Ty, any>>
{
};

template <class _Ty>
constexpr bool is_stringish_v = is_stringish<_Ty>::value;

template <typename T>
struct _Deduction_MethodPtr;

template<typename T>
string toString(const T& val);

inline std::size_t hash_combine(const std::size_t hi_value, const std::size_t lo_value)
{
    return lo_value + 0x9e3779b9 + (hi_value << 6) + (hi_value >> 2);
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

template <typename I, typename T>
inline I as(T t)
{
    return static_cast<I>(t);
}

template <typename I, typename T>
inline I *as(T *t)
{
    return dynamic_cast<I *>(t);
}

template <typename I, typename T, class = std::enable_if_t<!std::is_same_v<I, any>>>
inline std::shared_ptr<I> as(const std::shared_ptr<T> &t)
{
    return std::dynamic_pointer_cast<I>(t);
}

template <typename I, typename T, class = std::enable_if_t<std::is_same_v<I, any>>>
inline I as(const std::shared_ptr<T> &t)
{
    return I(t);
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
constexpr auto keys_(const T &t)
{
    return mutable_(t)->keys();
}

template <typename T>
constexpr auto keys_(T &t)
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

    constexpr bool operator==(const pointer_t &)
    {
        return false;
    }

    constexpr bool operator!=(const pointer_t &)
    {
        return true;
    }

    template <typename N = void> requires ArithmeticOrEnum<N>
    bool operator==(N n) const;

    template <typename N = void> requires ArithmeticOrEnum<N>
    bool operator!=(N n) const;    

    template <typename N = void> requires ArithmeticOrEnum<N>
    friend bool operator==(N n, const undefined_t& u);

    template <typename N = void> requires ArithmeticOrEnum<N>
    friend bool operator!=(N n, const undefined_t& u);    

    friend std::ostream &operator<<(std::ostream &os, undefined_t)
    {
        return os << "undefined";
    }
} undefined;

struct void_t
{
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

namespace tmpl {
template <typename T>
struct pointer_t
{
    bool isUndefined;
    T _ptr;

    pointer_t() : _ptr(nullptr), isUndefined(false){};

    pointer_t(const pointer_t &other) : _ptr(other._ptr), isUndefined(other.isUndefined){};

    pointer_t(void *ptr) : _ptr(static_cast<T>(ptr)), isUndefined(false){};

    pointer_t(std::nullptr_t) : _ptr(nullptr), isUndefined(false){};

    pointer_t(js::number);

    pointer_t(const undefined_t &undef) : _ptr(nullptr), isUndefined(true)
    {
    }

    constexpr operator bool()
    {
        return !isUndefined && _ptr != nullptr;
    }

    constexpr operator void*()
    {
        return static_cast<void*>(_ptr);
    }    

    template <typename T>
    constexpr operator std::shared_ptr<T>()
    {
        return std::shared_ptr<T>(static_cast<T *>(_ptr));
    }

    template <typename T>
    constexpr operator const T *()
    {
        return isUndefined ? static_cast<const T *>(nullptr) : static_cast<const T *>(_ptr);
    }

    template <typename T = void> requires ArithmeticOrEnum<T>
    constexpr operator T() {
        return static_cast<T>(reinterpret_cast<intptr_t>(_ptr));
    }    

    operator tstring() const
    {
        tostringstream streamObj2;
        streamObj2 << TXT("null");
        return streamObj2.str();
    }

    operator tstring()
    {
        tostringstream streamObj2;
        streamObj2 << TXT("null");
        return streamObj2.str();
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

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    bool operator==(N n);

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    bool operator!=(N n);

    template <typename N = void> requires ArithmeticOrEnum<N>
    friend bool operator==(N n, const pointer_t p)
    {
        return !p.isUndefined && false;
    }

    template <typename N = void> requires ArithmeticOrEnum<N>
    friend bool operator!=(N n, const pointer_t p)
    {
        return p.isUndefined || true;
    }

    template <typename _Ty>
    bool operator==(std::shared_ptr<_Ty> sp)
    {
        return false;
    }

    template <typename _Ty>
    bool operator!=(std::shared_ptr<_Ty> sp)
    {
        return false;
    }

    friend std::ostream &operator<<(std::ostream &os, pointer_t val)
    {
        if (!val.isUndefined && val._ptr == nullptr)
        {
            return os << "null";
        }

        return os << val._ptr;
    }
};

}

static pointer_t null;

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
    enum control_t
    {
        boolean_false = 0,
        boolean_true = 1,
        boolean_undefined = 2
    } _control;

    constexpr boolean() : _control(boolean_undefined)
    {
    }

    inline boolean(const boolean &value) : _control(value._control)
    {
    }

    inline boolean(bool value) : _control(static_cast<control_t>(value))
    {
    }

    constexpr boolean(const undefined_t &) : _control(boolean_undefined)
    {
    }

    constexpr operator bool() const
    {
        return _control == boolean_true;
    }

    constexpr operator bool()
    {
        return _control == boolean_true;
    }

    constexpr boolean *operator->()
    {
        return this;
    }

    inline bool operator==(undefined_t) const
    {
        return _control == boolean_undefined;
    }

    inline bool operator!=(undefined_t) const
    {
        return _control != boolean_undefined;
    }

    inline bool operator==(pointer_t) const
    {
        return false;
    }

    inline bool operator!=(pointer_t) const
    {
        return true;
    }

    inline bool operator==(undefined_t)
    {
        return _control == boolean_undefined;
    }

    inline bool operator!=(undefined_t)
    {
        return _control != boolean_undefined;
    }

    inline bool operator==(pointer_t)
    {
        return false;
    }

    inline bool operator!=(pointer_t)
    {
        return true;
    }

    inline bool operator==(boolean other)
    {
        return this->operator bool() == static_cast<bool>(other);
    }

    inline bool operator!=(boolean other)
    {
        return this->operator bool() != static_cast<bool>(other);
    }

    inline bool operator==(bool other)
    {
        return this->operator bool() == other;
    }

    inline bool operator!=(bool other)
    {
        return this->operator bool() != other;
    }

    boolean operator~()
    {
        return this->operator bool() ? false : true;
    }

    friend std::ostream &operator<<(std::ostream &os, boolean val)
    {
        if (val._control == boolean_undefined)
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

    number(const number &value) : _value{value._value}
    {
    }

    template <typename T = void> requires ArithmeticOrEnum<T>
    number(T initValue) : _value{static_cast<V>(initValue)}
    {
    }

    template <typename T = void> requires ArithmeticOrEnum<T>
    number(const shared<T>& initValue) : _value{static_cast<V>(initValue.get())}
    {
    }

    number(js::pointer_t p) : _value{p._ptr != nullptr ? static_cast<V>(intptr_t(p._ptr)) : -std::numeric_limits<V>::quiet_NaN()}
    {
    }

    number(const undefined_t &undef) : _value{-std::numeric_limits<V>::quiet_NaN()}
    {
    }

    inline bool is_undefined()
    {
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

    template <typename T = void> requires ArithmeticOrEnum<T>
    constexpr operator T() {
        return static_cast<T>(_value);
    }

    constexpr number_t *operator->()
    {
        return this;
    }

    operator tstring() const
    {
        tostringstream streamObj2;
        streamObj2 << _value;
        return streamObj2.str();
    }

    operator tstring()
    {
        tostringstream streamObj2;
        streamObj2 << _value;
        return streamObj2.str();
    }

    operator js::string();

    inline bool operator==(undefined_t)
    {
        return is_undefined();
    }

    inline bool operator!=(undefined_t)
    {
        return !is_undefined();
    }

    inline friend bool operator==(const undefined_t, number_t other)
    {
        return other.is_undefined();
    }

    inline friend bool operator!=(const undefined_t, number_t other)
    {
        return !other.is_undefined();
    }

    inline friend bool operator==(const number_t n, js::pointer_t p)
    {
        return mutable_(n).is_undefined() == p.isUndefined && false;
    }

    inline friend bool operator!=(const number_t n, js::pointer_t p)
    {
        return mutable_(n).is_undefined() != p.isUndefined || true;
    }

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

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    friend number_t operator+(const number_t n, T value)
    {
        return n._value + static_cast<V>(value);
    }

    template <typename T = void> requires ArithmeticOrEnum<T>
    friend T operator+(T value, const number_t n)
    {
        return value + static_cast<T>(n._value);
    }

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    number_t &operator+=(T value)
    {
        _value += static_cast<V>(value);
        return *this;
    }

    template <typename N = void> requires ArithmeticOrEnum<N>
    friend N operator+=(N& n, const number& other) {
        return n += static_cast<N>(mutable_(other));
    }

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    friend number_t operator-(const number_t n, T value)
    {
        return n._value - static_cast<V>(value);
    }

    template <typename T = void> requires ArithmeticOrEnum<T>
    friend T operator-(T value, const number_t n)
    {
        return value - static_cast<T>(n._value);
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

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    number_t &operator-=(T value)
    {
        _value -= static_cast<V>(value);
        return *this;
    }

    template <typename N = void> requires ArithmeticOrEnum<N>
    friend N operator-=(N& n, const number& other) {
        return n -= static_cast<N>(mutable_(other));
    }

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    friend number_t operator*(const number_t n, T value)
    {
        return n._value * static_cast<V>(value);
    }

    template <typename T = void> requires ArithmeticOrEnum<T>
    friend T operator*(T value, const number_t n)
    {
        return value * static_cast<T>(n._value);
    }

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    number_t &operator*=(T value)
    {
        _value *= static_cast<V>(value);
        return *this;
    }

    template <typename N = void> requires ArithmeticOrEnum<N>
    friend N operator*=(N& n, const number& other) {
        return n *= static_cast<N>(mutable_(other));
    }

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    friend number_t operator/(const number_t n, T value)
    {
        return n._value / static_cast<V>(value);
    }

    template <typename T = void> requires ArithmeticOrEnum<T>
    friend T operator/(T value, const number_t n)
    {
        return value / static_cast<T>(n._value);
    }

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    number_t &operator/=(T value)
    {
        _value /= static_cast<V>(value);
        return *this;
    }

    template <typename N = void> requires ArithmeticOrEnum<N>
    friend N operator/=(N& n, const number& other) {
        return n /= static_cast<N>(mutable_(other));
    }

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    friend number_t operator^(const number_t n, T value)
    {
        return static_cast<long>(n._value) ^ static_cast<long>(static_cast<V>(value));
    }

    template <typename T = void> requires ArithmeticOrEnum<T>
    friend number_t operator^(T value, const number_t n)
    {
        return static_cast<long>(static_cast<V>(value)) ^ static_cast<long>(n._value);
    }

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    number_t &operator^=(T value)
    {
        _value = static_cast<long>(_value) ^ static_cast<long>(static_cast<V>(value));
        return *this;
    }

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    friend number_t operator|(const number_t n, T value)
    {
        return static_cast<long>(n._value) | static_cast<long>(static_cast<V>(value));
    }

    template <typename T = void> requires ArithmeticOrEnum<T>
    friend T operator|(T value, const number_t n)
    {
        return static_cast<long>(static_cast<V>(value)) | static_cast<long>(n._value);
    }

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    number_t &operator|=(T value)
    {
        _value = static_cast<long>(_value) | static_cast<long>(static_cast<V>(value));
        return *this;
    }

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    friend number_t operator&(const number_t n, T value)
    {
        return static_cast<long>(n._value) & static_cast<long>(static_cast<V>(value));
    }

    template <typename T = void> requires ArithmeticOrEnum<T>
    friend T operator&(T value, const number_t n)
    {
        return static_cast<long>(static_cast<V>(value)) & static_cast<long>(n._value);
    }

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    number_t &operator&=(T value)
    {
        _value = static_cast<long>(_value) & static_cast<long>(static_cast<V>(value));
        return *this;
    }

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    friend number_t operator%(const number_t n, T value)
    {
        return number_t(static_cast<long>(n._value) % static_cast<long>(static_cast<V>(value)));
    }

    template <typename T = void> requires ArithmeticOrEnum<T>
    friend T operator%(T value, const number_t n)
    {
        return static_cast<long>(static_cast<V>(value)) % static_cast<long>(n._value);
    }

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    number_t &operator%=(T value)
    {
        _value = static_cast<long>(_value) % static_cast<long>(static_cast<V>(value));
        return *this;
    }

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    number_t operator<<(T value)
    {
        return number_t(static_cast<long>(_value) << static_cast<long>(static_cast<V>(value)));
    }

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    number_t &operator<<=(T value)
    {
        _value = static_cast<long>(_value) << static_cast<long>(static_cast<V>(value));
        return *this;
    }

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    number_t operator>>(T value)
    {
        return number_t(static_cast<long>(_value) >> static_cast<long>(static_cast<V>(value)));
    }

    template <typename T = void> requires ArithmeticOrEnumOrNumber<T>
    number_t &operator>>=(T value)
    {
        _value = static_cast<long>(_value) >> static_cast<long>(static_cast<V>(value));
        return *this;
    }

    number_t operator~()
    {
        return ~static_cast<long>(_value);
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    friend bool operator==(const number_t value, N n)
    {
        return value._value == static_cast<V>(n);
    }

    template <typename N = void> requires ArithmeticOrEnum<N>
    friend bool operator==(N n, const number_t value)
    {
        return static_cast<V>(n) == value._value;
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    friend bool operator!=(const number_t value, N n)
    {
        return value._value != static_cast<V>(n);
    }

    template <typename N = void> requires ArithmeticOrEnum<N>
    friend bool operator!=(N n, const number_t value)
    {
        return static_cast<V>(n) != value._value;
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    friend bool operator<(const number_t value, N n)
    {
        return value._value < static_cast<V>(n);
    }

    template <typename N = void> requires ArithmeticOrEnum<N>
    friend bool operator<(N n, const number_t value)
    {
        return static_cast<V>(n) < value._value;
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    friend bool operator<=(const number_t value, N n)
    {
        return value._value <= static_cast<V>(n);
    }

    template <typename N = void> requires ArithmeticOrEnum<N>
    friend bool operator<=(N n, const number_t value)
    {
        return static_cast<V>(n) <= value._value;
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    friend bool operator>(const number_t value, N n)
    {
        return value._value > static_cast<V>(n);
    }

    template <typename N = void> requires ArithmeticOrEnum<N>
    friend bool operator>(N n, const number_t value)
    {
        return static_cast<V>(n) > value._value;
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    friend bool operator>=(const number_t value, N n)
    {
        return value._value >= static_cast<V>(n);
    }

    template <typename N = void> requires ArithmeticOrEnum<N>
    friend bool operator>=(N n, const number_t value)
    {
        return static_cast<V>(n) >= value._value;
    }

    js::string toString();
    js::string toString(number_t radix);

    friend tostream &operator<<(tostream &os, number_t val)
    {
        if (val.is_undefined())
        {
            return os << TXT("undefined");
        }

        if (std::isnan(static_cast<double>(val)))
        {
            return os << TXT("NaN");
        }

        return os << val._value;
    }
};

template <typename T>
pointer_t<T>::pointer_t(js::number n) : _ptr((void*)(long long)n._value), isUndefined(false)
{
}

template <typename T>
template <typename N> requires ArithmeticOrEnumOrNumber<N>
bool pointer_t<T>::operator==(N n)
{
    //return isUndefined == n.isUndefined && intptr_t(_ptr) == intptr_t(static_cast<size_t>(n));
    return false;
}

template <typename T>
template <typename N> requires ArithmeticOrEnumOrNumber<N>
bool pointer_t<T>::operator!=(N n)
{
    //return isUndefined != n.isUndefined || intptr_t(_ptr) != intptr_t(static_cast<size_t>(n));
    return true;
}

} // impl

template <typename N> requires ArithmeticOrEnum<N>
bool undefined_t::operator==(N n) const
{
    return false;
}

template <typename N> requires ArithmeticOrEnum<N>
bool undefined_t::operator!=(N n) const
{
    return true;
}

template <typename N> requires ArithmeticOrEnum<N>
bool operator==(N n, const undefined_t& u) {
    return false;
}

template <typename N> requires ArithmeticOrEnum<N>
bool operator!=(N n, const undefined_t& u) {
    return true;
}

namespace tmpl 
{
template <typename T>
struct string
{
    using string_t = string<T>;

    enum
    {
        string_defined = 0,
        string_null = 1,
        string_undefined = 2
    } _control;
    T _value;

    string() : _value(), _control(string_undefined)
    {
    }

    string(const string &value) : _value(value._value), _control(value._control)
    {
    }

    string(js::pointer_t v) : _value(v ? static_cast<const char_t *>(v) : TXT("")), _control(v ? string_defined : string_null)
    {
    }

    string(tstring value) : _value(value), _control(string_defined)
    {
    }

    string(const char_t *value) : _value(value == nullptr ? TXT("") : value), _control(value == nullptr ? string_null : string_defined)
    {
    }

    string(const char_t value) : _value(1, value), _control(string_defined)
    {
    }

    string(const undefined_t &) : _control(string_undefined)
    {
    }

    inline operator const char_t *()
    {
        return _value.c_str();
    }

    inline operator bool()
    {
        return _control == 0 && !_value.empty();
    }

    inline operator int()
    {
        return !(*this) ? 0 : std::stoi(_value);
    }

    inline operator double()
    {
        return !(*this) ? 0 : std::stod(_value);
    }

    inline operator T &()
    {
        return _value;
    }

    inline operator size_t()
    {
        return _value.size();
    }

    inline bool is_null() const
    {
        return _control == string_null;
    }

    inline bool is_undefined() const
    {
        return _control == string_undefined;
    }

    js::number get_length()
    {
        return js::number(_value.size());
    }

    constexpr string *operator->()
    {
        return this;
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    string_t operator[](N n) const
    {
        return string(_value[n]);
    }

    template <typename B = void> requires BoolOrBoolean<B>
    string_t operator+(B b)
    {
        return string(_value + (b ? "true" : "false"));
    }

    template <typename N = void> requires ArithmeticOrEnum<N>
    string_t operator+(N value)
    {
        return string(_value + to_tstring(value));
    }

    string_t operator+(js::number value)
    {
        return string(_value + value.operator tstring());
    }

    string_t operator+(string value)
    {
        return string(_value + value._value);
    }

    friend string_t operator+(const string &value, string other)
    {
        return mutable_(value) + other;
    }

    string_t operator+(js::pointer_t ptr)
    {
        return string(_value + ((!ptr) ? TXT("null") : to_tstring(static_cast<size_t>(ptr))));
    }

    string_t operator+(any value);

    string_t &operator+=(char_t c)
    {
        _control = string_defined;
        _value.append(string(c)._value);
        return *this;
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    string_t &operator+=(N n)
    {
        auto value = t_tostring(n);
        _control = string_defined;
        _value.append(value);
        return *this;
    }

    string_t &operator+=(string value)
    {
        _control = string_defined;
        _value.append(value._value);
        return *this;
    }

    string_t &operator+=(any value);

    bool operator==(const string_t &other) const
    {
        return _control == string_defined && _value.compare(other._value) == 0;
    }

    bool operator==(const string_t &other)
    {
        return _control == string_defined && _value.compare(other._value) == 0;
    }

    bool operator!=(const string_t &other) const
    {
        return _control == string_defined && _value.compare(other._value) != 0;
    }

    bool operator!=(const string_t &other)
    {
        return _control == string_defined && _value.compare(other._value) != 0;
    }

    bool operator==(undefined_t)
    {
        return is_undefined();
    }

    friend bool operator==(undefined_t, const string_t &other)
    {
        return other.is_undefined();
    }

    bool operator!=(undefined_t)
    {
        return !is_undefined();
    }

    friend bool operator!=(undefined_t, const string_t &other)
    {
        return !other.is_undefined();
    }

    bool operator==(js::pointer_t ptr)
    {
        return is_null() && (!ptr);
    }

    friend bool operator==(js::pointer_t ptr, const string_t &other)
    {
        return other.is_null() && (!ptr);
    }

    bool operator!=(js::pointer_t ptr)
    {
        return _control == string_defined && (!ptr);
    }

    friend bool operator!=(js::pointer_t ptr, const string_t &other)
    {
        return other._control == string_defined && (!ptr);
    }

    string_t concat(string value)
    {
        return _value + value._value;
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    string_t charAt(N n) const
    {
        return _value[n];
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    js::number charCodeAt(N n) const
    {
        return static_cast<size_t>(_value[n]);
    }

    template <typename N = void> requires can_cast_to_size_t<N>
    string_t fromCharCode(N n) const
    {
        return static_cast<char_t>(static_cast<size_t>(n));
    }

    string_t toUpperCase()
    {
        std::string result(this->operator std::string &());
        for (auto &c : result)
        {
            c = toupper(c);
        }

        return string(result);
    }

    string_t toLowerCase()
    {
        std::string result(this->operator std::string &());
        for (auto &c : result)
        {
            c = tolower(c);
        }

        return string(result);
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    string_t substring(N begin, N end)
    {
        return _value.substr(begin, end - begin);
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    string_t slice(N begin)
    {
        return _value.substr(begin < js::number(0) ? get_length() + begin : begin, get_length() - begin);
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    string_t slice(N begin, N end)
    {
        auto endStart = end < js::number(0) ? get_length() + end : end;
        auto endPosition = begin < js::number(0) ? get_length() + begin : begin;
        return _value.substr(begin < js::number(0) ? get_length() + begin : begin, (endStart >= endPosition) ? endStart - endPosition : js::number(0));
    }

    auto begin()
    {
        return _value.begin();
    }

    auto end()
    {
        return _value.end();
    }

    friend tostream &operator<<(tostream &os, string val)
    {
        if (val._control == 2)
        {
            return os << "undefined";
        }

        return os << val._value;
    }

    size_t hash(void) const noexcept
    {
        return std::hash<T>{}(_value);
    }
};

} // namespace tmpl


template<typename T>
string toString(const T& val) {
  tostringstream os;
  os << val;
  return string(os.str());
}

static string string_empty(TXT(""));

static js::string operator""_S(const char_t *s, std::size_t size)
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

static js::number operator+(const string &v)
{
    return number(static_cast<double>(mutable_(v)));
}

static js::number operator+(pointer_t ptr)
{
    return number(reinterpret_cast<size_t>(ptr._ptr));
}

template <typename T, class = std::enable_if_t<std::is_enum_v<T>>>
T operator&(T t1, T t2) {
    return static_cast<T>(static_cast<size_t>(t1) & static_cast<size_t>(t2));
}

template <typename T, class = std::enable_if_t<std::is_enum_v<T>>>
T operator&=(T& t1, T t2) {
    return t1 = static_cast<T>(static_cast<size_t>(t1) & static_cast<size_t>(t2));
}

template <typename T, class = std::enable_if_t<std::is_enum_v<T>>>
T operator|(T t1, T t2) {
    return static_cast<T>(static_cast<size_t>(t1) & static_cast<size_t>(t2));
}

template <typename T, class = std::enable_if_t<std::is_enum_v<T>>>
T operator|=(T& t1, T t2) {
    return t1 = static_cast<T>(static_cast<size_t>(t1) | static_cast<size_t>(t2));
}

template <typename T, class = std::enable_if_t<std::is_enum_v<T>>>
T operator~(T t1) {
    return static_cast<T>(~static_cast<size_t>(t1));
}

// function ///////////////////////////////////////////////////////////////////////
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
struct _Deduction_MethodPtr<Rx(__cdecl *)(Args...)>
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
    using array_type_base = std::vector<E>;
    //using array_type = array_type_base; // array_type_base - value type, std::shared_ptr<array_type_base> - reference type
    using array_type = std::shared_ptr<array_type_base>; // array_type_base - value type, std::shared_ptr<array_type_base> - reference type
    using array_type_ref = array_type_base &;

    template <typename _Ty> 
    struct array_traits {
        template<class... _Types>
	    static _Ty create(_Types&&... _Args) {
            return array_type_base(_Args...);
        }

        static constexpr _Ty& access(std::remove_reference_t<_Ty>& _Arg)
        {	
            return (static_cast<_Ty&>(_Arg));
        }
    };

    template <>
    struct array_traits<std::shared_ptr<array_type_base>> {
        template<class... _Types>
	    static inline auto create(_Types&&... _Args) {
            return std::make_shared<array_type_base>(_Args...);
        }        

        static inline array_type_ref access(array_type& _Arg)
        {	
            return (static_cast<array_type_ref>(*_Arg));
        }
    };

    bool isUndefined;
    array_type _values;

    array() : _values(array_traits<array_type>::create()), isUndefined(false)
    {
    }

    array(const array &value) : _values(value._values), isUndefined(value.isUndefined)
    {
    }

    array(std::initializer_list<E> values) : _values(array_traits<array_type>::create(values)), isUndefined(false)
    {
    }

    array(std::vector<E> values) : _values(array_traits<array_type>::create(values)), isUndefined(false)
    {
    }

    array(const undefined_t &undef) : _values(array_traits<array_type>::create()), isUndefined(true)
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

    constexpr array_type_ref get() const
    {
        return array_traits<array_type>::access(mutable_(_values));
    }

    constexpr array_type_ref get()
    {
        return array_traits<array_type>::access(_values);
    }

    size_t get_length()
    {
        return get().size();
    }

    template <typename N = void> requires can_cast_to_size_t<N>
    E &operator[](N i) const
    {
        if (static_cast<size_t>(i) >= get().size())
        {                        
            if constexpr (std::is_same_v<decltype(E{undefined}), E>) {
                static E empty{undefined};
                return empty;
            } else {
                static E empty;
                return empty;
            }
        }

        return mutable_(get())[static_cast<size_t>(i)];
    }

    template <typename N = void> requires can_cast_to_size_t<N>
    E &operator[](N i)
    {
        while (static_cast<size_t>(i) >= get().size())
        {
            if constexpr (std::is_same_v<decltype(E{undefined}), E>) {
                get().push_back(E{undefined});
            } else {
                get().push_back(E{});
            }            
        }

        return get()[static_cast<size_t>(i)];
    }

    ArrayKeys<size_t> keys()
    {
        return ArrayKeys<size_t>(get().size());
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

    js::number indexOf(const E &e)
    {
        return get().cend() - std::find(get().cbegin(), get().cend(), e) - 1;
    }

    js::boolean removeElement(const E &e)
    {
        return get().erase(std::find(get().cbegin(), get().cend(), e)) != get().cend();
    }

    auto begin()
    {
        return get().begin();
    }

    auto end()
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

    template <typename N = void> requires can_cast_to_size_t<N>
    bool exists(N n) const
    {
        return static_cast<size_t>(n) < get().size();
    }

    template <class T>
    bool exists(T) const
    {
        return false;
    }

    array filter(std::function<bool(E)> p)
    {
        std::vector<E> result;
        std::copy_if(get().begin(), get().end(), std::back_inserter(result), p);
        return result;
    }

    array filter(std::function<bool(E, size_t)> p)
    {
        std::vector<E> result;
        auto first = &(get())[0];
        std::copy_if(get().begin(), get().end(), std::back_inserter(result), [=](auto &v) {
            auto index = &v - first;
            return p(v, index);
        });
        return result;
    }

    template <typename F, class = decltype(F()())>
    auto map(F p) -> array< undefined_t >
    {        
        std::vector< undefined_t > result;
        std::transform(get().begin(), get().end(), std::back_inserter(result), [=](auto &v) {
            mutable_(p)(v);
            return undefined;
        });

        return array< undefined_t > (result);
    }

    template <typename F, class = decltype(F()(E()))>
    auto map(F p) -> array< decltype(p(E())) >
    {        
        std::vector< decltype(p(E())) > result;
        std::transform(get().begin(), get().end(), std::back_inserter(result), [=](auto &v) {
            return mutable_(p)(v);
        });

        return array< decltype(p(E())) >(result);
    }

    template <typename F, class = decltype(F()(E(), 0))>
    auto map(F p) -> array< decltype(p(E(), 0)) >
    {        
        std::vector< decltype(p(E(), 0)) > result;
        auto first = &(get())[0];
        std::transform(get().begin(), get().end(), std::back_inserter(result), [=](auto &v) {
            auto index = &v - first;
            return mutable_(p)(v, index);
        });

        return array< decltype(p(E(), 0)) >(result);
    }

    template <typename P>
    auto reduce(P p)
    {
        return std::reduce(get().begin(), get().end(), 0, p);
    }

    template <typename P, typename I>
    auto reduce(P p, I initial)
    {
        return std::reduce(get().begin(), get().end(), initial, p);
    }

    template <typename P>
    boolean every(P p)
    {
        return std::all_of(get().begin(), get().end(), p);
    }

    template <typename P>
    boolean some(P p)
    {
        return std::any_of(get().begin(), get().end(), p);
    }

    js::string join(js::string s)
    {
        return std::accumulate(get().begin(), get().end(), js::string{}, [&](auto &res, auto &piece) {
            return res += (res) ? s + piece : piece;
        });
    }

    void forEach(std::function<void(E)> p)
    {
        std::for_each(get().begin(), get().end(), p);
    }

    void forEach(std::function<void(E, size_t)> p)
    {
        auto first = &(*_values.get())[0];
        std::result(get().begin(), get().end(), [=](auto &v) {
            auto index = &v - first;
            return p(v, index);
        });
    }
};

} // namespace tmpl

template <typename TKey, typename TMap>
struct ObjectKeys
{
    typedef ObjectKeys<TKey, TMap> iterator;
    typedef decltype(((TMap *)nullptr)->begin()) TIterator_map;

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

namespace tmpl
{

template <typename K, typename V>
struct object
{
    struct K_hash
    {
        typedef K argument_type;
        typedef std::size_t result_type;
        result_type operator()(argument_type const &value) const
        {
            return value.hash();
        }
    };

    struct K_equal_to
    {
        typedef K argument_type;
        bool operator()(argument_type const &value, argument_type const &other) const
        {
            return value == other;
        }
    };

    using object_type_base = std::unordered_map<K, V, K_hash, K_equal_to>;
    //using object_type = object_type_base; // object_type_base - value type, std::shared_ptr<object_type_base> - reference type
    using object_type = std::shared_ptr<object_type_base>; // object_type_base - value type, std::shared_ptr<object_type_base> - reference type
    using object_type_ref = object_type_base &;
    using pair = std::pair<const K, V>;

    template <typename _Ty> 
    struct object_traits {
        template<class... _Types>
	    static _Ty create(_Types&&... _Args) {
            return object_type_base(_Args...);
        }

        static constexpr _Ty& access(std::remove_reference_t<_Ty>& _Arg)
        {	
            return (static_cast<_Ty&>(_Arg));
        }
    };

    template <>
    struct object_traits<std::shared_ptr<object_type_base>> {
        template<class... _Types>
	    static inline auto create(_Types&&... _Args) {
            return std::make_shared<object_type_base>(_Args...);
        }        

        static inline object_type_ref access(object_type& _Arg)
        {	
            return (static_cast<object_type_ref>(*_Arg));
        }
    };


    bool isUndefined;
    object_type _values;

    object();

    object(const object &value);

    object(std::initializer_list<pair> values);

    object(const undefined_t &);

    virtual ~object()
    {
    }

    constexpr operator bool()
    {
        return !isUndefined;
    }

    constexpr object_type_ref get() const
    {
        return object_traits<object_type>::access(mutable_(_values));
    }

    constexpr object_type_ref get()
    {
        return object_traits<object_type>::access(_values);
    }

    static ObjectKeys<js::string, object_type_base> keys(const object &);

    ObjectKeys<js::string, object_type_base> keys();

    constexpr object *operator->()
    {
        return this;
    }

    any &operator[](js::number n) const;

    any &operator[](const char_t *s) const;

    any &operator[](std::string s) const;

    any &operator[](js::string s) const;

    any &operator[](js::number n);

    any &operator[](const char_t *s);

    any &operator[](std::string s);

    any &operator[](js::string s);

    any &operator[](undefined_t undef);

    inline bool operator==(const object &other) const
    {
        // TODO - finish it
        return isUndefined == other.isUndefined && isUndefined == true;
    }

    void Delete(js::number field)
    {
        get().erase(field.operator std::string &());
    }    

    void Delete(js::string field)
    {
        get().erase(field.operator std::string &());
    }

    void Delete(js::any field)
    {
        get().erase(field.operator std::string &());
    }

    void Delete(js::undefined_t)
    {
        get().erase("undefined");
    }    

    void Delete(const char_t *field)
    {
        get().erase(field);
    }

    template <typename N = void> requires ArithmeticOrEnum<N>
    bool exists(N n) const
    {
        return get().find(js::string(to_tstring(n))) != get().end();
    }

    template <class T>
    bool exists(T i) const
    {
        if constexpr (is_stringish_v<T>)
        {
            return get().find(i) != get().end();
        }

        return false;
    }

    virtual js::string toString()
    {
        tostringstream streamObj2;
        streamObj2 << *this;
        return streamObj2.str();
    }

    friend tostream &operator<<(tostream &os, object val)
    {
        if (val.isUndefined)
        {
            return os << TXT("undefined");
        }

        return os << TXT("[object]");
    }
};

} // namespace tmpl

typedef tmpl::object<string, any> object;

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

    enum anyTypeId
    {
        undefined_type = 0,
        boolean_type,
        pointer_type,
        number_type,
        string_type,
        array_type,
        object_type,
        function_type,
        class_type
    };

    using any_value_type = std::variant<
        js::undefined_t,
        js::boolean,
        js::pointer_t,
        js::number,
        js::string,
        js::array_any,
        js::object,
        std::shared_ptr<js::function>,
        std::shared_ptr<js::object>>;

    any_value_type _value;

    any() : _value(undefined)
    {
    }

    any(const any &other) : _value(other._value)
    {
    }

    any(void_t) : _value(undefined)
    {
    }

    any(undefined_t) : _value(undefined)
    {
    }

    any(pointer_t v) : _value(v)
    {
    }

    any(bool value) : _value(js::boolean(value))
    {
    }

    template <typename N = void> requires ArithmeticOrEnum<N>
    any(N value) : _value(js::number(value))
    {
    }

    any(char_t value) : _value(js::string(value))
    {
    }

    any(js::boolean value) : _value(value)
    {
    }

    any(js::number value) : _value(value)
    {
    }

    any(const tstring &value) : _value(js::string(value))
    {
    }

    any(const js::string &value) : _value(value)
    {
    }

    any(const js::array_any &value) : _value(value)
    {
    }

    any(const js::object &value) : _value(value)
    {
    }

    template <typename F, class = std::enable_if_t<std::is_member_function_pointer_v<typename _Deduction<F>::type>>>
    any(const F &value) : _value(std::shared_ptr<js::function>(((js::function *)new js::function_t<F>(value))))
    {
    }

    template <typename Rx, typename... Args>
    any(Rx(__cdecl *value)(Args...)) : _value(std::shared_ptr<js::function>((js::function *)new js::function_t<Rx(__cdecl *)(Args...), Rx(__cdecl *)(Args...)>(value)))
    {
    }

    template <typename C>
    any(std::shared_ptr<C> value) : _value(std::shared_ptr<js::object>(value))
    {
    }

    constexpr any *operator->()
    {
        return this;
    }

    inline anyTypeId get_type() const
    {
        return static_cast<anyTypeId>(_value.index());
    }

    template <typename T>
    inline const T &get() const
    {
        return std::get<T>(_value);
    }

    template <typename T>
    inline std::shared_ptr<T> get_ptr() const
    {
        return std::dynamic_pointer_cast<T>(mutable_(std::get<std::shared_ptr<js::object>>(_value)));
    }

    template <typename T>
    inline T &get()
    {
        return std::get<T>(_value);
    }

    template <typename T>
    inline std::shared_ptr<T> get_ptr()
    {
        return std::dynamic_pointer_cast<T>(std::get<std::shared_ptr<js::object>>(_value));
    }

    inline const js::boolean &boolean_ref_const() const
    {
        return get<js::boolean>();
    }

    inline js::boolean &boolean_ref()
    {
        return get<js::boolean>();
    }

    inline const js::number &number_ref_const() const
    {
        return get<js::number>();
    }

    inline js::number &number_ref()
    {
        return get<js::number>();
    }

    inline const js::string &string_ref_const() const
    {
        return get<js::string>();
    }

    inline js::string &string_ref()
    {
        return get<js::string>();
    }

    inline std::shared_ptr<function> function_ptr()
    {
        return get<std::shared_ptr<function>>();
    }

    inline const array_any &array_ref_const() const
    {
        return get<array_any>();
    }

    inline array_any &array_ref()
    {
        return get<array_any>();
    }

    inline const object &object_ref_const() const
    {
        return get<object>();
    }

    inline object &object_ref()
    {
        return get<object>();
    }

    inline const std::shared_ptr<js::object> &class_ref_const() const
    {
        return get<std::shared_ptr<js::object>>();
    }

    inline std::shared_ptr<js::object> &class_ref()
    {
        return get<std::shared_ptr<js::object>>();
    }

    any &operator=(const any &other)
    {
        _value = other._value;
        return *this;
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    any &operator=(N other)
    {
        _value = js::number(other);
        return *this;
    }

    template <class T>
    any &operator[](T t) const
    {
        if constexpr (std::is_same_v<T, js::number>)
        {
            if (get_type() == anyTypeId::array_type)
            {
                return mutable_(array_ref())[t];
            }
        }

        if constexpr (is_stringish_v<T>)
        {
            if (get_type() == anyTypeId::object_type)
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
            if (get_type() == anyTypeId::array_type)
            {
                return (array_ref())[t];
            }
        }

        if constexpr (is_stringish_v<T>)
        {
            if (get_type() == anyTypeId::object_type)
            {
                return (object_ref())[t];
            }
        }

        throw "wrong type";
    }

    operator js::pointer_t()
    {
        if (get_type() == anyTypeId::string_type && string_ref().is_null())
        {
            return null;
        }

        if (get_type() == anyTypeId::number_type)
        {
            return pointer_t(number_ref());
        }

        if (get_type() == anyTypeId::class_type)
        {
            return pointer_t(class_ref().get());
        }

        return pointer_t(0xffffffff);
    }

    operator js::boolean()
    {
        if (get_type() == anyTypeId::boolean_type)
        {
            return boolean_ref();
        }

        throw "wrong type";
    }

    operator js::number()
    {
        if (get_type() == anyTypeId::number_type)
        {
            return number_ref();
        }

        if (get_type() == anyTypeId::string_type)
        {
            char_t* end;
            #ifdef UNICODE
            return js::number(std::wcstof(string_ref().operator const char_t *(), &end));
            #else
            return js::number(std::strtof(string_ref().operator const char_t *(), &end));
            #endif
        }

        throw "wrong type";
    }

    operator js::string()
    {
        /*
            // String
            template <typename T>
            string<T>::string(any val) : _value(val != null ? val.operator std::string() : string_empty._value), _control(val != null ? string_defined : string_null)
            {
            }    
        */

        if (get_type() == anyTypeId::undefined_type)
        {
            return js::string();
        }

        if (get_type() == anyTypeId::string_type)
        {
            return string_ref();
        }

        if (get_type() == anyTypeId::number_type)
        {
            return js::string(number_ref().operator tstring());
        }

        if (get_type() == anyTypeId::pointer_type)
        {
            return js::string(get<js::pointer_t>());
        }        

        throw "wrong type";
    }

    operator js::object()
    {
        if (get_type() == anyTypeId::object_type)
        {
            return object_ref();
        }

        throw "wrong type";
    }

    operator js::array_any()
    {
        if (get_type() == anyTypeId::array_type)
        {
            return array_ref();
        }

        throw "wrong type";
    }

    operator bool()
    {
        switch (get_type())
        {
        case anyTypeId::undefined_type:
            return false;
        case anyTypeId::boolean_type:
            return boolean_ref();
        case anyTypeId::number_type:
            return number_ref();
        case anyTypeId::string_type:
            return string_ref()._value.length() > 0;
        case anyTypeId::object_type:
            return object_ref()->get().size() > 0;
        case anyTypeId::array_type:
            return array_ref()->get().size() > 0;
        case anyTypeId::pointer_type:
            return get<pointer_t>();
        case anyTypeId::class_type:
            return true;
        default:
            break;
        }

        return false;
    }

    template <typename N = void> requires ArithmeticOrEnum<N>
    operator N()
    {
        switch (get_type())
        {
        case anyTypeId::undefined_type:
            return 0;
        case anyTypeId::boolean_type:
            return boolean_ref() ? 1 : 0;
        case anyTypeId::number_type:
            return number_ref();
        case anyTypeId::string_type:
            char_t* end;
            #ifdef UNICODE
            return static_cast<N>(std::wcstof(string_ref().operator const char_t *(), &end));
            #else
            return static_cast<N>(std::strtof(string_ref().operator const char_t *(), &end));
            #endif
        }

        throw "wrong type";
    }

    template <typename T>
    operator std::shared_ptr<T>()
    {
        if (get_type() == anyTypeId::class_type)
        {
            return std::dynamic_pointer_cast<T>(std::get<std::shared_ptr<js::object>>(_value));
        }

        throw "wrong type";
    }

    template <typename Rx, typename... Args>
    operator std::function<Rx(Args...)>()
    {
        if (get_type() == anyTypeId::function_type)
        {
            auto func = function_ptr();
            return std::function<Rx(Args...)>([=](Args... args) -> Rx {
                return func->invoke({args...});
            });
        }

        throw "wrong type";
    }

    operator tstring()
    {
        tostringstream streamObj2;
        streamObj2 << *this;
        return streamObj2.str();
    }

    bool operator==(const js::any &other) const
    {
        if (get_type() != other.get_type())
        {
            return false;
        }

        switch (get_type())
        {
        case anyTypeId::undefined_type:
            return true;
        case anyTypeId::boolean_type:
            return boolean_ref_const() == mutable_(other).boolean_ref_const();
        case anyTypeId::number_type:
            return number_ref_const() == mutable_(other).number_ref_const();
        case anyTypeId::string_type:
            return string_ref_const() == mutable_(other).string_ref_const();
        case anyTypeId::object_type:
            return object_ref_const() == mutable_(other).object_ref_const();
        }

        throw "not implemented";
    }

    bool operator!=(const js::any &other) const
    {
        return !(*this == other);
    }

    bool operator==(const js::undefined_t &) const
    {
        return get_type() == anyTypeId::undefined_type;
    }

    bool operator!=(const js::undefined_t &) const
    {
        return get_type() != anyTypeId::undefined_type;
    }

    bool operator==(const pointer_t &other) const
    {
        switch (get_type())
        {
        case anyTypeId::undefined_type:
        case anyTypeId::boolean_type:
        case anyTypeId::number_type:
            return false;
        case anyTypeId::string_type:
            return string_ref_const().is_null() && other._ptr == nullptr;
        case anyTypeId::object_type:
        case anyTypeId::class_type:
        case anyTypeId::pointer_type:
            return get<pointer_t>()._ptr == other._ptr;
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

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    bool operator==(const N &n) const
    {
        return static_cast<js::number>(*mutable_(this)) == n;
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    friend bool operator==(const N &n, const any& val)
    {
        return n == static_cast<js::number>(mutable_(val));
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    bool operator!=(const N &n) const
    {
        return static_cast<js::number>(*mutable_(this)) != n;
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    friend bool operator!=(const N &n, const any& val)
    {
        return n != static_cast<js::number>(mutable_(val));
    }

    bool operator==(const js::string &other) const
    {
        return static_cast<js::string>(*mutable_(this)) == other;
    }

    bool operator!=(const js::string &other) const
    {
        return static_cast<js::string>(*mutable_(this)) != other;
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    any operator+(N n)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            return number_ref() + n;
        }

        throw "not implemented";
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    friend N operator+(N n, const any& val)
    {
        switch (val.get_type())
        {
        case anyTypeId::number_type:
            return n + mutable_(val).number_ref();
        }

        throw "not implemented";
    }

    any operator+(string s)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            return number_ref().operator js::string() + s;
        case anyTypeId::string_type:
            return any(string_ref() + s);
        }

        throw "not implemented";
    }

    inline any operator+(any t) const
    {
        return mutable_(this)->operator+(t);
    }

    any operator+(any t)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            switch (t.get_type())
            {
            case anyTypeId::number_type:
                return number_ref() + t.number_ref();
            case anyTypeId::string_type:
                return number_ref().operator js::string() + t.string_ref();
            }
            break;
        case anyTypeId::string_type:
            switch (t.get_type())
            {
            case anyTypeId::string_type:
                return string_ref() + t.string_ref();
            }
            break;
        }

        throw "not implemented";
    }

    any &operator++()
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            number_ref()++;
            return *this;
        }

        throw "not implemented";
    }

    any operator++(int)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            any tmp(number_ref());
            operator++();
            return tmp;
        }

        throw "not implemented";
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    any &operator+=(N n)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            number_ref() += n;
            return *this;
        }

        throw "not implemented";
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    friend N operator+=(N &n, any value)
    {
        switch (value.get_type())
        {
        case anyTypeId::number_type:
            return n += value.number_ref();
        }

        throw "not implemented";
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    any operator-(N n)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            return number_ref() - n;
        }

        throw "not implemented";
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    friend N operator-(N n, const any& val)
    {
        switch (val.get_type())
        {
        case anyTypeId::number_type:
            return n - mutable_(val).number_ref();
        }

        throw "not implemented";
    }    

    any operator-(any t)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            switch (t.get_type())
            {
            case anyTypeId::number_type:
                return number_ref() - t.number_ref();
            }
            break;
        }

        throw "not implemented";
    }

    any &operator--()
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            number_ref() -= 1;
            return *this;
        }

        throw "not implemented";
    }

    any operator--(int)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            any tmp(number_ref());
            operator--();
            return tmp;
        }

        throw "not implemented";
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    any &operator-=(N n)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            number_ref() -= n;
            return *this;
        }

        throw "not implemented";
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    friend N operator-=(N &n, any value)
    {
        switch (value.get_type())
        {
        case anyTypeId::number_type:
            return n -= value.number_ref();
        }

        throw "not implemented";
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    any operator*(N n)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            return any(number_ref() * n);
        }

        throw "not implemented";
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    friend N operator*(N n, const any& val)
    {
        switch (val.get_type())
        {
        case anyTypeId::number_type:
            return n * mutable_(val).number_ref();
        }

        throw "not implemented";
    }    

    any operator*(any t)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            switch (t.get_type())
            {
            case anyTypeId::number_type:
                return any(number_ref() * t.number_ref());
            }
            break;
        }

        throw "not implemented";
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    any &operator*=(N n)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            number_ref() *= n;
            return *this;
        }

        throw "not implemented";
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    any operator/(N n)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            return any(number_ref() / n);
        }

        throw "not implemented";
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    friend N operator/(N n, const any& val)
    {
        switch (val.get_type())
        {
        case anyTypeId::number_type:
            return n / mutable_(val).number_ref();
        }

        throw "not implemented";
    }

    any operator/(any t)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            switch (t.get_type())
            {
            case anyTypeId::number_type:
                return any(number_ref() / t.number_ref());
            }
            break;
        }

        throw "not implemented";
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    any &operator/=(N n)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            number_ref() /= n;
            return *this;
        }

        throw "not implemented";
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    any operator%(N n)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            return any(number_ref() % n);
        }

        throw "not implemented";
    }

    any operator%(any t)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            switch (t.get_type())
            {
            case anyTypeId::number_type:
                return any(number_ref() % t.number_ref());
            }
            break;
        }

        throw "not implemented";
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    friend any operator%(N n, any value)
    {
        switch (value.get_type())
        {
        case anyTypeId::number_type:
            return any(n % value.number_ref());
        }

        throw "not implemented";
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    any &operator%=(N other)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            number_ref() %= other;
            return *this;
        }

        throw "not implemented";
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    bool operator>(N n)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            return number_ref() > n;
        }

        throw "not implemented";
    }

    any operator>(any t)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            switch (t.get_type())
            {
            case anyTypeId::number_type:
                return any(number_ref() > t.number_ref());
            }
            break;
        }

        throw "not implemented";
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    bool operator>=(N n)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            return number_ref() >= n;
        }

        throw "not implemented";
    }

    any operator>=(any t)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            switch (t.get_type())
            {
            case anyTypeId::number_type:
                return any(number_ref() >= t.number_ref());
            }
            break;
        }

        throw "not implemented";
    }

    template <typename N = void> requires ArithmeticOrEnumOrNumber<N>
    bool operator<(N n)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            return number_ref() < n;
        }

        throw "not implemented";
    }

    any operator<(any t)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            switch (t.get_type())
            {
            case anyTypeId::number_type:
                return any(number_ref() < t.number_ref());
            }
            break;
        }

        throw "not implemented";
    }

    bool operator<=(js::number n)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            return number_ref() <= n;
        }

        throw "not implemented";
    }

    any operator<=(any t)
    {
        switch (get_type())
        {
        case anyTypeId::number_type:
            switch (t.get_type())
            {
            case anyTypeId::number_type:
                return any(number_ref() <= t.number_ref());
            }
            break;
        }

        throw "not implemented";
    }

    template <typename... Args>
    any operator()(Args... args) const
    {
        switch (get_type())
        {
        case anyTypeId::function_type:
            return function_ptr()->invoke({args...});
        }

        throw "not implemented";
    }

    template <typename... Args>
    any operator()(Args... args)
    {
        switch (get_type())
        {
        case anyTypeId::function_type:
            return function_ptr()->invoke({args...});
        }

        throw "not implemented";
    }

    js::string type_of()
    {
        switch (get_type())
        {
        case anyTypeId::undefined_type:
            return TXT("undefined");

        case anyTypeId::boolean_type:
            return TXT("boolean");

        case anyTypeId::number_type:
            return TXT("number");

        case anyTypeId::string_type:
            return TXT("string");

        case anyTypeId::array_type:
            return TXT("array");

        case anyTypeId::object_type:
            return TXT("object");

        default:
            return TXT("error");
        }
    }

    void Delete(const char_t *field)
    {
        switch (get_type())
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
        switch (get_type())
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
        switch (get_type())
        {
        case anyTypeId::array_type:
            return array_ref().begin();
        default:
            throw "wrong type";
        }
    }

    auto end() -> decltype(array_ref().end())
    {
        switch (get_type())
        {
        case anyTypeId::array_type:
            return array_ref().end();
        default:
            throw "wrong type";
        }
    }

    size_t hash(void) const noexcept
    {
        size_t const h1(std::hash<int>{}(static_cast<int>(get_type())));
        size_t h2;

        switch (get_type())
        {
        case anyTypeId::undefined_type:
            h2 = 0;
            break;

        case anyTypeId::boolean_type:
            h2 = std::hash<bool>{}(static_cast<bool>(mutable_(boolean_ref_const())));
            break;

        case anyTypeId::number_type:
            h2 = std::hash<double>{}(static_cast<double>(mutable_(number_ref_const())));
            break;

        case anyTypeId::string_type:
            h2 = std::hash<tstring>{}(static_cast<tstring &>(mutable_(string_ref_const())));
            break;

        default:
            h2 = 0;
        }

        return hash_combine(h1, h2);
    }

    friend tostream &operator<<(tostream &os, any val)
    {
        switch (val.get_type())
        {
        case anyTypeId::undefined_type:
            return os << TXT("undefined");

        case anyTypeId::boolean_type:
            return os << val.boolean_ref();

        case anyTypeId::number_type:
            return os << val.number_ref();

        case anyTypeId::pointer_type:
            return os << TXT("null");

        case anyTypeId::string_type:
            return os << val.string_ref();

        case anyTypeId::function_type:
            return os << TXT("[function]");

        case anyTypeId::array_type:
            return os << TXT("[array]");

        case anyTypeId::object_type:
            return os << TXT("[object]");

        case anyTypeId::class_type:
            return os << val.class_ref().get()->toString();

        default:
            return os << TXT("[any]");
        }
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

template <typename T>
struct shared;

template <class T1, class T2>
concept NotShared = !std::is_same_v<T1, shared<T2>>;

template <typename T>
struct shared
{
    using shared_type = shared<T>;

    std::shared_ptr<T> _value;

    shared(T t) : _value(std::make_shared<T>(t)) {}
    shared(std::shared_ptr<T> t) : _value(t) {}

    template <typename V>
    shared_type &operator=(const V &v)
    {
        *_value = mutable_(v);
        return *this;
    }

    T &operator*() const
    {
        return *_value.get();
    }    

    operator T() { return *_value.get(); }

    // todo: memory leak here, improve it using any(shared_t<value> s)
    operator any() { return *_value.get(); }

    T &get() const { return *_value.get(); }

    T *operator->() const
    {
        return _value.get();
    }

    template <class Tv>
    auto &operator[](Tv t) const
    {
        return const_(get())[t];
    }

    template <class Tv>
    auto &operator[](Tv t)
    {
        return get()[t];
    }

    auto &operator++()
    {
        return ++get();
    }

    auto operator++(int)
    {
        return get()++;
    }

    template <class Tv>
    auto operator+(Tv other) const
    {
        return get() + other;
    }

    template <class Tv = void> requires NotShared<Tv, T>
    friend auto operator+(Tv other, const shared_type &val)
    {
        return other + val.get();
    }

    template <class Tv>
    auto operator+=(Tv other) const
    {
        return get() += other;
    }    

    template <class Tv> requires NotShared<Tv, T>
    friend auto operator+=(Tv& other, const shared_type &val)
    {
        return other += mutable_(val).get();
    }    

    template <class Tv>
    auto operator-(Tv other) const
    {
        return get() - other;
    }    

    template <class Tv = void> requires NotShared<Tv, T>
    friend auto operator-(Tv other, const shared_type &val)
    {
        return other - val.get();
    }

    template <class Tv>
    auto operator-=(Tv other) const
    {
        return get() -= other;
    }    

    template <class Tv> requires NotShared<Tv, T>
    friend auto operator-=(Tv& other, const shared_type &val)
    {
        return other -= mutable_(val).get();
    }    

    template <class Tv>
    auto operator*(Tv other) const
    {
        return get() * other;
    }    

    template <class Tv = void> requires NotShared<Tv, T>
    friend auto operator*(Tv other, const shared_type &val)
    {
        return other * val.get();
    }

    template <class Tv>
    auto operator*=(Tv other) const
    {
        return get() *= other;
    }    

    template <class Tv> requires NotShared<Tv, T>
    friend auto operator*=(Tv& other, const shared_type &val)
    {
        return other *= mutable_(val).get();
    }    

    template <class Tv>
    auto operator/(Tv other) const
    {
        return get() / other;
    }    

    template <class Tv = void> requires NotShared<Tv, T>
    friend auto operator/(Tv other, const shared_type &val)
    {
        return other / val.get();
    }

    template <class Tv>
    auto operator/=(Tv other) const
    {
        return get() /= other;
    }        

    template <class Tv> requires NotShared<Tv, T>
    friend auto operator/=(Tv& other, const shared_type &val)
    {
        return other /= mutable_(val).get();
    }    

    template <class Tv>
    friend bool operator==(const Tv &other, const shared_type &val)
    {
        return val.get() == other;
    }

    template <class Tv>
    friend bool operator!=(const Tv &other, const shared_type &val)
    {
        return val.get() != other;
    }

    template <class Tv>
    bool operator==(const Tv &other) const
    {
        return get() == other;
    }

    template <class Tv>
    bool operator!=(const Tv &other) const
    {
        return get() != other;
    }    

    template <class Tv>
    friend bool operator==(const shared<Tv> &other, const shared_type &val)
    {
        return val.get() == other.get();
    }

    template <class Tv>
    friend bool operator!=(const shared<Tv> &other, const shared_type &val)
    {
        return val.get() != other.get();
    }

    template <class Tv>
    bool operator==(const shared<Tv> &other) const
    {
        return get() == other.get();
    }

    template <class Tv>
    bool operator!=(const shared<Tv> &other) const
    {
        return get() != other.get();
    } 

    number get_length()
    {
        return get()->get_length();
    }

    auto begin()
    {
        return get()->begin();
    }

    auto end()
    {
        return get()->end();
    }
};

template <typename T>
shared(T t)->shared<T>;

// TODO: put into class undefined
static js::number operator+(const undefined_t &v)
{
    return number(NAN);
}

// TODO: put into class boolean
static js::number operator+(const boolean &v)
{
    return number((mutable_(v)) ? 1 : 0);
}

// typedefs
typedef std::unordered_map<any, int, any::any_hash, any::any_equal_to> switch_type;

// Number
static js::number Infinity(std::numeric_limits<double>::infinity());
static js::number NaN(std::numeric_limits<double>::quiet_NaN());

namespace tmpl
{

// Number
template <typename V>
number<V>::operator js::string()
{
    return js::string(static_cast<tstring>(*this));
}

template <typename V>
js::string number<V>::toString()
{
    tostringstream streamObj2;
    streamObj2 << _value;
    return streamObj2.str();
}

template <typename V>
js::string number<V>::toString(number_t radix)
{
    return js::string(to_tstring(_value));
}

template <typename T>
string<T> string<T>::operator+(any value)
{
    string tmp(_value);
    tmp._value.append(value.operator std::string());
    return tmp;
}

template <typename T>
string<T> &string<T>::operator+=(any value)
{
    auto value_string = value.operator std::string();
    _control = string_defined;
    _value.append(value_string);
    return *this;
}

// Object
template <typename K, typename V>
object<K, V>::object() : _values(object<K, V>::object_traits<object<K, V>::object_type>::create()), isUndefined(false)
{
}

template <typename K, typename V>
object<K, V>::object(const object& value) : _values(value._values), isUndefined(value.isUndefined)
{
}

template <typename K, typename V>
object<K, V>::object(std::initializer_list<pair> values) : _values(object<K, V>::object_traits<object<K, V>::object_type>::create(values)), isUndefined(false)
{
    auto& ref = get();
    for (auto &item : values)
    {
        ref[item.first] = item.second;
    }
}

template <typename K, typename V>
object<K, V>::object(const undefined_t &) : _values(object<K, V>::object_traits<object<K, V>::object_type>::create()), isUndefined(true)
{
}

template <typename K, typename V>
ObjectKeys<js::string, typename object<K, V>::object_type_base> object<K, V>::keys(const object<K, V> &obj)
{
    return ObjectKeys<js::string, object<K, V>::object_type_base>(obj->get());
}

template <typename K, typename V>
ObjectKeys<js::string, typename object<K, V>::object_type_base> object<K, V>::keys()
{
    return ObjectKeys<js::string, object<K, V>::object_type_base>(get());
}

template <typename K, typename V>
any &object<K, V>::operator[](js::number n) const
{
    return mutable_(get())[static_cast<std::string>(n)];
}

template <typename K, typename V>
any &object<K, V>::operator[](js::number n)
{
    return get()[static_cast<std::string>(n)];
}

template <typename K, typename V>
any &object<K, V>::operator[](const char_t *s) const
{
    return mutable_(get())[std::string(s)];
}

template <typename K, typename V>
any &object<K, V>::operator[](std::string s) const
{
    return mutable_(get())[s];
}

template <typename K, typename V>
any &object<K, V>::operator[](js::string s) const
{
    return mutable_(get())[(std::string)s];
}

template <typename K, typename V>
any &object<K, V>::operator[](const char_t *s)
{
    return get()[std::string(s)];
}

template <typename K, typename V>
any &object<K, V>::operator[](std::string s)
{
    return get()[s];
}

template <typename K, typename V>
any &object<K, V>::operator[](js::string s)
{
    return get()[(std::string)s];
}

template <typename K, typename V>
any &object<K, V>::operator[](undefined_t)
{
    return get()["undefined"];
}

} // namespace tmpl

// typeof
template <>
string type_of(boolean value)
{
    return STR("boolean");
}

template <>
string type_of(number value)
{
    return STR("number");
}

template <>
string type_of(string value)
{
    return STR("string");
}

template <>
string type_of(object value)
{
    return STR("object");
}

template <>
string type_of(any value)
{
    return value.type_of();
}

template <class T>
static any Void(T value)
{
    return any();
}

template <typename I>
inline bool is(js::any t)
{
    return false;
}

template <>
inline bool is<js::boolean>(js::any t)
{
    return t && t.get_type() == any::anyTypeId::boolean_type;
}

template <>
inline bool is<js::number>(js::any t)
{
    return t && t.get_type() == any::anyTypeId::number_type;
}

template <>
inline bool is<js::string>(js::any t)
{
    return t && t.get_type() == any::anyTypeId::string_type;
}

template <>
inline bool is<js::array_any>(js::any t)
{
    return t && t.get_type() == any::anyTypeId::array_type;
}

template <>
inline bool is<js::object>(js::any t)
{
    return t && t.get_type() == any::anyTypeId::object_type;
}

template <>
inline bool is<js::function>(js::any t)
{
    return t && t.get_type() == any::anyTypeId::function_type;
}

namespace utils
{

struct finally
{
private:
    std::function<void()> _dtor;

public:
    finally(std::function<void()> dtor) : _dtor(dtor){};
    ~finally() { _dtor(); }
};

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

}; // namespace Utils

template <typename V, class Ax = void> requires has_exists_member<Ax>
constexpr bool in(V v, const Ax &a)
{
    return a.exists(v);
}

template <typename V, class Ax = void> requires has_exists_member<Ax>
constexpr bool in(V v, Ax *a)
{
    return a->exists(v);
}

template <typename V, class O>
constexpr bool in(V v, O o)
{
    return false;
}

} // namespace js

#ifdef UNICODE
#define MAIN                                                             \
    int wmain(int argc, char_t **argv)                                   \
    {                                                                    \
        try                                                              \
        {                                                                \
            Main();                                                      \
        }                                                                \
        catch (const js::string &s)                                      \
        {                                                                \
            std::wcout << TXT("Exception: ") << s << std::endl;          \
        }                                                                \
        catch (const js::any &a)                                         \
        {                                                                \
            std::wcout << TXT("Exception: ") << a << std::endl;          \
        }                                                                \
        catch (const std::exception &exception)                          \
        {                                                                \
            std::cout << "Exception: " << exception.what() << std::endl; \
        }                                                                \
        catch (const tstring &s)                                         \
        {                                                                \
            std::wcout << TXT("Exception: ") << s << std::endl;          \
        }                                                                \
        catch (const char_t *s)                                          \
        {                                                                \
            std::wcout << TXT("Exception: ") << s << std::endl;          \
        }                                                                \
        catch (...)                                                      \
        {                                                                \
            std::wcout << TXT("General failure.") << std::endl;          \
        }                                                                \
        return 0;                                                        \
    }
#else
#define MAIN                                                             \
    int main(int argc, char_t **argv)                                    \
    {                                                                    \
        try                                                              \
        {                                                                \
            Main();                                                      \
        }                                                                \
        catch (const js::string &s)                                      \
        {                                                                \
            std::cout << TXT("Exception: ") << s << std::endl;           \
        }                                                                \
        catch (const js::any &a)                                         \
        {                                                                \
            std::cout << TXT("Exception: ") << a << std::endl;           \
        }                                                                \
        catch (const std::exception &exception)                          \
        {                                                                \
            std::cout << "Exception: " << exception.what() << std::endl;\
        }                                                                \
        catch (const tstring &s)                                         \
        {                                                                \
            std::cout << TXT("Exception: ") << s << std::endl;           \
        }                                                                \
        catch (const char_t *s)                                          \
        {                                                                \
            std::cout << TXT("Exception: ") << s << std::endl;           \
        }                                                                \
        catch (...)                                                      \
        {                                                                \
            std::cout << TXT("General failure.") << std::endl;           \
        }                                                                \
        return 0;                                                        \
    }
#endif

// JS Core classes
namespace js
{

template<class _Fn, class... _Args>
static void thread(_Fn f, _Args... args) {
    new std::thread(f, args...);
}

static void sleep(js::number n) {
    std::this_thread::sleep_for(std::chrono::milliseconds(static_cast<size_t>(n)));
}

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
    catch (const std::exception &)
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

typedef any Action;

typedef any Function;

struct RegExp
{

#ifdef UNICODE
    std::wregex re;
#else
    std::regex re;
#endif    

    RegExp(js::string pattern) : re((const char_t *)pattern)
    {
    }

    js::boolean test(js::string val)
    {
        try
        {
            if (std::regex_search((const char_t *)val, re))
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

    static number pow(number op1, number op2)
    {
        return number(std::pow(static_cast<double>(op1), static_cast<double>(op2)));
    }

    static number min(number op1, number op2)
    {
        return number(std::min(static_cast<double>(op1), static_cast<double>(op2)));
    }

    static number max(number op1, number op2)
    {
        return number(std::max(static_cast<double>(op1), static_cast<double>(op2)));
    }

    static number sin(number op1)
    {
        return number(std::sin(static_cast<double>(op1)));
    }

    static number cos(number op1)
    {
        return number(std::cos(static_cast<double>(op1)));
    }

    static number asin(number op1)
    {
        return number(std::asin(static_cast<double>(op1)));
    }

    static number acos(number op1)
    {
        return number(std::acos(static_cast<double>(op1)));
    }

    static number abs(number op1)
    {
        return number(std::abs(static_cast<double>(op1)));
    }

    static number floor(number op1)
    {
        return number(std::floor(static_cast<double>(op1)));
    }

    static number round(number op1, int numDecimalPlaces = 0)
    {
        const auto mult = 10 ^ (numDecimalPlaces);
        return number(std::floor(static_cast<double>(op1) * mult + 0.5) / mult);
    }

    static number sqrt(number op1)
    {
        return number(std::sqrt(static_cast<double>(op1)));
    }

    static number tan(number op1)
    {
        return number(std::tan(static_cast<double>(op1)));
    }

    static number atan(number op1)
    {
        return number(std::atan(static_cast<double>(op1)));
    }

    static number atan2(number op1, number op2)
    {
        return number(std::atan2(static_cast<double>(op1), static_cast<double>(op2)));
    }

    static number log(number op1)
    {
        return number(std::log(static_cast<double>(op1)));
    }

    static number exp(number op1)
    {
        return number(std::exp(static_cast<double>(op1)));
    }

    static number random()
    {
        std::default_random_engine generator;
        std::uniform_real_distribution<double> distribution(0.0, 1.0);
        auto rnd = distribution(generator);
        return number(rnd);
    }

    static number sign(number op1)
    {
        auto d = static_cast<double>(op1);
        return number(d < 0 ? -1 : d > 0 ? 1 : 0);
    }
} Math;

static number E(2.718281828459045);
static number LN10(2.302585092994046);
static number LN2(0.6931471805599453);
static number LOG2E(1.4426950408889634);
static number LOG10E(0.4342944819032518);
static number PI(3.141592653589793);
static number SQRT1_2(0.7071067811865476);
static number SQRT2(1.4142135623730951);

template <typename I, class = std::enable_if_t<!std::is_enum_v<I>>>
constexpr inline I pass(I i) {
    return i;
}

template <typename I, class = std::enable_if_t<std::is_enum_v<I>>>
constexpr inline size_t pass(I i) {
    return static_cast<size_t>(i);
}

static struct Console
{
    Console()
    {
#ifdef UNICODE        
        std::wcout << std::boolalpha;
#else        
        std::cout << std::boolalpha;
#endif        
    }

    constexpr Console *operator->()
    {
        return this;
    }

    template <class... Args>
    void log(Args&&... args)
    {
#ifdef UNICODE        
        auto dummy = { (std::wcout << pass(args), 0)... };
        std::wcout << std::endl;
#else
        auto dummy = { (std::cout << pass(args), 0)... };
        std::cout << std::endl;
#endif        
    }

    template <class... Args>
    void warn(Args&&... args)
    {
#ifdef UNICODE 
        auto dummy = { (std::wclog << pass(args), 0)... };
        std::wclog << std::endl;
#else        
        auto dummy = { (std::clog << pass(args), 0)... };
        std::clog << std::endl;
#endif          
    }

    template <class... Args>
    void error(Args&&... args)
    {
#ifdef UNICODE 
        auto dummy = { (std::wcerr << pass(args), 0)... };
        std::wcerr << std::endl;
#else        
        auto dummy = { (std::cerr << pass(args), 0)... };
        std::cerr << std::endl;
#endif          
    }

    template <class... Args>
    void debug(Args&&... args)
    {
#ifdef UNICODE 
        auto dummy = { (std::wclog << pass(args), 0)... };
        std::wclog << std::endl;
#else        
        auto dummy = { (std::clog << pass(args), 0)... };
        std::clog << std::endl;
#endif          
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