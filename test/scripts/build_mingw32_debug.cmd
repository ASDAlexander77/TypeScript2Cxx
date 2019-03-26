md __build_mingw32_debug
cd __build_mingw32_debug
cmake -f .. -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=Debug -Wno-dev
mingw32-make -j 4