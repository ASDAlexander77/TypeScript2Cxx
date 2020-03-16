IF "%VS150COMNTOOLS%" EQU "" IF EXIST "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\Common7\Tools" call "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\Common7\Tools\VsDevCmd.bat"
IF "%VS150COMNTOOLS%" EQU "" IF EXIST "C:\Program Files (x86)\Microsoft Visual Studio\2019\Preview\Common7\Tools" call "C:\Program Files (x86)\Microsoft Visual Studio\2019\Preview\Common7\Tools\VsDevCmd.bat"
cl /EHsc /std:c++latest /Fe:main.exe /I ..\Playground ..\Playground\core.cpp main.cpp
del *.obj
