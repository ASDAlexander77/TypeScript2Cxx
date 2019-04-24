@call clean_src.bat 
@call clean_src2.bat

cd C:\\Dev\\Gits\\Babylon.js\\src
@call node %~dp0/../__out/main.js

if not exist src (mkdir src)

@call xcopy /S C:\Dev\Gits\Babylon.js\src\*.cpp %~dp0\src
@call xcopy /S C:\Dev\Gits\Babylon.js\src\*.h %~dp0\src


