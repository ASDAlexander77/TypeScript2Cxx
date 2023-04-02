md __build_win32_release
cd __build_win32_release
IF "%VS160COMNTOOLS%" EQU "" set VS150COMNTOOLS=C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\Tools\
call "%VS160COMNTOOLS%VsDevCmd.bat"
rem call "%VS150COMNTOOLS%VsDevCmd.bat" amd64_x86
cmake -f .. -G "Visual Studio 17 2022" -DCMAKE_BUILD_TYPE=Release -Wno-dev
MSBuild ALL_BUILD.vcxproj /m:4 /p:Configuration=Release /p:Platform="x64" /toolsversion:Current