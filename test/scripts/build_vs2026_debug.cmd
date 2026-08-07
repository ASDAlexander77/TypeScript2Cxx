md __build_win32_debug
cd __build_win32_debug
IF "%VS160COMNTOOLS%" EQU "" set VS160COMNTOOLS=C:\Program Files\Microsoft Visual Studio\18\Professional\Common7\Tools\
call "%VS160COMNTOOLS%VsDevCmd.bat"
rem call "%VS150COMNTOOLS%VsDevCmd.bat" amd64_x86
cmake -f .. -G "Visual Studio 18 2026" -DCMAKE_BUILD_TYPE=Debug -Wno-dev
MSBuild ALL_BUILD.vcxproj /m:8 /p:Configuration=Debug /p:Platform="x64" /toolsversion:Current