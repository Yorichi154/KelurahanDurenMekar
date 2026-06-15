$adminPath = "c:\laragon\www\Kelurahan_Laravel3\public\pages\admin"
$files = Get-ChildItem -Path $adminPath -Filter "*.html"
foreach ($file in $files) {
    if ($file.Name -eq "master-penandatangan.html") { continue }
    
    $content = Get-Content -Raw -Path $file.FullName
    
    $pattern = '(?s)(<li>\s*<a[^>]+data-page="admin/pelayanan"[^>]*>.*?Pelayanan Surat.*?</a>\s*</li>)'
    
    if ($content -match "admin/master-penandatangan") { continue }
    
    if ($content -match $pattern) {
        $matched = $Matches[1]
        if ($matched -match "^(\s*)<li>") {
            $indent = $Matches[1]
        } else {
            $indent = "            "
        }
        
        $newItem = "`n${indent}<li>`n${indent}    <a`n${indent}        class=`"nav-link`"`n${indent}        data-page=`"admin/master-penandatangan`"`n${indent}        href=`"#admin/master-penandatangan`"`n${indent}    >`n${indent}        <i class=`"fa-solid fa-signature`"></i>`n${indent}        Master Penandatangan`n${indent}    </a>`n${indent}</li>"
        
        $newContent = $content -replace [regex]::Escape($matched), ($matched + $newItem)
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Output "Updated sidebar in $($file.Name)"
    }
}
