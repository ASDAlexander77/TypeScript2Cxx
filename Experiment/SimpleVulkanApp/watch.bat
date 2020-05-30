echo off

cd src
node ..\..\..\__out\main.js -watch -run_on_compile ..\watch_build_cpp.bat
