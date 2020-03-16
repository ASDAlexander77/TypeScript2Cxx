call "C:\Program Files (x86)\Microsoft Visual Studio\2019\Preview\Common7\Tools\VsDevCmd.bat"
cl /EHsc /std:c++latest /Fe:main.exe /I ..\Playground ..\Playground\core.cpp main.cpp
del *.obj
