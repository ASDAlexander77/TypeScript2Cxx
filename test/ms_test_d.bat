IF EXIST "C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\Tools" call "C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\Tools\VsDevCmd.bat"
IF EXIST "C:\Program Files\Microsoft Visual Studio\2022\Professional\Common7\Tools" call "C:\Program Files\Microsoft Visual Studio\2022\Professional\Common7\Tools\VsDevCmd.bat"
cl /Zi /EHsc /std:c++20 /Fe:testapp1.exe /I ..\cpplib %1 %2 %3 %4 %5 %6 %7 %8 %9
del *.obj
