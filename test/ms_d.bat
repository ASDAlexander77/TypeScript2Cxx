IF EXIST "C:\Program Files\Microsoft Visual Studio\18\Professional\Common7\Tools" call "C:\Program Files\Microsoft Visual Studio\18\Professional\Common7\Tools\VsDevCmd.bat"
cl /Zi /EHsc /std:c++20 /Fe:test.exe /I ..\cpplib test.cpp
del *.obj
