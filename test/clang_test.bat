set LLVMPATH=C:\dev\TypeScriptCompiler\3rdParty\llvm\release\bin
%LLVMPATH%\clang++ -std=c++20 -Wno-switch -Wno-deprecated-declarations -Wno-delete-abstract-non-virtual-dtor -I../cpplib test.cpp -o testapp1.exe %1 %2 %3 %4 %5 %6 %7 %8 %9
del *.o
