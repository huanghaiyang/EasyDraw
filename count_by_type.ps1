$fileTypes = @{
    "TypeScript" = @{Extension = "*.ts"; Files = 0; Lines = 0; Blank = 0; Comment = 0; Effective = 0}
    "Vue" = @{Extension = "*.vue"; Files = 0; Lines = 0; Blank = 0; Comment = 0; Effective = 0}
    "JavaScript" = @{Extension = "*.js"; Files = 0; Lines = 0; Blank = 0; Comment = 0; Effective = 0}
    "CSS" = @{Extension = "*.css"; Files = 0; Lines = 0; Blank = 0; Comment = 0; Effective = 0}
    "HTML" = @{Extension = "*.html"; Files = 0; Lines = 0; Blank = 0; Comment = 0; Effective = 0}
}

foreach ($type in $fileTypes.Keys) {
    $extension = $fileTypes[$type].Extension
    $files = Get-ChildItem -Path src -Recurse -Include $extension
    $fileTypes[$type].Files = $files.Count
    
    foreach ($file in $files) {
        $content = Get-Content $file.FullName
        $fileTypes[$type].Lines += $content.Count
        
        foreach ($line in $content) {
            if ($line -match '^\s*$') {
                $fileTypes[$type].Blank++
            }
            elseif ($line -match '^\s*(\/\/|\/\*|\*|\*\/)') {
                $fileTypes[$type].Comment++
            }
        }
    }
    
    $fileTypes[$type].Effective = $fileTypes[$type].Lines - $fileTypes[$type].Blank - $fileTypes[$type].Comment
}

Write-Output "Code Statistics by File Type:"
Write-Output "============================"

foreach ($type in $fileTypes.Keys) {
    Write-Output "`n$type Files:"
    Write-Output "  Files: $($fileTypes[$type].Files)"
    Write-Output "  Total Lines: $($fileTypes[$type].Lines)"
    Write-Output "  Blank Lines: $($fileTypes[$type].Blank)"
    Write-Output "  Comment Lines: $($fileTypes[$type].Comment)"
    Write-Output "  Effective Code Lines: $($fileTypes[$type].Effective)"
}

$totalFiles = 0
$totalLines = 0
$totalBlank = 0
$totalComment = 0
$totalEffective = 0

foreach ($type in $fileTypes.Keys) {
    $totalFiles += $fileTypes[$type].Files
    $totalLines += $fileTypes[$type].Lines
    $totalBlank += $fileTypes[$type].Blank
    $totalComment += $fileTypes[$type].Comment
    $totalEffective += $fileTypes[$type].Effective
}

Write-Output "`nSummary:"
Write-Output "========"
Write-Output "Total Files: $totalFiles"
Write-Output "Total Lines: $totalLines"
Write-Output "Total Blank Lines: $totalBlank"
Write-Output "Total Comment Lines: $totalComment"
Write-Output "Total Effective Code Lines: $totalEffective"
