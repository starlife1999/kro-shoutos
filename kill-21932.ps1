Stop-Process -Id 21932 -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
$still = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
if ($still) {
  Write-Output "Still listening:"
  $still | Format-Table
} else {
  Write-Output "Port 5173 is free."
}
