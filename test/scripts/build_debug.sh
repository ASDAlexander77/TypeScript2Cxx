mkdir __build_debug
cd __build_debug
export CC=gcc
export CX=g++
cmake -f .. -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=Debug -Wno-dev
make -j 4