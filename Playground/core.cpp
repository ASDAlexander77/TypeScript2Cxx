#include "core.h"

using namespace js;

namespace js
{

pointer_t::pointer_t(number n) : _ptr((void*)(long long)n._value), isUndefined(true)
{
}

bool pointer_t::operator==(js::number n)
{
    //return isUndefined == n.isUndefined && intptr_t(_ptr) == intptr_t(static_cast<size_t>(n));
    return isUndefined == n.is_undefined() && false;
}

bool pointer_t::operator!=(js::number n)
{
    //return isUndefined != n.isUndefined || intptr_t(_ptr) != intptr_t(static_cast<size_t>(n));
    return isUndefined != n.is_undefined() || true;
}

} // namespace js
