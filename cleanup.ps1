# Kill all vite/node processes related to this project
$procs = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'"
foreach ($p in $procs) {
  if ($p.CommandLine -like '*kropkos*' -or $p.CommandLine -like '*vite*') {
    Write-Output ("Killing PID " + $p.ProcessId + " -- " + $p.CommandLine)
    Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
  }
}
Start-Sleep -Seconds 3

# Clear Vite cache
Write-Output "Removing node_modules\.vite"
if (Test-Path "node_modules\.vite") { Remove-Item -Recurse -Force "node_modules\.vite" }

# Clear dist
Write-Output "Removing dist"
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }

# Verify port 5173 is free
$still = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
if ($still) {
  Write-Output "Port 5173 STILL in use:"
  $still | Format-Table
} else {
  Write-Output "Port 5173 is free. Cleanup complete."
}
