# Installs the Critical Focus PC helper so the extension can move the Claude app (no admin needed)
$ErrorActionPreference = 'Stop'
$src  = Split-Path -Parent $MyInvocation.MyCommand.Path
$dest = Join-Path $env:LOCALAPPDATA 'CriticalFocus'
New-Item -ItemType Directory -Force -Path $dest | Out-Null
foreach ($f in 'critical-focus-host.ps1', 'critical-focus-host.bat') {
    Copy-Item (Join-Path $src $f) $dest -Force
    Unblock-File (Join-Path $dest $f) -ErrorAction SilentlyContinue
}
$manifest = [ordered]@{
    name            = 'com.critical.focus'
    description     = 'Critical Focus PC helper: puts the Claude app on your study screen'
    path            = (Join-Path $dest 'critical-focus-host.bat')
    type            = 'stdio'
    allowed_origins = @('chrome-extension://dofdocaillphcjghjdjodhippjldkibo/')
}
$mp = Join-Path $dest 'com.critical.focus.json'
[IO.File]::WriteAllText($mp, ($manifest | ConvertTo-Json), (New-Object Text.UTF8Encoding $false))
New-Item -Path 'HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.critical.focus' -Value $mp -Force | Out-Null
Write-Host ''
Write-Host 'Done! The Critical Focus PC helper is installed.' -ForegroundColor Green
Write-Host 'Restart Chrome, then press Open Critical: the Claude app moves to your study screen.'
