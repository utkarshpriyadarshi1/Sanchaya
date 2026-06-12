@echo off
:: Delegate execution to builder/clean.bat
call "%~dp0\builder\clean.bat" %*
