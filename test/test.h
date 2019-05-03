#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

enum AnimationKeyInterpolation {
    STEP = 1
};

class IAnimationKey : public object {
public:
    AnimationKeyInterpolation interpolation;
};

#endif
