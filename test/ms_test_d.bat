IF EXIST "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\Common7\Tools" call "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\Common7\Tools\VsDevCmd.bat"
IF EXIST "C:\Program Files (x86)\Microsoft Visual Studio\2019\Preview\Common7\Tools" call "C:\Program Files (x86)\Microsoft Visual Studio\2019\Preview\Common7\Tools\VsDevCmd.bat"
cl /Zi /EHsc /std:c++latest /Fe:testapp1.exe /I ..\cpplib %1 %2 %3 %4 %5 %6 %7 %8 %9
del *.obj
