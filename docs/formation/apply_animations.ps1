# Ajoute des animations d'entree sur les slides des presentations CARZONE.
# A executer apres generate_pptx.py, depuis le dossier docs/formation.
# Prerequis : Microsoft PowerPoint installe sur le poste Windows.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$files = Get-ChildItem (Join-Path $root "presentations") -Recurse -Filter *.pptx
$processed = 0
$failed = 0
$effects = 0

$powerPoint = New-Object -ComObject PowerPoint.Application
try {
    foreach ($file in $files) {
        try {
            $presentation = $powerPoint.Presentations.Open($file.FullName, $false, $false, $false)
            foreach ($slide in $presentation.Slides) {
                $added = 0
                foreach ($shape in $slide.Shapes) {
                    if ($added -ge 5) { break }
                    if ($shape.Type -ne 17 -and $shape.Type -ne 13) { continue }
                    if ($shape.Top -gt 870 -or $shape.Width -lt 80 -or $shape.Height -lt 20) { continue }
                    try {
                        $effect = $slide.TimeLine.MainSequence.AddEffect($shape, 10, 0, 1)
                        try { $effect.Timing.Duration = 0.45 } catch {}
                        $added++
                        $effects++
                    } catch {}
                }
            }
            $presentation.Save()
            $presentation.Close()
            $processed++
            Write-Output "animated $($file.Name)"
        } catch {
            Write-Output "FAIL $($file.FullName): $($_.Exception.Message)"
            $failed++
        }
    }
} finally {
    $powerPoint.Quit()
}

Write-Output "decks=$processed failed=$failed effects=$effects files=$($files.Count)"
