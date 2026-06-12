@echo off
:: Delegate execution to builder/build.bat
call "%~dp0\builder\build.bat" %*
