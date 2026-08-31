@echo off
setlocal

set START_DIR=%CD%

:: 1) Convert TypeScript sources to C++
cd src
node ..\..\..\__out\main.js
if errorlevel 1 (
    echo ERROR: TypeScript to C++ compilation failed.
    cd %START_DIR%
    exit /b 1
)
cd %START_DIR%

:: 2) Check that CMake is available
where cmake.exe > nul 2>&1
if not %errorlevel% equ 0 (
    echo ERROR: CMake was not found. Please install CMake or put cmake.exe in your PATH.
    exit /b 1
)

:: 3) Configure (CMake picks the newest installed Visual Studio generator automatically)
cmake -S . -B __build -A x64
if not %errorlevel% equ 0 (
    cd %START_DIR%
    exit /b 1
)

:: 4) Build
cmake --build __build --config Debug
if not %errorlevel% equ 0 (
    cd %START_DIR%
    exit /b 1
)

cd %START_DIR%
