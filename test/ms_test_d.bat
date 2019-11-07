call "C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\Common7\Tools\VsDevCmd.bat"
cl /Zi /EHsc /std:c++latest /Fe:testapp1.exe /I ..\Playground ..\Playground\core.cpp %1 %2 %3 %4 %5 %6 %7 %8 %9
del *.obj
