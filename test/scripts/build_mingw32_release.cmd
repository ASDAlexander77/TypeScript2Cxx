md __build_mingw32_release
cd __build_mingw32_release
cmake -f .. -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release -Wno-dev
mingw32-make -j 4