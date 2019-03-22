mkdir __build_release
cd __build_release
export CC=gcc
export CX=g++
cmake -f .. -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=Release -Wno-dev
make -j 4