<?php
$adminPath = __DIR__ . '/pages/admin';
$files = glob($adminPath . '/*.html');

$updated = [];
$diagnostics = [];

foreach ($files as $filePath) {
    $filename = basename($filePath);
    if ($filename === 'master-penandatangan.html') {
        continue;
    }
    
    $content = file_get_contents($filePath);
    
    if (strpos($content, 'admin/master-penandatangan') !== false) {
        $diagnostics[$filename] = 'Already updated';
        continue;
    }
    
    // Pattern to find Pelayanan Surat menu item block. Note the \s* in <\/a\s*> and <\/li\s*>
    $pattern = '/(<li>\s*<a[^>]+data-page="admin\/pelayanan"[^>]*>.*?Pelayanan Surat.*?<\/a\s*>\s*<\/li\s*>)/s';
    
    if (preg_match($pattern, $content, $matches)) {
        $matched = $matches[1];
        
        // Find indentation
        if (preg_match('/^(\s*)<li>/', $matched, $indentMatches)) {
            $indent = $indentMatches[1];
        } else {
            $indent = "            ";
        }
        
        $newItem = "\n" . $indent . "<li>\n" . $indent . "    <a\n" . $indent . "        class=\"nav-link\"\n" . $indent . "        data-page=\"admin/master-penandatangan\"\n" . $indent . "        href=\"#admin/master-penandatangan\"\n" . $indent . "    >\n" . $indent . "        <i class=\"fa-solid fa-signature\"></i>\n" . $indent . "        Master Penandatangan\n" . $indent . "    </a>\n" . $indent . "</li>";
        
        $newContent = str_replace($matched, $matched . $newItem, $content);
        file_put_contents($filePath, $newContent);
        $updated[] = $filename;
    } else {
        $diagnostics[$filename] = 'Pattern mismatch';
    }
}

echo json_encode([
    'success' => true,
    'updated_files' => $updated,
    'diagnostics' => $diagnostics
]);
