@echo off
REM Backup script for Zella Trade Scribe
REM Run this from the project root directory

set BACKUP_DIR="%USERPROFILE%\Desktop\zella-trade-scribe-backups"
set PROJECT_DIR="%CD%"
set DATE_TIME=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set DATE_TIME=%DATE_TIME: =0%

echo Creating backup for Zella Trade Scribe...
echo Backup location: %BACKUP_DIR%\backup_%DATE_TIME%

REM Create backup directory if it doesn't exist
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

REM Create timestamped backup folder
mkdir "%BACKUP_DIR%\backup_%DATE_TIME%"

REM Copy all files except node_modules and other large folders
xcopy /E /I /H /Y "%PROJECT_DIR%" "%BACKUP_DIR%\backup_%DATE_TIME%" /EXCLUDE:backup_exclude.txt

echo Backup completed successfully!
echo Location: %BACKUP_DIR%\backup_%DATE_TIME%
pause
