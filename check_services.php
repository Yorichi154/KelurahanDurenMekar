<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$services = \App\Models\Pelayanan::with('template')->get();
foreach ($services as $srv) {
    echo "ID: {$srv->id} | KODE: {$srv->kode_surat} | NAMA: {$srv->nama_surat}\n";
    echo "FIELDS: " . json_encode($srv->form_fields) . "\n";
    echo "TEMPLATE: " . ($srv->template ? substr($srv->template->konten_html, 0, 100) : 'NULL') . "\n";
    echo "---------------------------------------------------\n";
}
