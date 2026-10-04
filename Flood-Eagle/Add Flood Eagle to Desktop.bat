@echo off
title Flood Eagle - Add to Desktop
cd /d "%~dp0"

if not exist "%~dp0Flood Eagle.vbs" (
  echo Flood Eagle.vbs was not found. Run this from the extracted Flood Eagle folder.
  pause
  exit /b 1
)

echo Removing Windows security prompts for this folder...
powershell -NoProfile -Command "Get-ChildItem -LiteralPath '%~dp0' -Recurse -File -Force -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' } | Unblock-File"

echo Removing the old desktop icon...
del "%USERPROFILE%\Desktop\Flood Eagle.lnk" >nul 2>&1
powershell -NoProfile -Command "Remove-Item -LiteralPath ([Environment]::GetFolderPath('Desktop') + '\Flood Eagle.lnk') -ErrorAction SilentlyContinue"

echo Creating a "Flood Eagle" icon on your desktop...
powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $lnk = $ws.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\Flood Eagle.lnk'); $lnk.TargetPath = 'wscript.exe'; $lnk.Arguments = '\"%~dp0Flood Eagle.vbs\"'; $lnk.WorkingDirectory = '%~dp0'; $lnk.IconLocation = '%~dp0flood-eagle.ico, 0'; $lnk.Description = 'Flood Eagle - Flood Monitoring'; $lnk.Save()"

echo.
echo Done! Double-click the Flood Eagle icon on your desktop.
echo It opens the browser directly - no black window, no warning.
echo To stop the app later, run "Stop Flood Eagle.bat" in this folder.
echo Keep this folder where it is.
pause
