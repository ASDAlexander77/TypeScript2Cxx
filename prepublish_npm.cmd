if exist packages goto :skip 
md packages
:skip
cd packages
if exist tsc-cxx goto :skip2
md tsc-cxx
:skip2
cd tsc-cxx
if exist lib goto :skip3
md lib
if exist bin goto :skip3
md bin
if exist cpplib goto :skip3
md cpplib
:skip3

cd ..\..

del "packages\tsc-cxx\lib\*.js"
del "packages\tsc-cxx\lib\*.js.map"

del "packages\tsc-cxx\cpplib\*.cpp"
del "packages\tsc-cxx\cpplib\*.h"

@call tsc -p ./
copy __out\*.js "packages\tsc-cxx\lib"
copy __out\*.js.map "packages\tsc-cxx\lib"

copy cpplib\core.h "packages\tsc-cxx\cpplib"

cd ..\..