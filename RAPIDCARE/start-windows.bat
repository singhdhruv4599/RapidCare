@echo off
echo ====================================
echo    RapidCare - Starting Application
echo ====================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found!
echo.

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Building application...
call npm run build
echo.

echo Starting RapidCare on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

call npx wrangler pages dev dist --port 3000

pause