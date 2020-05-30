echo off

set START_DIR=%CD%
cd ..
if not exist __build (call build_cpp.bat)
cd __build
echo on
call msbuild ALL_BUILD.vcxproj /p:Platform=x64 /p:Configuration=Debug /verbosity:quiet
echo off
cd %START_DIR%