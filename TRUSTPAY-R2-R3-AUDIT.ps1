[CmdletBinding()]
param(
    [string]$ExpectedBranch = $env:AUDIT_EXPECTED_BRANCH,
    [switch]$SkipE2E,
    [switch]$RequireCloudVerification
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$workspace = if ($env:GITHUB_WORKSPACE) { $env:GITHUB_WORKSPACE } else { (Get-Location).Path }
Set-Location $workspace

$results = [System.Collections.Generic.List[object]]::new()
$started = Get-Date

function Add-Result {
    param(
        [string]$Name,
        [int]$ExitCode,
        [double]$Seconds,
        [string]$Status
    )
    $results.Add([pscustomobject]@{
        name = $Name
        status = $Status
        exit_code = $ExitCode
        duration_seconds = [math]::Round($Seconds, 1)
    })
}

function Invoke-Step {
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][scriptblock]$Action
    )

    Write-Host ""
    Write-Host "============================================================"
    Write-Host "TRUSTPAY AUDIT: $Name"
    Write-Host "============================================================"

    $stepStart = Get-Date
    try {
        & $Action
        $code = if ($null -ne $LASTEXITCODE) { [int]$LASTEXITCODE } else { 0 }
        $elapsed = ((Get-Date) - $stepStart).TotalSeconds
        if ($code -ne 0) {
            Add-Result $Name $code $elapsed 'FAILED'
            throw "Step '$Name' failed with exit code $code."
        }
        Add-Result $Name 0 $elapsed 'PASSED'
    }
    catch {
        $elapsed = ((Get-Date) - $stepStart).TotalSeconds
        if (-not ($results | Where-Object { $_.name -eq $Name })) {
            Add-Result $Name 1 $elapsed 'FAILED'
        }
        throw
    }
}

function Assert-NpmScript {
    param([string]$ScriptName)
    if (-not (Test-Path 'package.json')) {
        throw 'package.json was not found at the repository root.'
    }
    $package = Get-Content 'package.json' -Raw | ConvertFrom-Json
    $scripts = @($package.scripts.PSObject.Properties.Name)
    if ($scripts -notcontains $ScriptName) {
        throw "Required npm script '$ScriptName' is missing from package.json. Do not silently substitute another command."
    }
}

function Invoke-NpmScript {
    param([string]$ScriptName)
    Assert-NpmScript $ScriptName
    & npm run $ScriptName
}

Write-Host "TrustPay R2/R3 automated audit"
Write-Host "Workspace : $workspace"
Write-Host "Git SHA   : $($env:GITHUB_SHA)"
Write-Host "Git ref   : $($env:GITHUB_REF_NAME)"

if ($ExpectedBranch) {
    $actualBranch = $env:GITHUB_REF_NAME
    if (-not $actualBranch) {
        $actualBranch = ''
    }
    if ($actualBranch -ne $ExpectedBranch) {
        throw "Expected branch '$ExpectedBranch' but Actions reports '$actualBranch'. Stop rather than validating the wrong release line."
    }
}

Invoke-Step -Name 'Repository integrity' -Action {
    if (-not (Test-Path 'package.json')) { throw 'package.json missing.' }
    if (-not (Test-Path 'package-lock.json')) { throw 'package-lock.json missing.' }
    if (-not (Test-Path '.github/workflows')) { throw '.github/workflows is missing.' }
}

Invoke-Step -Name 'Dependency install' -Action {
    & npm install --no-audit --no-fund
}

foreach ($script in @('typecheck','lint','unit','integration','security','build')) {
    Invoke-Step -Name "npm run $script" -Action { Invoke-NpmScript $script }
}

Invoke-Step -Name 'Playwright browser installation' -Action {
    & npx playwright install --with-deps chromium
}

if (-not $SkipE2E) {
    Invoke-Step -Name 'npm run e2e' -Action { Invoke-NpmScript 'e2e' }
}

$cloudSql = Join-Path $workspace 'artifacts/R2_DATABASE_VERIFICATION.sql'
$cloudOutput = Join-Path $workspace 'audit-output/r2-database-verification.json'
New-Item -ItemType Directory -Force -Path (Split-Path $cloudOutput) | Out-Null

$hasDbSecret = -not [string]::IsNullOrWhiteSpace($env:SUPABASE_DB_URL)
if ($hasDbSecret) {
    Invoke-Step -Name 'Supabase R2 read-only verification' -Action {
        if (-not (Test-Path $cloudSql)) {
            throw "Cloud verification requested but '$cloudSql' is missing. Add the verified R2 SQL artifact before enabling this gate."
        }
        if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
            throw 'psql is not available on the GitHub runner.'
        }
        & psql $env:SUPABASE_DB_URL -v ON_ERROR_STOP=1 -f $cloudSql -o $cloudOutput
    }
}
elseif ($RequireCloudVerification) {
    throw 'SUPABASE_DB_URL is required for this audit but is not configured as a GitHub Actions secret.'
}
else {
    Add-Result 'Supabase R2 read-only verification' 0 0 'NOT_RUN'
    Write-Warning 'Cloud verification was not run because SUPABASE_DB_URL is not configured.'
}

$finished = Get-Date
$totalSeconds = ($finished - $started).TotalSeconds
$summary = [pscustomobject]@{
    audit = 'TrustPay R2/R3 automated audit'
    timestamp_utc = (Get-Date).ToUniversalTime().ToString('o')
    git_sha = $env:GITHUB_SHA
    git_ref = $env:GITHUB_REF_NAME
    results = $results
    total_duration_seconds = [math]::Round($totalSeconds, 1)
}

$summaryPath = Join-Path $workspace 'audit-output/trustpay-audit-summary.json'
$summary | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 $summaryPath

if ($env:GITHUB_STEP_SUMMARY) {
    $md = @()
    $md += '# TrustPay automated audit'
    $md += ''
    $md += ('- Commit: `{0}`' -f $env:GITHUB_SHA)
    $md += ('- Ref: `{0}`' -f $env:GITHUB_REF_NAME)
    $md += "- Duration: $([math]::Round($totalSeconds,1)) seconds"
    $md += ''
    $md += '| Check | Result | Exit | Seconds |'
    $md += '|---|---|---:|---:|'
    foreach ($r in $results) {
        $md += "| $($r.name) | $($r.status) | $($r.exit_code) | $($r.duration_seconds) |"
    }
    $md -join "`n" | Add-Content -Encoding UTF8 $env:GITHUB_STEP_SUMMARY
}

$failed = @($results | Where-Object { $_.status -eq 'FAILED' })
if ($failed.Count -gt 0) {
    throw "TrustPay automated audit failed in $($failed.Count) check(s)."
}

Write-Host ""
Write-Host 'TRUSTPAY AUTOMATED AUDIT PASSED.'
