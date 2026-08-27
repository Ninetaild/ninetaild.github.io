@echo off
:: 배치파일이 있는 폴더 위치로 경로 고정
cd /d "%~dp0"

:: 관리자 권한 체크 및 자동으로 권한 승인 창(UAC) 호출
net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: 파이썬 스크립트 실행
echo [관리자 권한] 파이썬 스크립트를 실행합니다...
python ko.py

echo.
echo 작업이 완료되었습니다.
pause