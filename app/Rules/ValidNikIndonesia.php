<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidNikIndonesia implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! self::isValid((string) $value)) {
            $fail('NIK tidak valid. Gunakan format NIK Indonesia yang benar.');
        }
    }

    public static function isValid(string $nik): bool
    {
        if (! preg_match('/^[0-9]{16}$/', $nik)) {
            return false;
        }

        $province = (int) substr($nik, 0, 2);
        $city     = (int) substr($nik, 2, 2);
        $district = (int) substr($nik, 4, 2);
        $dayRaw   = (int) substr($nik, 6, 2);
        $month    = (int) substr($nik, 8, 2);
        $year2    = (int) substr($nik, 10, 2);
        $serial   = substr($nik, 12, 4);

        // Kode wilayah Indonesia umumnya 11-94. Kode kota/kabupaten,
        // kecamatan, tanggal, bulan, dan nomor urut tidak boleh kosong.
        if ($province < 11 || $province > 94) {
            return false;
        }
        if ($city < 1 || $city > 99 || $district < 1 || $district > 99) {
            return false;
        }
        if ($month < 1 || $month > 12 || $serial === '0000') {
            return false;
        }

        // Untuk perempuan, tanggal lahir pada NIK ditambah 40.
        $day = $dayRaw > 40 ? $dayRaw - 40 : $dayRaw;
        if ($day < 1 || $day > 31) {
            return false;
        }

        $currentYear2 = (int) date('y');
        $century = $year2 <= $currentYear2 ? 2000 : 1900;
        $year = $century + $year2;

        if (! checkdate($month, $day, $year)) {
            return false;
        }

        // Tolak tanggal lahir masa depan.
        $birthDate = \DateTime::createFromFormat('Y-m-d', sprintf('%04d-%02d-%02d', $year, $month, $day));
        $today = new \DateTime('today');
        if ($birthDate && $birthDate > $today) {
            return false;
        }

        return true;
    }
}
