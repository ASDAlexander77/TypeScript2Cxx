#include "core.h"
#include "appwindow.h"

int main(int argc, char** args) 
{
	auto w = std::make_shared<AppWindow>();
	w->run();
	return 0;
}
