<?php

namespace App\Http\Controllers;

use App\Models\Surat;
use App\Models\NomorSurat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class BuatSuratController extends Controller
{
    /**
     * Daftar konfigurasi jenis surat (kode, bulan Romawi, dll.)
     */
    private static array $JENIS_CONFIG = [
        'SKTM'        => 'Surat Keterangan Tidak Mampu',
        'SKDOM'       => 'Surat Keterangan Domisili',
        'SKDM'        => 'Surat Keterangan Domisili Menetap',
        'SKKEHIDUPAN' => 'Surat Keterangan Masih Hidup',
        'SKBELUMNIK'  => 'Surat Keterangan Belum Memiliki NIK',
        'SKWIRASWASTA'=> 'Surat Keterangan Usaha/Wiraswasta',
        'SKPINDAH'    => 'Surat Keterangan Pindah',
        'SKKEMATIAN'  => 'Surat Keterangan Kematian',
        'SKKELAHIRAN' => 'Surat Keterangan Kelahiran',
        'SKGAJISWASTA'=> 'Surat Keterangan Penghasilan (Swasta)',
        'SKGAJIPNS'   => 'Surat Keterangan Penghasilan (PNS)',
        'SKPEMILIKAN' => 'Surat Keterangan Pemilikan Tanah',
        'SKTIDAKBUTA' => 'Surat Keterangan Tidak Buta Huruf',
        'SKSENGKETA'  => 'Surat Keterangan Bebas Sengketa',
        'SKBERSIH'    => 'Surat Keterangan Berkelakuan Baik',
        'N1'          => 'Surat Keterangan Untuk Nikah (N1)',
        'N2'          => 'Surat Keterangan Asal Usul (N2)',
        'N4'          => 'Surat Keterangan Tentang Orang Tua (N4)',
        'PENGANTAR'   => 'Surat Pengantar (Umum)',
        'PENGANTARSKCK' => 'Surat Pengantar SKCK',
        'PENGANTARPINDAH' => 'Surat Pengantar Pindah',
        'REKOMENDASI' => 'Surat Rekomendasi',
        'KUASA'       => 'Surat Kuasa',
    ];

    private static array $BULAN_ROMAWI = [
        1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV',
        5 => 'V', 6 => 'VI', 7 => 'VII', 8 => 'VIII',
        9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII',
    ];

    /**
     * GET /api/staf/buat-surat/jenis
     * Return list of letter types
     */
    public function indexJenis()
    {
        $result = [];
        foreach (self::$JENIS_CONFIG as $kode => $nama) {
            $result[] = ['kode' => $kode, 'nama' => $nama];
        }
        return response()->json($result);
    }

    /**
     * POST /api/staf/buat-surat/preview
     * Return HTML preview of the letter (for display in modal)
     */
    public function preview(Request $request)
    {
        $request->validate([
            'kode_jenis' => 'required|string',
            'data_surat' => 'required|array',
        ]);

        $kode = $request->kode_jenis;
        $data = $request->data_surat;
        $now  = Carbon::now();

        $html = $this->buildSuratHtml($kode, $data, '[PREVIEW — BELUM TERSIMPAN]', $now);

        return response($html, 200)->header('Content-Type', 'text/html; charset=utf-8');
    }

    /**
     * POST /api/staf/buat-surat
     * Generate nomor surat, create Surat record, generate PDF, return download URL
     */
    public function store(Request $request)
    {
        $request->validate([
            'kode_jenis' => 'required|string',
            'data_surat' => 'required|array',
            'keperluan'  => 'required|string',
        ]);

        $kode    = $request->kode_jenis;
        $data    = $request->data_surat;
        $now     = Carbon::now();
        $bulanRomawi = self::$BULAN_ROMAWI[$now->month];
        $tahun   = (string) $now->year;

        // Generate nomor surat atomically
        $nomorSurat = NomorSurat::generateNomor($kode, $bulanRomawi, $tahun);

        // Determine warga user_id: use data_surat.user_id or authenticated staf's id as fallback
        $userId = $data['user_id'] ?? auth()->id();

        // Build HTML for PDF
        $html = $this->buildSuratHtml($kode, $data, $nomorSurat, $now);

        // Generate PDF via dompdf
        $pdf = Pdf::loadHTML($html)
            ->setPaper('A4', 'portrait')
            ->setOption('defaultFont', 'times')
            ->setOption('isHtml5ParserEnabled', true)
            ->setOption('isRemoteEnabled', false);

        // Save PDF to storage
        $filename = 'surat/' . str_replace('/', '_', $nomorSurat) . '.pdf';
        $pdfContent = $pdf->output();
        \Storage::disk('public')->put($filename, $pdfContent);

        // Create Surat record
        $jenisNama = self::$JENIS_CONFIG[$kode] ?? $kode;
        $surat = Surat::create([
            'user_id'     => $userId,
            'jenis_surat' => $jenisNama,
            'nomor_surat' => $nomorSurat,
            'keperluan'   => $request->keperluan,
            'data_surat'  => $data,
            'dibuat_oleh' => auth()->id(),
            'file_surat'  => $filename,
            'status'      => 'selesai',
        ]);

        return response()->json([
            'success'       => true,
            'surat_id'      => $surat->id,
            'nomor_surat'   => $nomorSurat,
            'download_url'  => '/api/staf/buat-surat/' . $surat->id . '/download',
        ], 201);
    }

    /**
     * GET /api/staf/buat-surat/{id}/download
     * Re-download PDF for an archived letter
     */
    public function download($id)
    {
        $surat = Surat::findOrFail($id);

        if ($surat->file_surat && \Storage::disk('public')->exists($surat->file_surat)) {
            $pdfContent = \Storage::disk('public')->get($surat->file_surat);
        } else {
            // Regenerate on the fly
            $kode  = $this->getKodeFromJenis($surat->jenis_surat);
            $data  = is_array($surat->data_surat) ? $surat->data_surat : [];
            $created = $surat->created_at ?? Carbon::now();
            $html  = $this->buildSuratHtml($kode, $data, $surat->nomor_surat ?? '-', $created);
            $pdf   = Pdf::loadHTML($html)->setPaper('A4', 'portrait')->setOption('defaultFont', 'times');
            $pdfContent = $pdf->output();
        }

        $nomorSafe = str_replace(['/', '\\', ' '], '_', $surat->nomor_surat ?? $id);
        return response($pdfContent, 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="Surat_' . $nomorSafe . '.pdf"',
        ]);
    }

    /**
     * GET /api/staf/arsip-surat
     * Return paginated archived letters created by staf (has nomor_surat)
     */
    public function indexArsip(Request $request)
    {
        $query = Surat::with('user', 'pembuatSurat')
            ->whereNotNull('nomor_surat')
            ->latest();

        if ($s = $request->search) {
            $query->where(function ($q) use ($s) {
                $q->where('nomor_surat', 'like', "%{$s}%")
                  ->orWhere('jenis_surat', 'like', "%{$s}%")
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$s}%")->orWhere('nik', 'like', "%{$s}%"));
            });
        }

        if ($from = $request->from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $request->to) {
            $query->whereDate('created_at', '<=', $to);
        }
        if ($jenis = $request->jenis) {
            $query->where('jenis_surat', 'like', "%{$jenis}%");
        }

        return response()->json($query->paginate(20));
    }

    // ─────────────────────────────────────────────────────
    // HTML BUILDER — Template Surat per Jenis
    // ─────────────────────────────────────────────────────

    private function buildSuratHtml(string $kode, array $d, string $nomor, $tanggal): string
    {
        $now     = Carbon::parse($tanggal);
        $tglIndo = $this->tglIndonesia($now);
        $bulan   = $now->translatedFormat('F');
        $tahun   = $now->year;

        // Common header & footer for all letters
        $header  = $this->buildHeader($nomor, $kode);
        $footer  = $this->buildFooter($d, $tglIndo);
        $isi     = $this->buildIsi($kode, $d, $nomor, $tglIndo);

        return <<<HTML
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    color: #000;
    background: #fff;
    padding: 0;
  }
  .page {
    width: 21cm;
    min-height: 29.7cm;
    margin: 0 auto;
    padding: 1.5cm 2cm 2cm 2.5cm;
    position: relative;
  }
  /* KOP */
  .kop { display: table; width: 100%; border-bottom: 4px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
  .kop-logo { display: table-cell; width: 80px; vertical-align: middle; text-align: center; }
  .kop-logo img { width: 70px; height: 70px; }
  .kop-logo .no-logo { width:70px; height:70px; border:1px solid #999; display:inline-block; line-height:70px; font-size:10pt; color:#666; text-align:center; }
  .kop-text { display: table-cell; vertical-align: middle; text-align: center; padding: 0 10px; }
  .kop-text .k1 { font-size: 11pt; font-weight: normal; }
  .kop-text .k2 { font-size: 11pt; font-weight: normal; }
  .kop-text .k3 { font-size: 15pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
  .kop-text .k4 { font-size: 10pt; }

  /* TITLE */
  .surat-title { text-align: center; margin: 16px 0 4px; }
  .surat-title h2 { font-size: 13pt; font-weight: bold; text-transform: uppercase; text-decoration: underline; }
  .surat-nomor { text-align: center; font-size: 11pt; margin-bottom: 16px; }

  /* BODY TEXT */
  .intro { margin-bottom: 10px; text-align: justify; line-height: 1.6; }
  .intro p { margin-bottom: 6px; }

  /* DATA TABLE */
  .data-table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  .data-table td { padding: 3px 0; vertical-align: top; font-size: 11.5pt; line-height: 1.5; }
  .data-table td:first-child { width: 44%; padding-left: 20px; }
  .data-table td.sep { width: 10px; text-align: center; }
  .data-table td:last-child { font-weight: normal; }
  .data-table .field-label { font-weight: normal; }

  /* PENUTUP */
  .penutup { margin-top: 12px; text-align: justify; line-height: 1.6; }
  .penutup p { margin-bottom: 6px; }

  /* TTD */
  .ttd-section { margin-top: 28px; float: right; width: 260px; text-align: center; }
  .ttd-section .ttd-kota { margin-bottom: 4px; }
  .ttd-section .ttd-jabatan { margin-bottom: 80px; }
  .ttd-section .ttd-nama { font-weight: bold; text-decoration: underline; }
  .ttd-section .ttd-nip { font-size: 10.5pt; }
  .clearfix::after { content:''; display:table; clear:both; }

  /* Stempel placeholder */
  .stempel { position: absolute; left: 2.5cm; bottom: 3.2cm; width: 100px; height: 100px; border: 2px dashed #aaa; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: #aaa; text-align: center; }
</style>
</head>
<body>
<div class="page">
  {$header}
  {$isi}
  {$footer}
</div>
</body>
</html>
HTML;
    }

    private function buildHeader(string $nomor, string $kode): string
    {
        $judulSurat = self::$JENIS_CONFIG[$kode] ?? 'Surat Keterangan';
        $judulUpper = strtoupper($judulSurat);

        return <<<HTML
<div class="kop">
  <div class="kop-logo">
    <div class="no-logo">LOGO</div>
  </div>
  <div class="kop-text">
    <div class="k1">PEMERINTAH KOTA DEPOK</div>
    <div class="k2">KECAMATAN BOJONGSARI</div>
    <div class="k3">KELURAHAN DUREN MEKAR</div>
    <div class="k4">Jl. Raya Duren Mekar No. 1, Bojongsari, Kota Depok — Telp. (021) 7422123</div>
  </div>
</div>
<div class="surat-title">
  <h2>{$judulUpper}</h2>
</div>
<div class="surat-nomor">Nomor: {$nomor}</div>
HTML;
    }

    private function buildFooter(array $d, string $tglIndo): string
    {
        return <<<HTML
<div class="clearfix">
  <div class="ttd-section">
    <div class="ttd-kota">Depok, {$tglIndo}</div>
    <div class="ttd-jabatan">Lurah Duren Mekar</div>
    <div class="ttd-nama">[Nama Lurah]</div>
    <div class="ttd-nip">NIP. [NIP Lurah]</div>
  </div>
</div>
HTML;
    }

    /**
     * Build letter body HTML based on letter type code.
     * Each type has its own template.
     */
    private function buildIsi(string $kode, array $d, string $nomor, string $tglIndo): string
    {
        $get = fn(string $key, string $default = '-') => htmlspecialchars($d[$key] ?? $default, ENT_QUOTES, 'UTF-8');

        // Common applicant data block used by most letters
        $blockPemohon = <<<HTML
<table class="data-table">
  <tr><td class="field-label">Nama Lengkap</td><td class="sep">:</td><td><strong>{$get('nama')}</strong></td></tr>
  <tr><td class="field-label">Tempat / Tgl Lahir</td><td class="sep">:</td><td>{$get('tempat_lahir')}, {$get('tgl_lahir')}</td></tr>
  <tr><td class="field-label">Jenis Kelamin</td><td class="sep">:</td><td>{$get('jenis_kelamin')}</td></tr>
  <tr><td class="field-label">Agama</td><td class="sep">:</td><td>{$get('agama')}</td></tr>
  <tr><td class="field-label">Status Perkawinan</td><td class="sep">:</td><td>{$get('status_nikah')}</td></tr>
  <tr><td class="field-label">Pekerjaan</td><td class="sep">:</td><td>{$get('pekerjaan')}</td></tr>
  <tr><td class="field-label">NIK</td><td class="sep">:</td><td>{$get('nik')}</td></tr>
  <tr><td class="field-label">No. KK</td><td class="sep">:</td><td>{$get('no_kk')}</td></tr>
  <tr><td class="field-label">Alamat</td><td class="sep">:</td><td>{$get('alamat')}</td></tr>
  <tr><td class="field-label">RT / RW</td><td class="sep">:</td><td>{$get('rt')} / {$get('rw')}</td></tr>
</table>
HTML;

        return match(true) {

            // ── SKTM: Surat Keterangan Tidak Mampu ──
            $kode === 'SKTM' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
</div>
{$blockPemohon}
<div class="penutup">
  <p>Adalah benar warga Kelurahan Duren Mekar yang berdomisili pada alamat tersebut di atas, dan yang bersangkutan <strong>TIDAK MAMPU / KURANG MAMPU</strong> secara ekonomi.</p>
  <p>Surat keterangan ini dibuat untuk keperluan : <strong>{$get('keperluan')}</strong>.</p>
  <p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
</div>
HTML,

            // ── SKDOM / SKDM: Surat Keterangan Domisili ──
            in_array($kode, ['SKDOM', 'SKDM']) => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
</div>
{$blockPemohon}
<div class="penutup">
  <p>Adalah benar warga yang berdomisili / bertempat tinggal secara <strong>{$get('jenis_domisili', 'tetap')}</strong> di Kelurahan Duren Mekar sejak <strong>{$get('sejak_tahun')}</strong>.</p>
  <p>Surat keterangan ini dibuat untuk keperluan : <strong>{$get('keperluan')}</strong>.</p>
  <p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
</div>
HTML,

            // ── SKKEHIDUPAN: Surat Keterangan Masih Hidup ──
            $kode === 'SKKEHIDUPAN' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan dengan sesungguhnya bahwa :</p>
</div>
{$blockPemohon}
<div class="penutup">
  <p>Adalah benar warga Kelurahan Duren Mekar yang berdomisili pada alamat tersebut di atas dan pada saat surat keterangan ini dibuat, yang bersangkutan <strong>MASIH HIDUP</strong>.</p>
  <p>Surat keterangan ini dibuat untuk keperluan : <strong>{$get('keperluan')}</strong>.</p>
  <p>Demikian surat keterangan ini kami buat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
</div>
HTML,

            // ── SKBELUMNIK ──
            $kode === 'SKBELUMNIK' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
</div>
{$blockPemohon}
<div class="penutup">
  <p>Adalah benar warga Kelurahan Duren Mekar dan berdasarkan data yang ada pada kami, yang bersangkutan <strong>BELUM MEMILIKI NOMOR INDUK KEPENDUDUKAN (NIK)</strong>.</p>
  <p>Surat keterangan ini dibuat untuk keperluan : <strong>{$get('keperluan')}</strong>.</p>
  <p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
</div>
HTML,

            // ── SKWIRASWASTA: Usaha / Wiraswasta ──
            $kode === 'SKWIRASWASTA' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
</div>
{$blockPemohon}
<div class="penutup">
  <p>Adalah benar warga Kelurahan Duren Mekar yang menjalankan usaha/wirausaha dengan keterangan sebagai berikut :</p>
</div>
<table class="data-table">
  <tr><td class="field-label">Nama Usaha</td><td class="sep">:</td><td>{$get('nama_usaha')}</td></tr>
  <tr><td class="field-label">Jenis Usaha</td><td class="sep">:</td><td>{$get('jenis_usaha')}</td></tr>
  <tr><td class="field-label">Alamat Usaha</td><td class="sep">:</td><td>{$get('alamat_usaha')}</td></tr>
  <tr><td class="field-label">Perkiraan Pendapatan</td><td class="sep">:</td><td>Rp {$get('pendapatan')} / bulan</td></tr>
</table>
<div class="penutup">
  <p>Surat keterangan ini dibuat untuk keperluan : <strong>{$get('keperluan')}</strong>.</p>
  <p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
</div>
HTML,

            // ── SKPINDAH ──
            $kode === 'SKPINDAH' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
</div>
{$blockPemohon}
<div class="penutup">
  <p>Adalah benar warga Kelurahan Duren Mekar yang akan <strong>PINDAH TEMPAT TINGGAL</strong> ke :</p>
</div>
<table class="data-table">
  <tr><td class="field-label">Alamat Tujuan</td><td class="sep">:</td><td>{$get('alamat_tujuan')}</td></tr>
  <tr><td class="field-label">Kelurahan/Desa</td><td class="sep">:</td><td>{$get('kel_tujuan')}</td></tr>
  <tr><td class="field-label">Kecamatan</td><td class="sep">:</td><td>{$get('kec_tujuan')}</td></tr>
  <tr><td class="field-label">Kota/Kabupaten</td><td class="sep">:</td><td>{$get('kota_tujuan')}</td></tr>
  <tr><td class="field-label">Alasan Pindah</td><td class="sep">:</td><td>{$get('alasan_pindah')}</td></tr>
</table>
<div class="penutup">
  <p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
</div>
HTML,

            // ── SKKEMATIAN ──
            $kode === 'SKKEMATIAN' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
</div>
<table class="data-table">
  <tr><td class="field-label">Nama Almarhum/ah</td><td class="sep">:</td><td><strong>{$get('nama_alm')}</strong></td></tr>
  <tr><td class="field-label">Tempat / Tgl Lahir</td><td class="sep">:</td><td>{$get('tempat_lahir_alm')}, {$get('tgl_lahir_alm')}</td></tr>
  <tr><td class="field-label">NIK</td><td class="sep">:</td><td>{$get('nik_alm')}</td></tr>
  <tr><td class="field-label">Agama</td><td class="sep">:</td><td>{$get('agama_alm')}</td></tr>
  <tr><td class="field-label">Tanggal Meninggal</td><td class="sep">:</td><td>{$get('tgl_meninggal')}</td></tr>
  <tr><td class="field-label">Tempat Meninggal</td><td class="sep">:</td><td>{$get('tempat_meninggal')}</td></tr>
  <tr><td class="field-label">Sebab Kematian</td><td class="sep">:</td><td>{$get('sebab_kematian')}</td></tr>
  <tr><td class="field-label">Alamat Terakhir</td><td class="sep">:</td><td>{$get('alamat_alm')}</td></tr>
</table>
<div class="penutup">
  <p>Surat keterangan ini dibuat untuk keperluan : <strong>{$get('keperluan')}</strong>.</p>
  <p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
</div>
HTML,

            // ── SKKELAHIRAN ──
            $kode === 'SKKELAHIRAN' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa telah lahir seorang anak dengan keterangan sebagai berikut :</p>
</div>
<table class="data-table">
  <tr><td class="field-label">Nama Anak</td><td class="sep">:</td><td><strong>{$get('nama_anak')}</strong></td></tr>
  <tr><td class="field-label">Jenis Kelamin</td><td class="sep">:</td><td>{$get('jk_anak')}</td></tr>
  <tr><td class="field-label">Tempat Lahir</td><td class="sep">:</td><td>{$get('tempat_lahir_anak')}</td></tr>
  <tr><td class="field-label">Tanggal Lahir</td><td class="sep">:</td><td>{$get('tgl_lahir_anak')}</td></tr>
  <tr><td class="field-label">Nama Ayah</td><td class="sep">:</td><td>{$get('nama_ayah')}</td></tr>
  <tr><td class="field-label">Nama Ibu</td><td class="sep">:</td><td>{$get('nama_ibu')}</td></tr>
  <tr><td class="field-label">Alamat Orang Tua</td><td class="sep">:</td><td>{$get('alamat_ortu')}</td></tr>
</table>
<div class="penutup">
  <p>Surat keterangan ini dibuat untuk keperluan : <strong>{$get('keperluan')}</strong>.</p>
  <p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
</div>
HTML,

            // ── SKGAJISWASTA ──
            $kode === 'SKGAJISWASTA' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
</div>
{$blockPemohon}
<div class="penutup">
  <p>Adalah benar warga Kelurahan Duren Mekar yang bekerja sebagai <strong>{$get('jabatan')}</strong> di <strong>{$get('nama_perusahaan')}</strong> dengan penghasilan rata-rata <strong>Rp {$get('penghasilan')}</strong> per bulan.</p>
  <p>Surat keterangan ini dibuat untuk keperluan : <strong>{$get('keperluan')}</strong>.</p>
  <p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
</div>
HTML,

            // ── SKGAJIPNS ──
            $kode === 'SKGAJIPNS' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
</div>
{$blockPemohon}
<div class="penutup">
  <p>Adalah benar warga Kelurahan Duren Mekar yang berstatus sebagai <strong>Pegawai Negeri Sipil (PNS)</strong> pada instansi <strong>{$get('instansi')}</strong>, Golongan <strong>{$get('golongan')}</strong>, dengan penghasilan rata-rata <strong>Rp {$get('penghasilan')}</strong> per bulan.</p>
  <p>Surat keterangan ini dibuat untuk keperluan : <strong>{$get('keperluan')}</strong>.</p>
  <p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
</div>
HTML,

            // ── SKPEMILIKAN ──
            $kode === 'SKPEMILIKAN' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
</div>
{$blockPemohon}
<div class="penutup">
  <p>Adalah benar warga Kelurahan Duren Mekar yang memiliki sebidang tanah dengan keterangan :</p>
</div>
<table class="data-table">
  <tr><td class="field-label">Luas Tanah</td><td class="sep">:</td><td>{$get('luas_tanah')} m²</td></tr>
  <tr><td class="field-label">Lokasi Tanah</td><td class="sep">:</td><td>{$get('lokasi_tanah')}</td></tr>
  <tr><td class="field-label">Bukti Kepemilikan</td><td class="sep">:</td><td>{$get('bukti_kepemilikan')}</td></tr>
  <tr><td class="field-label">Nomor Sertifikat</td><td class="sep">:</td><td>{$get('no_sertifikat')}</td></tr>
</table>
<div class="penutup">
  <p>Surat keterangan ini dibuat untuk keperluan : <strong>{$get('keperluan')}</strong>.</p>
  <p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
</div>
HTML,

            // ── SKTIDAKBUTA ──
            $kode === 'SKTIDAKBUTA' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
</div>
{$blockPemohon}
<div class="penutup">
  <p>Adalah benar warga Kelurahan Duren Mekar yang berdasarkan pengetahuan dan pengamatan kami, yang bersangkutan <strong>TIDAK BUTA HURUF</strong> dan mampu membaca serta menulis dengan baik.</p>
  <p>Surat keterangan ini dibuat untuk keperluan : <strong>{$get('keperluan')}</strong>.</p>
  <p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
</div>
HTML,

            // ── SKSENGKETA ──
            $kode === 'SKSENGKETA' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
</div>
{$blockPemohon}
<div class="penutup">
  <p>Adalah benar warga Kelurahan Duren Mekar yang memiliki tanah/bangunan di <strong>{$get('alamat_tanah')}</strong>, dan berdasarkan pengetahuan kami, tanah/bangunan tersebut <strong>TIDAK DALAM SENGKETA</strong> dengan pihak manapun.</p>
  <p>Surat keterangan ini dibuat untuk keperluan : <strong>{$get('keperluan')}</strong>.</p>
  <p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
</div>
HTML,

            // ── SKBERSIH: Berkelakuan Baik ──
            $kode === 'SKBERSIH' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
</div>
{$blockPemohon}
<div class="penutup">
  <p>Adalah benar warga Kelurahan Duren Mekar yang berdasarkan pengetahuan dan pengamatan kami selama ini, yang bersangkutan <strong>BERKELAKUAN BAIK</strong>, tidak pernah terlibat dalam tindak pidana dan tidak pernah melakukan perbuatan yang bertentangan dengan norma masyarakat.</p>
  <p>Surat keterangan ini dibuat untuk keperluan : <strong>{$get('keperluan')}</strong>.</p>
  <p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
</div>
HTML,

            // ── N1: Surat Keterangan Untuk Nikah ──
            $kode === 'N1' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
</div>
{$blockPemohon}
<div class="penutup">
  <p>Adalah benar warga Kelurahan Duren Mekar dan bermaksud untuk <strong>MELANGSUNGKAN PERNIKAHAN</strong> dengan :</p>
</div>
<table class="data-table">
  <tr><td class="field-label">Nama Calon Pasangan</td><td class="sep">:</td><td><strong>{$get('nama_pasangan')}</strong></td></tr>
  <tr><td class="field-label">Tempat / Tgl Lahir</td><td class="sep">:</td><td>{$get('ttl_pasangan')}</td></tr>
  <tr><td class="field-label">NIK Calon Pasangan</td><td class="sep">:</td><td>{$get('nik_pasangan')}</td></tr>
  <tr><td class="field-label">Alamat Calon Pasangan</td><td class="sep">:</td><td>{$get('alamat_pasangan')}</td></tr>
  <tr><td class="field-label">Rencana Menikah</td><td class="sep">:</td><td>{$get('rencana_nikah')}</td></tr>
</table>
<div class="penutup">
  <p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya di Kantor Urusan Agama setempat.</p>
</div>
HTML,

            // ── N2: Surat Keterangan Asal Usul ──
            $kode === 'N2' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
</div>
{$blockPemohon}
<div class="penutup">
  <p>Adalah anak dari :</p>
</div>
<table class="data-table">
  <tr><td class="field-label">Nama Ayah</td><td class="sep">:</td><td>{$get('nama_ayah')}</td></tr>
  <tr><td class="field-label">Nama Ibu</td><td class="sep">:</td><td>{$get('nama_ibu')}</td></tr>
  <tr><td class="field-label">Alamat Orang Tua</td><td class="sep">:</td><td>{$get('alamat_ortu')}</td></tr>
  <tr><td class="field-label">Status Perkawinan Ortu</td><td class="sep">:</td><td>{$get('status_ortu')}</td></tr>
</table>
<div class="penutup">
  <p>Demikian surat keterangan asal usul ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya di Kantor Urusan Agama setempat.</p>
</div>
HTML,

            // ── N4: Surat Keterangan Tentang Orang Tua ──
            $kode === 'N4' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
</div>
<table class="data-table">
  <tr><td class="field-label">Nama Ayah</td><td class="sep">:</td><td><strong>{$get('nama_ayah')}</strong></td></tr>
  <tr><td class="field-label">Tempat / Tgl Lahir</td><td class="sep">:</td><td>{$get('ttl_ayah')}</td></tr>
  <tr><td class="field-label">Pekerjaan Ayah</td><td class="sep">:</td><td>{$get('pekerjaan_ayah')}</td></tr>
  <tr><td class="field-label">Nama Ibu</td><td class="sep">:</td><td><strong>{$get('nama_ibu')}</strong></td></tr>
  <tr><td class="field-label">Tempat / Tgl Lahir Ibu</td><td class="sep">:</td><td>{$get('ttl_ibu')}</td></tr>
  <tr><td class="field-label">Pekerjaan Ibu</td><td class="sep">:</td><td>{$get('pekerjaan_ibu')}</td></tr>
  <tr><td class="field-label">Alamat Orang Tua</td><td class="sep">:</td><td>{$get('alamat_ortu')}</td></tr>
</table>
<div class="penutup">
  <p>Demikian surat keterangan tentang orang tua ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya di Kantor Urusan Agama setempat.</p>
</div>
HTML,

            // ── PENGANTAR (Umum) ──
            $kode === 'PENGANTAR' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, memberikan surat pengantar kepada :</p>
</div>
{$blockPemohon}
<div class="penutup">
  <p>Untuk keperluan : <strong>{$get('keperluan')}</strong> pada instansi/lembaga <strong>{$get('tujuan_instansi')}</strong>.</p>
  <p>Kepada yang berwenang diharapkan dapat memberikan bantuan sebagaimana mestinya.</p>
  <p>Demikian surat pengantar ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
</div>
HTML,

            // ── PENGANTARSKCK ──
            $kode === 'PENGANTARSKCK' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, memberikan surat pengantar guna keperluan pembuatan Surat Keterangan Catatan Kepolisian (SKCK) kepada :</p>
</div>
{$blockPemohon}
<div class="penutup">
  <p>Kepada Yth. Kepala Kepolisian Sektor / Resort Kota Depok agar berkenan membantu yang bersangkutan dalam pembuatan <strong>SKCK</strong>.</p>
  <p>Demikian surat pengantar ini dibuat dengan sebenarnya.</p>
</div>
HTML,

            // ── PENGANTARPINDAH ──
            $kode === 'PENGANTARPINDAH' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
</div>
{$blockPemohon}
<div class="penutup">
  <p>Bermaksud pindah tempat tinggal ke : <strong>{$get('alamat_tujuan')}</strong>, Kelurahan <strong>{$get('kel_tujuan')}</strong>, Kecamatan <strong>{$get('kec_tujuan')}</strong>, Kota/Kabupaten <strong>{$get('kota_tujuan')}</strong>.</p>
  <p>Kepada pihak yang berwenang di tempat tujuan agar berkenan menerima dan membantu yang bersangkutan mengurus kepindahannya.</p>
  <p>Demikian surat pengantar ini dibuat dengan sebenarnya.</p>
</div>
HTML,

            // ── REKOMENDASI ──
            $kode === 'REKOMENDASI' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, dengan ini memberikan <strong>REKOMENDASI</strong> kepada :</p>
</div>
{$blockPemohon}
<div class="penutup">
  <p>Untuk keperluan : <strong>{$get('keperluan')}</strong>.</p>
  <p>Berdasarkan pengamatan dan pengetahuan kami, yang bersangkutan adalah warga yang baik, bertanggung jawab, dan layak mendapat rekomendasi untuk keperluan tersebut.</p>
  <p>Demikian surat rekomendasi ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
</div>
HTML,

            // ── KUASA ──
            $kode === 'KUASA' => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, selaku Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
</div>
<div class="penutup"><p><strong>PEMBERI KUASA :</strong></p></div>
{$blockPemohon}
<div class="penutup"><p><strong>Memberikan kuasa penuh kepada :</strong></p></div>
<table class="data-table">
  <tr><td class="field-label">Nama Penerima Kuasa</td><td class="sep">:</td><td><strong>{$get('nama_penerima')}</strong></td></tr>
  <tr><td class="field-label">NIK Penerima Kuasa</td><td class="sep">:</td><td>{$get('nik_penerima')}</td></tr>
  <tr><td class="field-label">Hubungan</td><td class="sep">:</td><td>{$get('hubungan')}</td></tr>
  <tr><td class="field-label">Alamat Penerima</td><td class="sep">:</td><td>{$get('alamat_penerima')}</td></tr>
</table>
<div class="penutup">
  <p>Untuk keperluan : <strong>{$get('keperluan')}</strong>.</p>
  <p>Surat kuasa ini dibuat dengan sebenarnya tanpa paksaan dari pihak manapun.</p>
</div>
HTML,

            // Default fallback
            default => <<<HTML
<div class="intro">
  <p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
</div>
{$blockPemohon}
<div class="penutup">
  <p>Surat keterangan ini dibuat untuk keperluan : <strong>{$get('keperluan')}</strong>.</p>
  <p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
</div>
HTML
        };
    }

    private function tglIndonesia(Carbon $d): string
    {
        $bulan = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return $d->day . ' ' . $bulan[$d->month] . ' ' . $d->year;
    }

    private function getKodeFromJenis(string $jenis): string
    {
        foreach (self::$JENIS_CONFIG as $kode => $nama) {
            if (str_contains(strtolower($jenis), strtolower($kode)) ||
                str_contains(strtolower($jenis), strtolower(substr($nama, 0, 10)))) {
                return $kode;
            }
        }
        return 'PENGANTAR';
    }
}
