@echo off
set fld=%1
IF "%1" EQU "" GOTO :set
GOTO :start
:set
set fld=.\src
:start
echo Deleting files in %fld%
del /q %fld%\*.cpp
del /q %fld%\*.h
for /d %%x in (%fld%\*) do @call clean_src.bat %%x