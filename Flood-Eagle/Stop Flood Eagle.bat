@echo off
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080 " ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
echo Flood Eagle stopped.
timeout /t 2 >nul
