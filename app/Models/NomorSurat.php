<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NomorSurat extends Model
{
    protected $table = 'nomor_surats';

    protected $fillable = ['kode_jenis', 'tahun', 'counter'];

    /**
     * Atomically get and increment the counter for a given letter type and year.
     * Returns the formatted nomor surat string.
     */
    public static function generateNomor(string $kodeJenis, string $bulan, string $tahun): string
    {
        // Use DB transaction to ensure atomicity
        return \DB::transaction(function () use ($kodeJenis, $bulan, $tahun) {
            $record = static::where('kode_jenis', $kodeJenis)
                ->where('tahun', (int) $tahun)
                ->lockForUpdate()
                ->first();

            if ($record) {
                $record->increment('counter');
                $counter = $record->counter;
            } else {
                $record = static::create([
                    'kode_jenis' => $kodeJenis,
                    'tahun'      => (int) $tahun,
                    'counter'    => 1,
                ]);
                $counter = 1;
            }

            // Format: 001/SKTM/DBM/VI/2025
            $nomorPadded = str_pad($counter, 3, '0', STR_PAD_LEFT);
            return "{$nomorPadded}/{$kodeJenis}/DBM/{$bulan}/{$tahun}";
        });
    }
}
