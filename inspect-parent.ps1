$id = 22660
$p = Get-CimInstance Win32_Process -Filter ("ProcessId = " + $id) -ErrorAction SilentlyContinue
if ($p) {
  Write-Output ("PID=" + $p.ProcessId + " Name=" + $p.Name + " PPID=" + $p.ParentProcessId)
  Write-Output ("CMD=" + $p.CommandLine)
}
# Also walk up
$cur = 22660
for ($i = 0; $i -lt 6; $i++) {
  $proc = Get-CimInstance Win32_Process -Filter ("ProcessId = " + $cur) -ErrorAction SilentlyContinue
  if (-not $proc) { break }
  Write-Output ("[" + $i + "] PID=" + $proc.ProcessId + " Name=" + $proc.Name + " PPID=" + $proc.ParentProcessId)
  Write-Output ("    CMD=" + $proc.CommandLine)
  $cur = $proc.ParentProcessId
}
