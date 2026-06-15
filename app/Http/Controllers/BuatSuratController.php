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
        $types = \App\Models\Pelayanan::get();
        $result = [];
        foreach ($types as $t) {
            $result[] = [
                'kode'         => $t->kode_surat,
                'nama'         => $t->nama_surat,
                'form_fields'  => $t->form_fields,
                'syarat'       => $t->syarat,
                'metode_hasil' => $t->metode_hasil,
            ];
        }
        return response()->json($result);
    }

    public function searchWarga(Request $request)
    {
        $q = $request->query('q');
        if (empty($q)) {
            return response()->json([]);
        }

        $warga = \App\Models\User::where('role', 'warga')
            ->where(function($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('nik', 'like', "%{$q}%");
            })
            ->limit(10)
            ->get(['id', 'name', 'nik', 'alamat', 'rt', 'rw', 'telp', 'email']);

        return response()->json($warga);
    }

    /**
     * POST /api/staf/buat-surat/preview
     * Return HTML preview of the letter (for display in modal)
     */
    public function preview(Request $request)
    {
        $request->validate([
            'kode_jenis'    => 'required|string',
            'data_surat'    => 'required|array',
            'ukuran_kertas' => 'nullable|string|in:A4,F4',
            'nomor_surat'   => 'nullable|string',
            'tanggal_surat' => 'nullable|string',
            'penandatangan_id' => 'nullable|integer',
            'masa_berlaku_opsi' => 'nullable|string',
            'tanggal_berakhir' => 'nullable|string',
            'masa_berlaku_custom' => 'nullable|string',
            'edited_html' => 'nullable|string',
        ]);

        $kode   = $request->kode_jenis;
        $data   = $request->data_surat;
        $ukuran = $request->ukuran_kertas ?? 'F4';

        $tanggalInput = $request->tanggal_surat ?? $data['tanggal_surat'] ?? null;
        $now    = $tanggalInput ? Carbon::parse($tanggalInput) : Carbon::now();

        $nomor  = $request->nomor_surat ?? '[PREVIEW — BELUM TERSIMPAN]';

        $html = $this->buildSuratHtml(
            $kode,
            $data,
            $nomor,
            $now,
            $ukuran,
            $request->penandatangan_id,
            $request->edited_html,
            $request->masa_berlaku_opsi,
            $request->tanggal_berakhir,
            $request->masa_berlaku_custom
        );

        return response($html, 200)->header('Content-Type', 'text/html; charset=utf-8');
    }

    /**
     * POST /api/staf/buat-surat
     * Generate nomor surat, create Surat record, generate PDF, return download URL
     */
    public function store(Request $request)
    {
        $request->validate([
            'kode_jenis'    => 'required|string',
            'data_surat'    => 'required|array',
            'keperluan'     => 'required|string',
            'ukuran_kertas' => 'nullable|string|in:A4,F4',
            'surat_id'      => 'nullable|integer',
            'nomor_surat'   => 'required|string',
            'tanggal_surat' => 'nullable|string',
            'penandatangan_id' => 'nullable|integer',
            'masa_berlaku_opsi' => 'nullable|string',
            'tanggal_berakhir' => 'nullable|string',
            'masa_berlaku_custom' => 'nullable|string',
            'edited_html' => 'nullable|string',
        ]);

        $kode    = $request->kode_jenis;
        $data    = $request->data_surat;
        $ukuran  = $request->ukuran_kertas ?? 'F4';

        $tanggalInput = $request->tanggal_surat ?? $data['tanggal_surat'] ?? null;
        $now     = $tanggalInput ? Carbon::parse($tanggalInput) : Carbon::now();

        $nomorSurat = $request->nomor_surat;

        // user_id can be null if citizens have no accounts
        $userId = $data['user_id'] ?? null;

        $html = $this->buildSuratHtml(
            $kode,
            $data,
            $nomorSurat,
            $now,
            $ukuran,
            $request->penandatangan_id,
            $request->edited_html,
            $request->masa_berlaku_opsi,
            $request->tanggal_berakhir,
            $request->masa_berlaku_custom
        );

        if ($ukuran === 'F4') {
            $paper = [0, 0, 612, 936]; // 8.5" x 13" in points
        } else {
            $paper = 'A4';
        }

        $pdf = Pdf::loadHTML($html)
            ->setPaper($paper, 'portrait')
            ->setOption('defaultFont', 'times')
            ->setOption('isHtml5ParserEnabled', true)
            ->setOption('isRemoteEnabled', false);

        $filename = 'surat/' . str_replace('/', '_', $nomorSurat) . '.pdf';
        $pdfContent = $pdf->output();
        \Storage::disk('public')->put($filename, $pdfContent);

        $pelayanan = \App\Models\Pelayanan::where('kode_surat', strtoupper($kode))
            ->orWhere('kode_surat', strtolower($kode))
            ->first();
        $metodeHasil = $pelayanan ? $pelayanan->metode_hasil : 'download';
        $status = ($metodeHasil === 'pickup') ? 'siap_diambil' : 'selesai';

        $suratId = $request->surat_id ?? $data['surat_id'] ?? null;
        $jenisNama = $pelayanan ? $pelayanan->nama_surat : (self::$JENIS_CONFIG[$kode] ?? $kode);

        // Store metadata in data_surat
        $data['nomor_surat'] = $nomorSurat;
        $data['tanggal_surat'] = $tanggalInput;
        $data['penandatangan_id'] = $request->penandatangan_id;
        $data['masa_berlaku_opsi'] = $request->masa_berlaku_opsi;
        $data['tanggal_berakhir'] = $request->tanggal_berakhir;
        $data['masa_berlaku_custom'] = $request->masa_berlaku_custom;
        $data['edited_html'] = $request->edited_html;
        $data['ukuran_kertas'] = $ukuran;

        if ($suratId) {
            $surat = Surat::findOrFail($suratId);
            $surat->update([
                'user_id'     => $userId,
                'nomor_surat' => $nomorSurat,
                'data_surat'  => $data,
                'dibuat_oleh' => auth()->id(),
                'file_surat'  => $filename,
                'konten_final'=> $html,
                'status'      => $status,
            ]);
        } else {
            $surat = Surat::create([
                'user_id'     => $userId,
                'jenis_surat' => $jenisNama,
                'nomor_surat' => $nomorSurat,
                'keperluan'   => $request->keperluan,
                'data_surat'  => $data,
                'dibuat_oleh' => auth()->id(),
                'file_surat'  => $filename,
                'konten_final'=> $html,
                'status'      => $status,
            ]);
        }

        if ($status === 'siap_diambil') {
            $todayCount = \App\Models\SuratPickup::whereDate('created_at', today())->count();
            $nomorAntrian = 'A-' . sprintf('%03d', $todayCount + 1);

            $surat->pickup()->updateOrCreate(
                ['submission_id' => $surat->id],
                [
                    'nomor_surat' => $nomorSurat,
                    'nomor_antrian' => $nomorAntrian,
                    'tanggal_pengambilan' => now()->addDay()->toDateString(),
                    'status_pengambilan' => 'menunggu',
                ]
            );
        }

        return response()->json([
            'success'       => true,
            'surat_id'      => $surat->id,
            'nomor_surat'   => $nomorSurat,
            'status'        => $status,
            'pickup'        => $status === 'siap_diambil' ? $surat->pickup : null,
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

        if ($surat->konten_final) {
            $html = $surat->konten_final;
            $ukuran = $surat->data_surat['ukuran_kertas'] ?? 'F4';
            if ($ukuran === 'F4') {
                $paper = [0, 0, 612, 936];
            } else {
                $paper = 'A4';
            }
            $pdf = Pdf::loadHTML($html)
                ->setPaper($paper, 'portrait')
                ->setOption('defaultFont', 'times')
                ->setOption('isHtml5ParserEnabled', true)
                ->setOption('isRemoteEnabled', false);
            $pdfContent = $pdf->output();
        } else {
            if ($surat->file_surat && \Storage::disk('public')->exists($surat->file_surat)) {
                $pdfContent = \Storage::disk('public')->get($surat->file_surat);
            } else {
                $kode  = $this->getKodeFromJenis($surat->jenis_surat);
                $data  = is_array($surat->data_surat) ? $surat->data_surat : [];
                $created = $surat->created_at ?? Carbon::now();
                $html  = $this->buildSuratHtml($kode, $data, $surat->nomor_surat ?? '-', $created, 'F4');
                $pdf   = Pdf::loadHTML($html)->setPaper([0, 0, 612, 936], 'portrait')->setOption('defaultFont', 'times');
                $pdfContent = $pdf->output();
            }
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

    private function buildSuratHtml(
        string $kode, 
        array $d, 
        string $nomor, 
        $tanggal, 
        string $ukuran = 'F4',
        ?int $penandatanganId = null,
        ?string $editedHtml = null,
        ?string $masaBerlakuOpsi = null,
        ?string $tanggalBerakhir = null,
        ?string $masaBerlakuCustom = null
    ): string {
        $now     = Carbon::parse($tanggal);
        $tglIndo = $this->tglIndonesia($now);

        // Fetch Pelayanan and see if it has a print template configured
        $slug = strtolower($kode);
        $pelayanan = \App\Models\Pelayanan::with('template')
            ->where('kode_surat', $slug)
            ->orWhere('kode_surat', 'pelayanan-' . $slug)
            ->first();

        $header  = $this->buildHeader($nomor, $kode);
        $footer  = $this->buildFooter($tglIndo, $penandatanganId);

        $validityText = '';
        $opsi = $masaBerlakuOpsi ?? 'tidak_ada';
        if ($opsi === 'sampai_tanggal') {
            if ($tanggalBerakhir) {
                $tglExp = Carbon::parse($tanggalBerakhir);
                $tglExpIndo = $this->tglIndonesia($tglExp);
                $validityText = "Surat keterangan ini berlaku sampai tanggal {$tglExpIndo}.";
            }
        } elseif ($opsi === 'custom') {
            $validityText = $masaBerlakuCustom ?? '';
        }

        if (!empty($editedHtml)) {
            $isi = '<div class="custom-template-body" style="line-height: 1.5; text-align: justify; margin-top: 15px;">' . $editedHtml . '</div>';
        } elseif ($pelayanan && $pelayanan->template && !empty($pelayanan->template->konten_html)) {
            $konten = $pelayanan->template->konten_html;

            // Variables mapping
            $vars = [
                'nomor_surat' => $nomor,
                'tanggal'     => $tglIndo,
            ];

            // Resolve applicant user details if present
            $user = null;
            if (isset($d['user_id'])) {
                $user = \App\Models\User::find($d['user_id']);
            }
            if ($user) {
                $vars['nama']   = $user->name;
                $vars['nik']    = $user->nik;
                $vars['telp']   = $user->telp;
                $vars['alamat'] = $user->alamat;
                $vars['rt']     = $user->rt;
                $vars['rw']     = $user->rw;
            } else {
                $vars['nama']   = $d['nama'] ?? '';
                $vars['nik']    = $d['nik'] ?? '';
                $vars['telp']   = $d['telp'] ?? '';
                $vars['alamat'] = $d['alamat'] ?? '';
                $vars['rt']     = $d['rt'] ?? '';
                $vars['rw']     = $d['rw'] ?? '';
            }

            // Overlay custom fields from payload
            foreach ($d as $key => $value) {
                if (is_array($value)) {
                    $vars[$key] = json_encode($value);
                } else {
                    $vars[$key] = (string) $value;
                }
            }

            // Perform template interpolation
            foreach ($vars as $key => $value) {
                $konten = str_replace('{{' . $key . '}}', htmlspecialchars($value, ENT_QUOTES, 'UTF-8'), $konten);
                $konten = str_replace('{{ ' . $key . ' }}', htmlspecialchars($value, ENT_QUOTES, 'UTF-8'), $konten);
            }

            $isi = '<div class="custom-template-body" style="line-height: 1.5; text-align: justify; margin-top: 15px;">' . $konten . '</div>';
        } else {
            $resolvedData = $d;
            if (isset($d['user_id']) && !empty($d['user_id'])) {
                $user = \App\Models\User::find($d['user_id']);
                if ($user) {
                    $resolvedData = array_merge([
                        'nama' => $user->name,
                        'nik' => $user->nik,
                        'telp' => $user->telp,
                        'alamat' => $user->alamat,
                        'rt' => $user->rt,
                        'rw' => $user->rw,
                    ], $d);
                }
            }
            $isi = $this->buildIsi($kode, $resolvedData, $nomor, $tglIndo);
        }

        // Apply validity text injection
        if (!empty($validityText)) {
            if (str_contains($isi, '{{masa_berlaku}}') || str_contains($isi, '{{tanggal_berakhir}}') || str_contains($isi, '{{ masa_berlaku }}') || str_contains($isi, '{{ tanggal_berakhir }}')) {
                $isi = str_replace(['{{masa_berlaku}}', '{{ tanggal_berakhir }}', '{{ masa_berlaku }}', '{{tanggal_berakhir}}'], $validityText, $isi);
            } else {
                $isi .= '<div class="validity-section" style="margin-top: 15px; margin-bottom: 15px; text-align: justify; line-height: 1.4; font-weight: bold;">' . htmlspecialchars($validityText) . '</div>';
            }
        } else {
            $isi = str_replace(['{{masa_berlaku}}', '{{ tanggal_berakhir }}', '{{ masa_berlaku }}', '{{tanggal_berakhir}}'], '', $isi);
        }

        return <<<HTML
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  @page {
    margin: 1.5cm 2cm;
  }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 11pt;
    color: #000;
    background: #fff;
    margin: 0;
    padding: 0;
  }
  @media screen {
    body {
      padding: 1.5cm 2cm;
    }
  }
  .page {
    width: 100%;
    position: relative;
  }
  /* KOP */
  .kop { display: table; width: 100%; border-bottom: 3px solid #000; padding-bottom: 6px; margin-bottom: 10px; }
  .kop-logo { display: table-cell; width: 80px; vertical-align: middle; text-align: center; }
  .kop-logo img { width: 70px; height: 70px; }
  .kop-logo .no-logo { width:70px; height:70px; border:1px solid #999; display:inline-block; line-height:70px; font-size:10pt; color:#666; text-align:center; }
  .kop-text { display: table-cell; vertical-align: middle; text-align: center; padding: 0 10px; }
  .kop-text .k1 { font-size: 11pt; font-weight: normal; }
  .kop-text .k2 { font-size: 11pt; font-weight: normal; }
  .kop-text .k3 { font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
  .kop-text .k4 { font-size: 10pt; word-wrap: break-word; }

  /* TITLE */
  .surat-title { text-align: center; margin: 12px 0 4px; }
  .surat-title h2 { font-size: 12pt; font-weight: bold; text-transform: uppercase; text-decoration: underline; }
  .surat-nomor { text-align: center; font-size: 11pt; margin-bottom: 12px; }

  /* BODY TEXT */
  .intro { margin-bottom: 8px; text-align: justify; line-height: 1.4; }
  .intro p { margin-bottom: 6px; word-wrap: break-word; }

  /* DATA TABLE */
  .data-table { width: 100%; border-collapse: collapse; margin: 8px 0; }
  .data-table td { padding: 2px 0; vertical-align: top; font-size: 11pt; line-height: 1.4; word-wrap: break-word; overflow-wrap: break-word; }
  .data-table td:first-child { width: 140px; padding-left: 10px; }
  .data-table td.sep { width: 12px; text-align: center; }
  .data-table td:last-child { font-weight: normal; }
  .data-table .field-label { font-weight: normal; }

  /* PENUTUP */
  .penutup { margin-top: 8px; text-align: justify; line-height: 1.4; }
  .penutup p { margin-bottom: 6px; word-wrap: break-word; }

  /* TTD */
  .ttd-section { margin-top: 16px; float: right; width: 240px; text-align: center; }
  .ttd-section .ttd-kota { margin-bottom: 2px; }
  .ttd-section .ttd-jabatan { margin-bottom: 60px; }
  .ttd-section .ttd-nama { font-weight: bold; text-decoration: underline; }
  .ttd-section .ttd-nip { font-size: 10.5pt; }
  .clearfix::after { content:''; display:table; clear:both; }

  /* Stempel placeholder */
  .stempel { position: absolute; left: 1cm; bottom: 1cm; width: 80px; height: 80px; border: 2px dashed #aaa; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: #aaa; text-align: center; }
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
        $pelayanan = \App\Models\Pelayanan::where('kode_surat', $kode)->first();
        $judulSurat = $pelayanan ? $pelayanan->nama_surat : (self::$JENIS_CONFIG[$kode] ?? 'Surat Keterangan');
        $judulUpper = strtoupper($judulSurat);

        $logoPath = public_path('assets/images/Lambang_Kota_Depok.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $logoData = file_get_contents($logoPath);
            $logoBase64 = 'data:image/png;base64,' . base64_encode($logoData);
        }
        $logoHtml = $logoBase64 ? '<img src="' . $logoBase64 . '" alt="Logo">' : '<div class="no-logo">LOGO</div>';

        // Load profile settings dynamically
        $setting = \App\Models\Setting::first();
        $kota = $setting ? strtoupper($setting->kota ?? 'KOTA DEPOK') : 'KOTA DEPOK';
        $kec = $setting ? strtoupper($setting->kecamatan ?? 'BOJONGSARI') : 'BOJONGSARI';
        $kel = $setting ? strtoupper($setting->site_name ?? 'KELURAHAN DUREN MEKAR') : 'KELURAHAN DUREN MEKAR';

        $pemerintah = "PEMERINTAH " . $kota;
        $kecamatan = "KECAMATAN " . $kec;
        $kelurahan = $kel;

        $addressLine = 'Jl. Raya Duren Mekar No. 1, Bojongsari, Kota Depok';
        if ($setting) {
            $addressParts = [];
            if ($setting->address) $addressParts[] = $setting->address;

            $contactParts = [];
            if ($setting->phone) $contactParts[] = 'Telp. ' . $setting->phone;
            if ($setting->email) $contactParts[] = 'Email: ' . $setting->email;

            $addressLine = implode(', ', $addressParts);
            if (!empty($contactParts)) {
                $addressLine .= ' - ' . implode(', ', $contactParts);
            }
        } else {
            $addressLine .= ' - Telp. (021) 7422123';
        }

        return <<<HTML
<div class="kop">
  <div class="kop-logo">
    {$logoHtml}
  </div>
  <div class="kop-text">
    <div class="k1">{$pemerintah}</div>
    <div class="k2">{$kecamatan}</div>
    <div class="k3">{$kelurahan}</div>
    <div class="k4">{$addressLine}</div>
  </div>
</div>
<div class="surat-title">
  <h2>{$judulUpper}</h2>
</div>
<div class="surat-nomor">Nomor: {$nomor}</div>
HTML;
    }

    private function buildFooter(string $tglIndo, ?int $penandatanganId = null): string
    {
        $nama = 'H. MAHMUDIN, S.Sos';
        $nip = '196805121990031005';
        $jabatan = 'Lurah';

        if ($penandatanganId) {
            $penandatangan = \App\Models\MasterPenandatangan::find($penandatanganId);
            if ($penandatangan) {
                $nama = $penandatangan->nama;
                $nip = $penandatangan->nip;
                $jabatan = $penandatangan->jabatan;
            }
        } else {
            // Default to Setting's lurah_name
            $setting = \App\Models\Setting::first();
            if ($setting && $setting->lurah_name) {
                $nama = $setting->lurah_name;
            }
        }

        $jabatanHtml = '';
        if (str_contains(strtolower($jabatan), 'lurah') && !str_contains(strtolower($jabatan), 'a.n.')) {
            $jabatanHtml = 'Lurah Duren Mekar';
        } else {
            $jabatanHtml = 'a.n. Lurah Duren Mekar<br>' . $jabatan;
        }

        return <<<HTML
<div class="clearfix">
  <div class="ttd-section">
    <div class="ttd-kota">Depok, {$tglIndo}</div>
    <div class="ttd-jabatan">{$jabatanHtml}</div>
    <div class="ttd-nama">{$nama}</div>
    <div class="ttd-nip">NIP. {$nip}</div>
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
