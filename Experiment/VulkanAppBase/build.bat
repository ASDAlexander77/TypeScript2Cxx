echo off

set START_DIR=%CD%

:: Specify UTF-8 for character encoding
rem chcp 65001

:: Check that cmake is configured
where cmake.exe > nul 2>&1
if not %errorlevel% equ 0 (
    echo ERROR: CMake was not found. Please install CMake or put cmake.exe in your PATH.
    exit /b 1
)

where msbuild.exe > nul 2>&1
if not %errorlevel% equ 0 (
    echo ERROR: MSBuild was not found. Please use a visual studio developer console, or put MSBuild.exe in your PATH.
    exit /b 1
)

:: Get the version of msbuild
set cmd="msbuild /version | findstr /rxc:"[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*""
for /f "tokens=1* delims=." %%i in ('%cmd%') do set msbuild_version=%%i
if %msbuild_version% lss 16 (
    echo ERROR: MSBuild must be at least version 16 ^(Visual Studio 2019^). Found version %msbuild_version%.
    exit /b 1
)
set version_string=Visual Studio %msbuild_version%

:: Build
md __build
cd __build
cmake -G "%version_string%" -A x64 ..
call msbuild ALL_BUILD.vcxproj /p:Platform=x64 /p:Configuration=Debug /verbosity:quiet
rem call msbuild ALL_BUILD.vcxproj /p:Platform=x64 /p:Configuration=Release /verbosity:quiet

cd %START_DIR%
