Remove-Item 'HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.critical.focus' -Force -ErrorAction SilentlyContinue
Remove-Item (Join-Path $env:LOCALAPPDATA 'CriticalFocus') -Recurse -Force -ErrorAction SilentlyContinue
Write-Host 'Critical Focus PC helper removed.' -ForegroundColor Green
