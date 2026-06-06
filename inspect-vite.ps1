$procs = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'"
foreach ($p in $procs) {
  if ($p.CommandLine -like '*vite*' -or $p.CommandLine -like '*kropkos*') {
    Write-Output ("PID=" + $p.ProcessId + " PPID=" + $p.ParentProcessId + " CMD=" + $p.CommandLine)
  }
}
