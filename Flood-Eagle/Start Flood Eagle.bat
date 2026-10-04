@echo off
setlocal
cd /d "%~dp0"
title Flood Eagle

REM If Flood Eagle is already running, open it immediately.
powershell -NoProfile -Command "$r=try { Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8080' -TimeoutSec 1 } catch {$null}; if($r){ Start-Process 'http://localhost:8080'; exit 0 }"

REM First start only: install dependencies.
if not exist "node_modules" (
  echo First start only: installing Flood Eagle files...
  call npm install --no-audit --no-fund --prefer-offline
  if errorlevel 1 (
    echo Installation failed. Please check your Node.js/npm installation.
    pause
    exit /b 1
  )
)

echo Starting Flood Eagle...
start "Flood Eagle Server" /min cmd /c "cd /d ""%~dp0"" && node node_modules\vite\bin\vite.js --host 127.0.0.1 --port 8080"

REM Wait for the server, then open the browser.
powershell -NoProfile -Command "$ok=$false; for($i=0;$i -lt 150;$i++){ try { $r=Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8080' -TimeoutSec 1; if($r.StatusCode -ge 200){$ok=$true;break} } catch {}; Start-Sleep -Milliseconds 100 }; Start-Process 'http://localhost:8080'"
endlocal
