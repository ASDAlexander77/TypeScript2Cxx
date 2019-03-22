md __build_win32_release
cd __build_win32_release
cmake -f .. -G "Visual Studio 15 2017" -DCMAKE_BUILD_TYPE=Release -Wno-dev
rem call "%VS150COMNTOOLS%VsDevCmd.bat" amd64_x86
call "%VS150COMNTOOLS%VsDevCmd.bat"
MSBuild ALL_BUILD.vcxproj /m:4 /p:Configuration=Release /p:Platform="Win32" /toolsversion:15.0