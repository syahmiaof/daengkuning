$file = 'dashboard-admin.html'
$lines = [System.IO.File]::ReadAllLines((Resolve-Path $file), [System.Text.Encoding]::UTF8)
$result = [System.Collections.Generic.List[string]]::new()

$inOldStyle = $false
$styleReplaced = $false

$newStyleLines = @(
'    <style>',
'        ::-webkit-scrollbar { width: 8px; height: 8px; }',
'        ::-webkit-scrollbar-track { background: #111111; }',
'        ::-webkit-scrollbar-thumb { background: #333333; border-radius: 4px; }',
'        ::-webkit-scrollbar-thumb:hover { background: #D4AF37; }',
'',
'        .glass-panel {',
'            background: rgba(0, 0, 0, 0.4);',
'            backdrop-filter: blur(12px);',
'            border: 1px solid rgba(212, 175, 55, 0.2);',
'            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);',
'            animation: borderGlow 3s ease-in-out infinite;',
'        }',
'',
'        /* PARTICLE CANVAS - must be fixed so it does not affect layout */',
'        #particle-canvas {',
'            position: fixed; top: 0; left: 0;',
'            width: 100%; height: 100%;',
'            pointer-events: none; z-index: 0; opacity: 0.4;',
'        }',
'',
'        /* Ensure all main content is above particles */',
'        aside, main, header, .glass-panel, button, canvas:not(#particle-canvas) {',
'            position: relative; z-index: 1;',
'        }',
'',
'        /* PULSING GOLD GLOW BORDERS */',
'        @keyframes borderGlow {',
'            0%,100% { box-shadow: 0 0 8px rgba(212,175,55,0.1), 0 4px 30px rgba(0,0,0,0.5); border-color: rgba(212,175,55,0.2); }',
'            50%      { box-shadow: 0 0 28px rgba(212,175,55,0.55), 0 4px 30px rgba(0,0,0,0.5); border-color: rgba(212,175,55,0.7); }',
'        }',
'',
'        /* SHIMMER SWEEP */',
'        @keyframes shimmerMove {',
'            0%   { transform: translateX(-150%) skewX(-20deg); }',
'            100% { transform: translateX(350%) skewX(-20deg); }',
'        }',
'        .stat-shimmer { position: relative; overflow: hidden; }',
'        .stat-shimmer::after {',
'            content: ""; position: absolute; top: 0; left: 0;',
'            width: 40%; height: 100%;',
'            background: linear-gradient(90deg, transparent, rgba(212,175,55,0.07), transparent);',
'            animation: shimmerMove 2.8s ease-in-out infinite;',
'            pointer-events: none; z-index: 2;',
'        }',
'',
'        /* BREATHING NUMBER GLOW */',
'        @keyframes numBreath {',
'            0%,100% { text-shadow: none; }',
'            50%      { text-shadow: 0 0 22px rgba(212,175,55,0.85); }',
'        }',
'        .stat-number { animation: numBreath 2.5s ease-in-out infinite; display: inline-block; }',
'',
'        /* ICON FLOAT */',
'        @keyframes iconFloat {',
'            0%,100% { transform: translateY(0) rotate(0deg); }',
'            33%      { transform: translateY(-5px) rotate(-6deg); }',
'            66%      { transform: translateY(3px) rotate(4deg); }',
'        }',
'        .stat-icon { animation: iconFloat 3s ease-in-out infinite; }',
'',
'        /* PROGRESS BAR SHIMMER */',
'        @keyframes barShimmer {',
'            0%   { background-position: -200% 0; }',
'            100% { background-position: 200% 0; }',
'        }',
'        #projBar {',
'            background: linear-gradient(90deg, #B8860B 0%, #D4AF37 30%, #FFD700 50%, #D4AF37 70%, #B8860B 100%);',
'            background-size: 200% 100%;',
'            animation: barShimmer 2s linear infinite;',
'            transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);',
'        }',
'',
'        /* CHART CARD AMBIENT GLOW */',
'        @keyframes chartGlow {',
'            0%,100% { box-shadow: 0 0 12px rgba(212,175,55,0.06), 0 4px 30px rgba(0,0,0,0.5); }',
'            50%      { box-shadow: 0 0 42px rgba(212,175,55,0.25), 0 4px 30px rgba(0,0,0,0.5); }',
'        }',
'        .chart-card { animation: chartGlow 4s ease-in-out infinite; }',
'',
'        /* STREAM SLIDE-IN */',
'        @keyframes slideIn {',
'            from { transform: translateX(-12px); opacity: 0; }',
'            to   { transform: translateX(0); opacity: 1; }',
'        }',
'        .stream-item { animation: slideIn 0.35s ease-out forwards; }',
'',
'        /* TABLE ROW PULSE */',
'        @keyframes rowPulse {',
'            0%,100% { background: transparent; }',
'            50%      { background: rgba(212,175,55,0.025); }',
'        }',
'        #recent-members-table tr:nth-child(1) { animation: rowPulse 4s ease-in-out 0.0s infinite; }',
'        #recent-members-table tr:nth-child(2) { animation: rowPulse 4s ease-in-out 0.8s infinite; }',
'        #recent-members-table tr:nth-child(3) { animation: rowPulse 4s ease-in-out 1.6s infinite; }',
'        #recent-members-table tr:nth-child(4) { animation: rowPulse 4s ease-in-out 2.4s infinite; }',
'        #recent-members-table tr:nth-child(5) { animation: rowPulse 4s ease-in-out 3.2s infinite; }',
'',
'        /* FINGERPRINT ROTATE */',
'        @keyframes fpRotate { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }',
'        .fp-bg { animation: fpRotate 35s linear infinite; opacity: 0.06; }',
'',
'        /* LIVE DOT BREATHE */',
'        @keyframes liveDot {',
'            0%,100% { transform: scale(1); opacity: 1; }',
'            50%      { transform: scale(2.2); opacity: 0.15; }',
'        }',
'        .live-dot-inner { animation: liveDot 1.2s ease-in-out infinite; }',
'    </style>'
)

foreach ($line in $lines) {
    $trimmed = $line.TrimEnd()

    # Detect start of OLD style block
    if (-not $styleReplaced -and $trimmed -match '^\s*<style>$') {
        $inOldStyle = $true
        continue
    }

    # Detect end of OLD style block
    if ($inOldStyle -and $trimmed -match '^\s*</style>$') {
        $inOldStyle = $false
        $styleReplaced = $true
        # Inject new style block
        foreach ($nl in $newStyleLines) { $result.Add($nl) }
        continue
    }

    # Skip old style content
    if ($inOldStyle) { continue }

    $result.Add($line)
}

if ($styleReplaced) {
    Write-Host "Style block replaced OK ($($newStyleLines.Count) lines)"
} else {
    Write-Host "WARNING: Style block not found!"
}

# Write result
[System.IO.File]::WriteAllLines((Resolve-Path $file), $result, [System.Text.Encoding]::UTF8)

# Quick verify
$verify = Get-Content $file -Raw
@('borderGlow','shimmerMove','numBreath','#particle-canvas','position: fixed','z-index: 0','</body>','</html>') | ForEach-Object {
    if ($verify -match [regex]::Escape($_)) { Write-Host "OK  $_" }
    else { Write-Host "FAIL $_" }
}
Write-Host "DONE. Total lines: $((Get-Content $file).Count)"
