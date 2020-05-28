echo off

set START_DIR=%CD%

rem convert ts to cpp
cd src
node ..\..\..\__out\main.js -watch
