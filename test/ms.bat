IF EXIST "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\Common7\Tools" call "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\Common7\Tools\VsDevCmd.bat"
IF EXIST "C:\Program Files (x86)\Microsoft Visual Studio\2019\Preview\Common7\Tools" call "C:\Program Files (x86)\Microsoft Visual Studio\2019\Preview\Common7\Tools\VsDevCmd.bat"
cl /EHsc /std:c++latest /O2 /Fe:test.exe /I ..\cpplib test.cpp
del *.obj
