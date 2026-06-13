<?php

namespace App\Http\Controllers;

use App\Models\Agenda;
use App\Models\Berita;
use App\Models\Faq;
use App\Models\Galeri;
use App\Models\Lembaga;
use App\Models\Pelayanan;
use App\Models\Pengaduan;
use App\Models\Pengumuman;
use App\Models\Rtrw;
use App\Models\Surat;
use App\Models\UnitKerja;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class LaporanController extends Controller
{
   public function index()
{
    return response()->json([

        'berita'      => Berita::count(),
        'agenda'      => Agenda::count(),
        'pengumuman'  => Pengumuman::count(),
        'galeri'      => Galeri::count(),

        'surat'       => Surat::count(),
        'pengaduan'   => Pengaduan::count(),

        'rtrw'        => Rtrw::count(),
        'faq'         => Faq::count(),

        'lembaga'     => Lembaga::count(),
        'unit_kerja'  => UnitKerja::count(),
        'pelayanan'   => Pelayanan::count(),

        'user'        => User::count(),

        'surat_status' =>
            Surat::selectRaw(
                'status, COUNT(*) total'
            )
            ->groupBy('status')
            ->get(),

        'pengaduan_status' =>
            Pengaduan::selectRaw(
                'status, COUNT(*) total'
            )
            ->groupBy('status')
            ->get(),
    ]);
}

    public function exportCsv()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="laporan_rekap_kelurahan.csv"',
        ];

        $callback = function() {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Kategori Laporan', 'Jumlah / Status']);

            fputcsv($file, ['Berita', Berita::count()]);
            fputcsv($file, ['Agenda', Agenda::count()]);
            fputcsv($file, ['Pengumuman', Pengumuman::count()]);
            fputcsv($file, ['Galeri', Galeri::count()]);
            fputcsv($file, ['Surat', Surat::count()]);
            fputcsv($file, ['Pengaduan', Pengaduan::count()]);
            fputcsv($file, ['RT / RW', Rtrw::count()]);
            fputcsv($file, ['FAQ', Faq::count()]);
            fputcsv($file, ['Lembaga', Lembaga::count()]);
            fputcsv($file, ['Unit Kerja', UnitKerja::count()]);
            fputcsv($file, ['Pelayanan', Pelayanan::count()]);
            fputcsv($file, ['User', User::count()]);

            fputcsv($file, ['', '']);
            fputcsv($file, ['Rekap Status Surat', 'Jumlah']);
            $surats = Surat::selectRaw('status, COUNT(*) total')->groupBy('status')->get();
            foreach ($surats as $s) {
                fputcsv($file, [$s->status, $s->total]);
            }

            fputcsv($file, ['', '']);
            fputcsv($file, ['Rekap Status Pengaduan', 'Jumlah']);
            $pengaduans = Pengaduan::selectRaw('status, COUNT(*) total')->groupBy('status')->get();
            foreach ($pengaduans as $p) {
                fputcsv($file, [$p->status, $p->total]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportPdf()
    {
        $logoPath = public_path('assets/images/Lambang_Kota_Depok.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $logoData = file_get_contents($logoPath);
            $logoBase64 = 'data:image/png;base64,' . base64_encode($logoData);
        }
        $logoHtml = $logoBase64 ? '<img src="' . $logoBase64 . '" alt="Logo">' : '<div class="no-logo">LOGO</div>';

        $data = [
            'berita' => Berita::count(),
            'agenda' => Agenda::count(),
            'pengumuman' => Pengumuman::count(),
            'galeri' => Galeri::count(),
            'surat' => Surat::count(),
            'pengaduan' => Pengaduan::count(),
            'rtrw' => Rtrw::count(),
            'faq' => Faq::count(),
            'lembaga' => Lembaga::count(),
            'unit_kerja' => UnitKerja::count(),
            'pelayanan' => Pelayanan::count(),
            'user' => User::count(),
            'surat_status' => Surat::selectRaw('status, COUNT(*) total')->groupBy('status')->get(),
            'pengaduan_status' => Pengaduan::selectRaw('status, COUNT(*) total')->groupBy('status')->get(),
            'tanggal' => Carbon::now()->translatedFormat('d F Y'),
        ];

        $html = '
        <html>
        <head>
            <title>Laporan Rekapitulasi Kelurahan</title>
            <style>
                body { font-family: "Times New Roman", Times, serif; font-size: 11pt; color: #000; }
                @page { margin: 1.5cm 2cm; }
                .kop { display: table; width: 100%; border-bottom: 3px solid #000; padding-bottom: 6px; margin-bottom: 15px; }
                .kop-logo { display: table-cell; width: 80px; vertical-align: middle; text-align: center; }
                .kop-logo img { width: 70px; height: 70px; }
                .kop-logo .no-logo { width:70px; height:70px; border:1px solid #999; display:inline-block; line-height:70px; font-size:10pt; color:#666; text-align:center; }
                .kop-text { display: table-cell; vertical-align: middle; text-align: center; padding: 0 10px; }
                .kop-text .k1 { font-size: 11pt; font-weight: normal; }
                .kop-text .k2 { font-size: 11pt; font-weight: normal; }
                .kop-text .k3 { font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
                .kop-text .k4 { font-size: 10pt; word-wrap: break-word; }
                h2 { text-align: center; font-size: 13pt; font-weight: bold; text-transform: uppercase; margin: 15px 0 5px; text-decoration: underline; }
                .subtitle { text-align: center; font-size: 11pt; color: #000; margin-bottom: 25px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .section-title { font-weight: bold; margin-top: 15px; margin-bottom: 8px; font-size: 12pt; }
            </style>
        </head>
        <body>
            <div class="kop">
              <div class="kop-logo">
                ' . $logoHtml . '
              </div>
              <div class="kop-text">
                <div class="k1">PEMERINTAH KOTA DEPOK</div>
                <div class="k2">KECAMATAN BOJONGSARI</div>
                <div class="k3">KELURAHAN DUREN MEKAR</div>
                <div class="k4">Jl. Raya Duren Mekar No. 1, Bojongsari, Kota Depok - Telp. (021) 7422123</div>
              </div>
            </div>

            <h2>Laporan Rekapitulasi Data Kelurahan</h2>
            <div class="subtitle">Dicetak pada: ' . $data['tanggal'] . '</div>

            <table>
                <thead>
                    <tr>
                        <th>Kategori Data</th>
                        <th>Jumlah Record</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Berita</td><td>' . $data['berita'] . '</td></tr>
                    <tr><td>Agenda</td><td>' . $data['agenda'] . '</td></tr>
                    <tr><td>Pengumuman</td><td>' . $data['pengumuman'] . '</td></tr>
                    <tr><td>Galeri</td><td>' . $data['galeri'] . '</td></tr>
                    <tr><td>Surat Layanan</td><td>' . $data['surat'] . '</td></tr>
                    <tr><td>Pengaduan Warga</td><td>' . $data['pengaduan'] . '</td></tr>
                    <tr><td>Data RT / RW</td><td>' . $data['rtrw'] . '</td></tr>
                    <tr><td>FAQ</td><td>' . $data['faq'] . '</td></tr>
                    <tr><td>Lembaga Kemasyarakatan</td><td>' . $data['lembaga'] . '</td></tr>
                    <tr><td>Unit Kerja</td><td>' . $data['unit_kerja'] . '</td></tr>
                    <tr><td>Pelayanan</td><td>' . $data['pelayanan'] . '</td></tr>
                    <tr><td>Pengguna Terdaftar</td><td>' . $data['user'] . '</td></tr>
                </tbody>
            </table>

            <div class="section-title">Rekap Status Surat</div>
            <table>
                <thead>
                    <tr><th>Status</th><th>Jumlah</th></tr>
                </thead>
                <tbody>';
                foreach ($data['surat_status'] as $s) {
                    $html .= '<tr><td>' . ucfirst($s->status) . '</td><td>' . $s->total . '</td></tr>';
                }
                $html .= '</tbody>
            </table>

            <div class="section-title">Rekap Status Pengaduan</div>
            <table>
                <thead>
                    <tr><th>Status</th><th>Jumlah</th></tr>
                </thead>
                <tbody>';
                foreach ($data['pengaduan_status'] as $p) {
                    $html .= '<tr><td>' . ucfirst($p->status) . '</td><td>' . $p->total . '</td></tr>';
                }
                $html .= '</tbody>
            </table>
        </body>
        </html>';

        $pdf = Pdf::loadHTML($html)->setPaper('A4', 'portrait');
        return $pdf->download('laporan_rekap_kelurahan.pdf');
    }

    public function exportDocx()
    {
        $logoPath = public_path('assets/images/Lambang_Kota_Depok.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $logoData = file_get_contents($logoPath);
            $logoBase64 = 'data:image/png;base64,' . base64_encode($logoData);
        }
        $logoHtml = $logoBase64 ? '<img src="' . $logoBase64 . '" alt="Logo">' : '<div class="no-logo">LOGO</div>';

        $data = [
            'berita' => Berita::count(),
            'agenda' => Agenda::count(),
            'pengumuman' => Pengumuman::count(),
            'galeri' => Galeri::count(),
            'surat' => Surat::count(),
            'pengaduan' => Pengaduan::count(),
            'rtrw' => Rtrw::count(),
            'faq' => Faq::count(),
            'lembaga' => Lembaga::count(),
            'unit_kerja' => UnitKerja::count(),
            'pelayanan' => Pelayanan::count(),
            'user' => User::count(),
            'surat_status' => Surat::selectRaw('status, COUNT(*) total')->groupBy('status')->get(),
            'pengaduan_status' => Pengaduan::selectRaw('status, COUNT(*) total')->groupBy('status')->get(),
            'tanggal' => Carbon::now()->translatedFormat('d F Y'),
        ];

        $html = '
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <title>Laporan Rekapitulasi Kelurahan</title>
            <!--[if gte mso 9]>
            <xml>
            <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            </w:WordDocument>
            </xml>
            <![endif]-->
            <style>
                body { font-family: "Times New Roman", Times, serif; font-size: 11pt; color: #000; }
                .kop { display: table; width: 100%; border-bottom: 3px solid #000; padding-bottom: 6px; margin-bottom: 15px; }
                .kop-logo { display: table-cell; width: 80px; vertical-align: middle; text-align: center; }
                .kop-logo img { width: 70px; height: 70px; }
                .kop-logo .no-logo { width:70px; height:70px; border:1px solid #999; display:inline-block; line-height:70px; font-size:10pt; color:#666; text-align:center; }
                .kop-text { display: table-cell; vertical-align: middle; text-align: center; padding: 0 10px; }
                .kop-text .k1 { font-size: 11pt; font-weight: normal; }
                .kop-text .k2 { font-size: 11pt; font-weight: normal; }
                .kop-text .k3 { font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
                .kop-text .k4 { font-size: 10pt; word-wrap: break-word; }
                h2 { text-align: center; font-size: 13pt; font-weight: bold; text-transform: uppercase; margin: 15px 0 5px; text-decoration: underline; }
                .subtitle { text-align: center; font-size: 11pt; color: #000; margin-bottom: 25px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .section-title { font-weight: bold; margin-top: 15px; margin-bottom: 8px; font-size: 12pt; }
            </style>
        </head>
        <body>
            <div class="kop">
              <div class="kop-logo">
                ' . $logoHtml . '
              </div>
              <div class="kop-text">
                <div class="k1">PEMERINTAH KOTA DEPOK</div>
                <div class="k2">KECAMATAN BOJONGSARI</div>
                <div class="k3">KELURAHAN DUREN MEKAR</div>
                <div class="k4">Jl. Raya Duren Mekar No. 1, Bojongsari, Kota Depok - Telp. (021) 7422123</div>
              </div>
            </div>

            <h2>Laporan Rekapitulasi Data Kelurahan</h2>
            <div class="subtitle">Dicetak pada: ' . $data['tanggal'] . '</div>

            <table>
                <thead>
                    <tr>
                        <th>Kategori Data</th>
                        <th>Jumlah Record</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Berita</td><td>' . $data['berita'] . '</td></tr>
                    <tr><td>Agenda</td><td>' . $data['agenda'] . '</td></tr>
                    <tr><td>Pengumuman</td><td>' . $data['pengumuman'] . '</td></tr>
                    <tr><td>Galeri</td><td>' . $data['galeri'] . '</td></tr>
                    <tr><td>Surat Layanan</td><td>' . $data['surat'] . '</td></tr>
                    <tr><td>Pengaduan Warga</td><td>' . $data['pengaduan'] . '</td></tr>
                    <tr><td>Data RT / RW</td><td>' . $data['rtrw'] . '</td></tr>
                    <tr><td>FAQ</td><td>' . $data['faq'] . '</td></tr>
                    <tr><td>Lembaga Kemasyarakatan</td><td>' . $data['lembaga'] . '</td></tr>
                    <tr><td>Unit Kerja</td><td>' . $data['unit_kerja'] . '</td></tr>
                    <tr><td>Pelayanan</td><td>' . $data['pelayanan'] . '</td></tr>
                    <tr><td>Pengguna Terdaftar</td><td>' . $data['user'] . '</td></tr>
                </tbody>
            </table>

            <div class="section-title">Rekap Status Surat</div>
            <table>
                <thead>
                    <tr><th>Status</th><th>Jumlah</th></tr>
                </thead>
                <tbody>';
                foreach ($data['surat_status'] as $s) {
                    $html .= '<tr><td>' . ucfirst($s->status) . '</td><td>' . $s->total . '</td></tr>';
                }
                $html .= '</tbody>
            </table>

            <div class="section-title">Rekap Status Pengaduan</div>
            <table>
                <thead>
                    <tr><th>Status</th><th>Jumlah</th></tr>
                </thead>
                <tbody>';
                foreach ($data['pengaduan_status'] as $p) {
                    $html .= '<tr><td>' . ucfirst($p->status) . '</td><td>' . $p->total . '</td></tr>';
                }
                $html .= '</tbody>
            </table>
        </body>
        </html>';

        return response($html, 200, [
            'Content-Type' => 'application/msword',
            'Content-Disposition' => 'attachment; filename="laporan_rekap_kelurahan.doc"',
        ]);
    }
}
