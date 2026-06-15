<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

header('Content-Type: text/plain');

echo "Tables:\n";
foreach (DB::select('SHOW TABLES') as $table) {
    $tableArray = (array)$table;
    echo "- " . reset($tableArray) . "\n";
}

echo "\nColumns in 'surats':\n";
if (Schema::hasTable('surats')) {
    foreach (Schema::getColumnListing('surats') as $col) {
        echo "- $col\n";
    }
} else {
    echo "surats table does not exist.\n";
}

echo "\nColumns in 'surat_types':\n";
if (Schema::hasTable('surat_types')) {
    foreach (Schema::getColumnListing('surat_types') as $col) {
        echo "- $col\n";
    }
} else {
    echo "surat_types table does not exist.\n";
}

echo "\nMigrations run list:\n";
foreach (DB::table('migrations')->get() as $m) {
    echo "- $m->migration (batch $m->batch)\n";
}
