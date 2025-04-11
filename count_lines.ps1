$totalLines = 0
$blankLines = 0
$commentLines = 0

$files = Get-ChildItem -Path src -Recurse -Include *.ts,*.vue,*.js,*.css,*.html

foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $totalLines += $content.Count
    
    foreach ($line in $content) {
        if ($line -match '^\s*$') {
            $blankLines++
        }
        elseif ($line -match '^\s*(\/\/|\/\*|\*|\*\/)') {
            $commentLines++
        }
    }
}

Write-Output "Total files: $($files.Count)"
Write-Output "Total lines: $totalLines"
Write-Output "Blank lines: $blankLines"
Write-Output "Comment lines: $commentLines"
Write-Output "Effective code lines: $($totalLines - $blankLines - $commentLines)"
