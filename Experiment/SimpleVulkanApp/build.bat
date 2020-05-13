echo off

set START_DIR=%CD%

rem convert ts to cpp
cd src
node ..\..\..\__out\main.js      
cd %START_DIR%

call build_cpp.bat