$c = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
foreach ($x in $c) {
  $proc = Get-CimInstance Win32_Process -Filter ("ProcessId = " + $x.OwningProcess) -ErrorAction SilentlyContinue
  Write-Output ("LocalAddress=" + $x.LocalAddress + " OwningPID=" + $x.OwningProcess)
  if ($proc) {
    Write-Output ("  Name=" + $proc.Name + " PPID=" + $proc.ParentProcessId)
    Write-Output ("  CMD=" + $proc.CommandLine)
  } else {
    Write-Output "  (process not found in CIM)"
  }
}
