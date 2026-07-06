param(
    [Parameter(Mandatory=$true)][string]$PackagePath,
    [Parameter(Mandatory=$true)][ValidateSet("generator","critic")][string]$Stage,
    [string]$ExampleMapping = "phase1example\lo_mapping.json",
    [switch]$AllowNonAscii
)

$script:failed = $false
$results = New-Object System.Collections.ArrayList

function Check($name, $ok, $detail) {
    $status = "PASS"
    if (-not $ok) { $status = "FAIL"; $script:failed = $true }
    [void]$results.Add([pscustomobject]@{ check = $name; status = $status; detail = $detail })
}

$loPath = Join-Path $PackagePath "lo_mapping.json"
$vaPath = Join-Path $PackagePath "verified_answer.txt"
Check "lo_mapping.json exists" (Test-Path $loPath) $loPath
Check "verified_answer.txt exists" (Test-Path $vaPath) $vaPath
if (-not (Test-Path $loPath)) { $results | Format-Table -AutoSize; exit 2 }

$lo = $null
try { $lo = Get-Content $loPath -Raw -Encoding UTF8 | ConvertFrom-Json } catch {}
Check "lo_mapping.json parses" ($null -ne $lo) ""
if ($null -eq $lo) { $results | Format-Table -AutoSize; exit 2 }

$noPrimary = ($lo.no_primary_available -eq $true)
$primaryPath = Join-Path $PackagePath "primary.md"
Check "primary.md exists (or no_primary_available)" ((Test-Path $primaryPath) -or $noPrimary) ""

$supporting = @(Get-ChildItem -Path $PackagePath -Filter "supporting_*.md" -ErrorAction SilentlyContinue)
Check "supporting extract present (or no coverage)" (($supporting.Count -ge 1) -or $noPrimary) "$($supporting.Count) found"

$ex = Get-Content $ExampleMapping -Raw -Encoding UTF8 | ConvertFrom-Json
$exKeys = ($ex.PSObject.Properties.Name | Sort-Object) -join ","
$loKeys = ($lo.PSObject.Properties.Name | Sort-Object) -join ","
Check "top-level keys match example" ($exKeys -eq $loKeys) "got [$loKeys]"

$exSecKeys = ($ex.sections[0].PSObject.Properties.Name | Sort-Object) -join ","
$secOk = $true; $secDetail = ""
foreach ($s in @($lo.sections)) {
    $k = ($s.PSObject.Properties.Name | Sort-Object) -join ","
    if ($k -ne $exSecKeys) { $secOk = $false; $secDetail = "got [$k]" }
}
if (@($lo.sections).Count -eq 0) { $secOk = $noPrimary }
Check "section entry keys match example" $secOk $secDetail

$primaryCount = @($lo.sections | Where-Object { $_.role -eq "PRIMARY" }).Count
Check "exactly one PRIMARY (zero only if no_primary_available)" (($primaryCount -eq 1) -or ($noPrimary -and $primaryCount -eq 0)) "$primaryCount PRIMARY"
$supRoleCount = @($lo.sections | Where-Object { $_.role -eq "SUPPORTING" }).Count
Check "supporting files match SUPPORTING roles" ($supporting.Count -eq $supRoleCount) "files=$($supporting.Count) roles=$supRoleCount"

Check "books_searched non-empty" (@($lo.books_searched).Count -ge 1) ""

if ($Stage -eq "generator") {
    Check "critique_status pending" ($lo.critique_status -eq "pending") "$($lo.critique_status)"
    Check "critique_score null" ($null -eq $lo.critique_score) ""
    Check "critique_findings empty" (@($lo.critique_findings).Count -eq 0) ""
    Check "assessments blank" (($lo.primary_assessment -eq "") -and ($lo.supporting_assessment -eq "") -and ($lo.multipart_assessment -eq "")) ""
    Check "recommended_changes empty" (@($lo.recommended_changes).Count -eq 0) ""
    Check "search_reasonable null" ($null -eq $lo.search_reasonable) ""
} else {
    Check "critique_status completed" ($lo.critique_status -eq "completed") "$($lo.critique_status)"
    Check "critique_score is a number" (($lo.critique_score -is [int]) -or ($lo.critique_score -is [int64]) -or ($lo.critique_score -is [double]) -or ($lo.critique_score -is [decimal])) ""
    Check "at least one critique finding" (@($lo.critique_findings).Count -ge 1) ""
    Check "assessments filled" (($lo.primary_assessment -ne "") -and ($lo.supporting_assessment -ne "") -and ($lo.multipart_assessment -ne "")) ""
    Check "search_reasonable is boolean" ($lo.search_reasonable -is [bool]) ""
    if (($lo.mapping_confidence -eq "LOW") -or $noPrimary) {
        Check "missing_concepts non-empty on weak mapping" (@($lo.missing_concepts).Count -ge 1) ""
    }
}

$allAnchors = New-Object System.Collections.ArrayList
$extractFiles = @()
if (Test-Path $primaryPath) { $extractFiles += Get-Item $primaryPath }
$extractFiles += $supporting
foreach ($f in $extractFiles) {
    $text = Get-Content $f.FullName -Raw -Encoding UTF8
    $hasMeta = ($text -match '\*\*OER:\*\*') -and ($text -match '\*\*Source:\*\*') -and ($text -match '\*\*License:\*\*') -and ($text -match '\*\*Attribution required:\*\*')
    Check "$($f.Name) has metadata header" $hasMeta ""
    $anchors = [regex]::Matches($text, '\{#[A-Za-z0-9_.-]+\}') | ForEach-Object { $_.Value }
    Check "$($f.Name) has at least one anchor" (@($anchors).Count -ge 1) ""
    foreach ($a in $anchors) { [void]$allAnchors.Add($a) }
}
$dupes = @($allAnchors | Group-Object | Where-Object { $_.Count -gt 1 })
Check "anchors unique across package" ($dupes.Count -eq 0) (($dupes | ForEach-Object { $_.Name }) -join " ")

if (Test-Path $vaPath) {
    $va = Get-Content $vaPath -Raw -Encoding UTF8
    Check "verified_answer.txt non-empty" ($va.Trim().Length -gt 0) ""
}

if (-not $AllowNonAscii) {
    foreach ($f in @(Get-ChildItem -Path $PackagePath -File)) {
        $text = Get-Content $f.FullName -Raw -Encoding UTF8
        Check "$($f.Name) ASCII only" (-not [regex]::IsMatch($text, '[^\x00-\x7F]')) ""
    }
}

$results | Format-Table -AutoSize
if ($script:failed) { exit 2 } else { exit 0 }
