IF EXIST "C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\Tools" call "C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\Tools\VsDevCmd.bat"
IF EXIST "C:\Program Files\Microsoft Visual Studio\2022\Professional\Common7\Tools" call "C:\Program Files\Microsoft Visual Studio\2022\Professional\Common7\Tools\VsDevCmd.bat"
cl /Zi /EHsc /std:c++20 /Fe:test.exe /I ..\cpplib test.cpp
del *.obj
