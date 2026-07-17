@echo off
rem Add Node.js to PATH for this session
set "PATH=C:\Program Files\nodejs;%PATH%"
rem Run the dev script using npm (full path to npm.cmd to avoid PATH issues)
"C:\Program Files\nodejs\npm.cmd" run dev
