@echo off
setlocal

set START_DIR=%CD%
cd ..

if not exist __build (
    cmake -S . -B __build -A x64
)

cmake --build __build --config Debug

cd %START_DIR%
