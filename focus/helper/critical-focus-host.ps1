# Critical Focus PC helper (Chrome native messaging host).
# Chrome sends one message; this moves the Claude app window and replies.
# Message: {"cmd":"place","screen":2,"side":"right","frac":0.38}   or   {"cmd":"ping"}
$ErrorActionPreference = 'Stop'
$stdin  = [Console]::OpenStandardInput()
$stdout = [Console]::OpenStandardOutput()

function Read-Msg {
    $lb = New-Object byte[] 4
    $n = 0; while ($n -lt 4) { $r = $stdin.Read($lb, $n, 4 - $n); if ($r -le 0) { return $null }; $n += $r }
    $len = [BitConverter]::ToInt32($lb, 0)
    if ($len -le 0 -or $len -gt 65536) { return $null }
    $buf = New-Object byte[] $len
    $off = 0; while ($off -lt $len) { $r = $stdin.Read($buf, $off, $len - $off); if ($r -le 0) { break }; $off += $r }
    return ([Text.Encoding]::UTF8.GetString($buf, 0, $off) | ConvertFrom-Json)
}
function Send-Msg($obj) {
    $b = [Text.Encoding]::UTF8.GetBytes(($obj | ConvertTo-Json -Compress))
    $stdout.Write([BitConverter]::GetBytes([int]$b.Length), 0, 4)
    $stdout.Write($b, 0, $b.Length)
    $stdout.Flush()
}

function Place($msg) {
    Add-Type -AssemblyName System.Windows.Forms
    if (-not ('CFWin' -as [type])) {
        Add-Type @"
using System; using System.Runtime.InteropServices;
public static class CFWin {
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int w, int hh, uint flags);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
  [DllImport("user32.dll")] public static extern IntPtr SetThreadDpiAwarenessContext(IntPtr ctx);
}
"@
    }
    try { $null = [CFWin]::SetThreadDpiAwarenessContext([IntPtr](-4)) } catch { }

    # Wait for the Claude app window (it may still be starting)
    $h = [IntPtr]::Zero
    $deadline = (Get-Date).AddSeconds(15)
    while ((Get-Date) -lt $deadline) {
        $p = Get-Process -Name 'claude' -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero } | Select-Object -First 1
        if ($p) { $h = $p.MainWindowHandle; break }
        Start-Sleep -Milliseconds 400
    }
    if ($h -eq [IntPtr]::Zero) { return @{ ok = $false; error = 'The Claude app window was not found' } }

    $screens = @([System.Windows.Forms.Screen]::AllScreens | Sort-Object { $_.Bounds.X }, { $_.Bounds.Y })
    $idx = $screens.Count - 1
    if ($null -ne $msg.screen -and "$($msg.screen)" -ne 'rightmost') { $idx = [Math]::Max(0, [Math]::Min([int]$msg.screen, $screens.Count - 1)) }
    $wa = $screens[$idx].WorkingArea
    $frac = 0.38; if ($msg.frac) { $frac = [double]$msg.frac }
    if ($msg.side -eq 'full') { $x = $wa.X; $w = $wa.Width }
    else { $w = [int][Math]::Round($wa.Width * $frac); $x = $wa.X + $wa.Width - $w }
    $null = [CFWin]::ShowWindow($h, 9)                       # restore if minimised or maximised
    $null = [CFWin]::SetWindowPos($h, [IntPtr]::Zero, $x, $wa.Y, $w, $wa.Height, 0x0044)   # SHOWWINDOW | NOZORDER
    return @{ ok = $true; screen = $idx; screens = $screens.Count; x = $x; w = $w }
}

try {
    $m = Read-Msg
    if ($null -eq $m) { exit 0 }
    switch ($m.cmd) {
        'ping'  { Send-Msg @{ ok = $true; helper = '1.0' } }
        'place' { Send-Msg (Place $m) }
        default { Send-Msg @{ ok = $false; error = 'unknown command' } }
    }
} catch {
    try { Send-Msg @{ ok = $false; error = "$($_.Exception.Message)" } } catch { }
}
