#include "core.h"

using namespace js;

class Grid {
public:
    virtual void dummy() {};
    number scale;
    static object origin;
    auto calculateDistanceFromOrigin(object point) -> auto
    {
        auto xDist = (point["x"] - Grid::origin["x"]);
        auto yDist = (point["y"] - Grid::origin["y"]);
        return (xDist * xDist + yDist * yDist) / this->scale;
    }

    Grid(number scale_) : scale(scale_)  {
    }
};
