#include <iostream>
#include <bitset>
#include <limits>

union
{
	unsigned long long itgr;
	double flt;
} v;

void main(void)
{
	v.flt = std::nan("");
	std::cout << std::bitset<sizeof(double)*8>(v.itgr) << std::endl;

	v.flt = -std::nan("");
	std::cout << std::bitset<sizeof(double)*8>(v.itgr) << std::endl;

	v.flt = std::numeric_limits<double>::infinity();
	std::cout << std::bitset<sizeof(double)*8>(v.itgr) << std::endl;
}
