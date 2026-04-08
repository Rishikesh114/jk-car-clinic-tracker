@echo off
echo Starting JK Car Clinic Server...

:: Start the Node server in a new background-like window
start "JK Car Clinic Server" cmd /k "node server.js"

:: Wait 2 seconds for the database to connect
timeout /t 2 /nobreak > NUL

:: Open the HTML dashboard in your default web browser
start http://localhost:3000