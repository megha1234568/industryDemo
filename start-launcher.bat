@echo off
title Rockwell ACE – File Launcher Server
color 0A
echo.
echo  =========================================
echo   Rockwell ACE  ^|  File Launcher Server
echo  =========================================
echo.
echo  Starting server on port 9988...
echo  Keep this window OPEN while using the dashboard.
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  ERROR: Node.js is not installed or not in PATH.
    echo  Download from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Run the launcher server from the same folder as this .bat file
cd /d "%~dp0"
node launcher-server.js

:: If server exits, pause so the window doesn't close
echo.
echo  Server stopped. Press any key to exit.
pause >nul
