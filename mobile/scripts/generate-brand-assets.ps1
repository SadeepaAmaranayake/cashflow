Add-Type -AssemblyName System.Drawing

$assetDirectory = [System.IO.Path]::GetFullPath(
    (Join-Path $PSScriptRoot "..\assets\images")
)

$blue = [System.Drawing.ColorTranslator]::FromHtml("#208AEF")
$white = [System.Drawing.Color]::White
$transparent = [System.Drawing.Color]::Transparent

function Draw-CampusCashMark {
    param(
        [System.Drawing.Graphics]$Graphics,
        [System.Drawing.Color]$Color
    )

    $Graphics.SmoothingMode =
        [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $Graphics.PixelOffsetMode =
        [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $pen = [System.Drawing.Pen]::new($Color, 126)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    $arrowBrush = [System.Drawing.SolidBrush]::new($Color)

    try {
        $orbit = [System.Drawing.RectangleF]::new(
            205,
            205,
            614,
            614
        )

        # Upper flow arrow: left side, across the top, pointing right.
        $Graphics.DrawArc($pen, $orbit, 195, 150)
        $upperArrow = [System.Drawing.PointF[]]@(
            [System.Drawing.PointF]::new(880, 430),
            [System.Drawing.PointF]::new(724, 322),
            [System.Drawing.PointF]::new(735, 526)
        )
        $Graphics.FillPolygon($arrowBrush, $upperArrow)

        # Lower flow arrow: right side, across the bottom, pointing left.
        $Graphics.DrawArc($pen, $orbit, 15, 150)
        $lowerArrow = [System.Drawing.PointF[]]@(
            [System.Drawing.PointF]::new(144, 594),
            [System.Drawing.PointF]::new(300, 498),
            [System.Drawing.PointF]::new(286, 702)
        )
        $Graphics.FillPolygon($arrowBrush, $lowerArrow)

        # The center dot represents a coin moving through the cash-flow cycle.
        $Graphics.FillEllipse($arrowBrush, 424, 424, 176, 176)
    }
    finally {
        $pen.Dispose()
        $arrowBrush.Dispose()
    }
}

function Write-CampusCashAsset {
    param(
        [string]$FileName,
        [int]$Size,
        [bool]$HasBlueBackground
    )

    $bitmap = [System.Drawing.Bitmap]::new(
        $Size,
        $Size,
        [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    )
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    try {
        $graphics.Clear(
            $(if ($HasBlueBackground) { $blue } else { $transparent })
        )

        $scale = $Size / 1024.0
        $graphics.ScaleTransform($scale, $scale)
        Draw-CampusCashMark -Graphics $graphics -Color $white

        $outputPath = Join-Path $assetDirectory $FileName
        $bitmap.Save(
            $outputPath,
            [System.Drawing.Imaging.ImageFormat]::Png
        )
    }
    finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

Write-CampusCashAsset -FileName "icon.png" `
    -Size 1024 -HasBlueBackground $true
Write-CampusCashAsset -FileName "splash-icon.png" `
    -Size 1024 -HasBlueBackground $false
Write-CampusCashAsset -FileName "android-icon-foreground.png" `
    -Size 1024 -HasBlueBackground $false
Write-CampusCashAsset -FileName "android-icon-monochrome.png" `
    -Size 1024 -HasBlueBackground $false
Write-CampusCashAsset -FileName "favicon.png" `
    -Size 512 -HasBlueBackground $true

Write-Output "CampusCash brand assets generated in $assetDirectory"
