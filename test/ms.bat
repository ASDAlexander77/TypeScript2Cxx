call "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\Common7\Tools\VsDevCmd.bat"
cl /EHsc /std:c++latest /Fe:test.exe /I ..\Playground ..\Playground\core.cpp test.cpp
del *.obj
