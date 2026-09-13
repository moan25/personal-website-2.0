param([switch]$NoBrowser, [int]$Port = 5174)
$ErrorActionPreference = 'Stop'
$taskProject = Split-Path -Parent $PSScriptRoot
$taskUrl = "http://127.0.0.1:$Port/"
$taskNode = (Get-Command node -ErrorAction Stop).Source
Push-Location -LiteralPath $taskProject
try {
    $taskBuild = Join-Path $taskProject 'dist/index.html'
    $taskNeedsBuild = !(Test-Path -LiteralPath $taskBuild)
    if (!$taskNeedsBuild) {
        $taskBuiltAt = (Get-Item -LiteralPath $taskBuild).LastWriteTimeUtc
        $taskInputs = @(Get-ChildItem -LiteralPath 'src','public' -Recurse -File) + @(Get-Item -LiteralPath 'index.html','vite.config.js','package.json','package-lock.json')
        $taskNeedsBuild = [bool]($taskInputs | Where-Object {$_.LastWriteTimeUtc -gt $taskBuiltAt} | Select-Object -First 1)
    }
    if ($taskNeedsBuild) {
        $taskNpm = (Get-Command npm.cmd -ErrorAction Stop).Source
        if (!(Test-Path -LiteralPath 'node_modules')) { & $taskNpm ci; if($LASTEXITCODE -ne 0){throw 'Install failed.'} }
        & $taskNpm run build
        if($LASTEXITCODE -ne 0){throw 'Build failed.'}
    }
    $taskHealth = $null
    try {$taskHealth=Invoke-RestMethod ($taskUrl+'__portfolio/health') -TimeoutSec 2} catch {}
    if ($taskHealth -and $taskHealth.root -eq $taskProject -and $taskHealth.app -eq 'fieldnotes-portfolio-v2') {
        Write-Output $taskUrl
        if (!$NoBrowser){Start-Process $taskUrl}
        exit 0
    }
    $taskLogs = Join-Path $taskProject '.preview'
    New-Item -ItemType Directory -Force -Path $taskLogs | Out-Null
    $env:PORT = "$Port"
    $taskServer = Join-Path $PSScriptRoot 'serve.mjs'
    $taskProcess = Start-Process -FilePath $taskNode -ArgumentList ('"'+$taskServer+'"') -WorkingDirectory $taskProject -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $taskLogs 'server.log') -RedirectStandardError (Join-Path $taskLogs 'server-error.log')
    for($taskAttempt=0;$taskAttempt -lt 25;$taskAttempt++){
        try {$taskHealth=Invoke-RestMethod ($taskUrl+'__portfolio/health') -TimeoutSec 1} catch {}
        if($taskHealth -and $taskHealth.root -eq $taskProject){break}
        $taskProcess.Refresh()
        if($taskProcess.HasExited){throw "Server stopped. Port $Port may be occupied. See .preview/server-error.log."}
        Start-Sleep -Milliseconds 250
    }
    if(!$taskHealth -or $taskHealth.root -ne $taskProject){throw 'Server failed to start.'}
    Write-Output $taskUrl
    if(!$NoBrowser){Start-Process $taskUrl}
} finally {Pop-Location}
