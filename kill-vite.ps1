$conn = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
foreach ($c in $conn) {
  $pid2 = $c.OwningProcess
  Write-Output "Killing PID $pid2"
  Stop-Process -Id $pid2 -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2
$still = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($still) {
  Write-Output "Port 5173 still in use:"
  $still | Format-Table LocalPort, State, OwningProcess
} else {
  Write-Output "Port 5173 is free."
}
