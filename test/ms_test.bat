call "C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\Common7\Tools\VsDevCmd.bat"
if exist "test1.cpp" (
	cl /EHsc /std:c++latest /Fe:testapp1.exe /I ..\Playground ..\Playground\core.cpp test0.cpp test1.cpp
) else (
	cl /EHsc /std:c++latest /Fe:testapp1.exe /I ..\Playground ..\Playground\core.cpp test0.cpp
)

del *.obj
