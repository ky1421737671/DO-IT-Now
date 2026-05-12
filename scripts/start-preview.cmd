@echo off
setlocal
cd /d "%~dp0.."

set "APP_URL=http://127.0.0.1:5173/"

if not exist dist\index.html (
  call npm.cmd run build
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 '%APP_URL%'; if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { exit 0 } } catch {}; exit 1"

if errorlevel 1 (
  wscript.exe "%~dp0start-server-hidden.vbs"
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$url = '%APP_URL%'; for ($i = 0; $i -lt 20; $i += 1) { try { $r = Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 $url; if ($r.StatusCode -eq 200) { break } } catch {}; Start-Sleep -Milliseconds 500 }"

start "" "%APP_URL%"
endlocal
