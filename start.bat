@echo off
title SahaayaMind Local Server (SIH 2026)
echo ================================================================
echo 🧠 SahaayaMind - AI Cognitive Wellness Platform
echo Starting Local Server on http://localhost:3000...
echo ================================================================
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/"
node server.js
pause
