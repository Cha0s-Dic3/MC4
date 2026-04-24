param()

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\\backend'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\\web'; npm run dev"

Write-Host 'Started backend and frontend in separate PowerShell windows.'
