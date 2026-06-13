<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pelayanan;

class PelayananSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'kode' => 'SKTM',
                'nama' => 'Surat Keterangan Tidak Mampu',
                'desc' => 'Surat keterangan untuk menyatakan warga kurang mampu secara ekonomi.',
                'hasil' => 'download',
                'syarat' => ['Fotokopi KTP', 'Fotokopi KK', 'Surat pengantar RT/RW'],
                'langkah' => [
                    ['judul' => 'Isi Form Online', 'deskripsi' => 'Mengisi data pengajuan dan mengunggah dokumen persyaratan.'],
                    ['judul' => 'Verifikasi Petugas', 'deskripsi' => 'Staf kelurahan memeriksa dan memvalidasi berkas warga.'],
                    ['judul' => 'Cetak Surat', 'deskripsi' => 'Surat disetujui, ditandatangani, dan dikirim digital ke akun warga.'],
                ],
                'fields' => [
                    ['key' => 'keperluan', 'label' => 'Keperluan', 'type' => 'textarea', 'required' => true],
                ]
            ],
            [
                'kode' => 'SKDOM',
                'nama' => 'Surat Keterangan Domisili',
                'desc' => 'Surat keterangan sebagai bukti tempat tinggal/domisili warga.',
                'hasil' => 'download',
                'syarat' => ['Fotokopi KTP', 'Fotokopi KK', 'Surat pengantar RT/RW'],
                'langkah' => [
                    ['judul' => 'Pengajuan', 'deskripsi' => 'Warga mengajukan secara online dengan mengisi formulir.'],
                    ['judul' => 'Proses Kelurahan', 'deskripsi' => 'Validasi berkas oleh petugas kelurahan.'],
                    ['judul' => 'Selesai', 'deskripsi' => 'Unduh PDF surat langsung dari dashboard warga.'],
                ],
                'fields' => [
                    ['key' => 'sejak_tahun', 'label' => 'Menetap Sejak Tahun', 'type' => 'text', 'required' => true],
                    ['key' => 'keperluan', 'label' => 'Keperluan', 'type' => 'textarea', 'required' => true],
                ]
            ],
            [
                'kode' => 'SKDM',
                'nama' => 'Surat Keterangan Domisili Menetap',
                'desc' => 'Surat keterangan domisili bagi warga yang menetap permanen.',
                'hasil' => 'download',
                'syarat' => ['Fotokopi KTP', 'Fotokopi KK', 'Surat RT/RW'],
                'langkah' => [
                    ['judul' => 'Pengajuan', 'deskripsi' => 'Mengisi formulir online.'],
                    ['judul' => 'Proses', 'deskripsi' => 'Petugas memverifikasi kelengkapan.'],
                ],
                'fields' => [
                    ['key' => 'keperluan', 'label' => 'Keperluan', 'type' => 'textarea', 'required' => true],
                ]
            ],
            [
                'kode' => 'SKKEHIDUPAN',
                'nama' => 'Surat Keterangan Masih Hidup',
                'desc' => 'Surat keterangan untuk menyatakan warga bersangkutan masih hidup.',
                'hasil' => 'download',
                'syarat' => ['Fotokopi KTP', 'Fotokopi KK', 'Surat RT/RW'],
                'langkah' => [
                    ['judul' => 'Pengajuan', 'deskripsi' => 'Warga melampirkan berkas secara online.'],
                ],
                'fields' => [
                    ['key' => 'keperluan', 'label' => 'Keperluan', 'type' => 'textarea', 'required' => true],
                ]
            ],
            [
                'kode' => 'SKBELUMNIK',
                'nama' => 'Surat Keterangan Belum Memiliki NIK',
                'desc' => 'Surat keterangan bagi bayi baru lahir atau warga yang belum terdaftar di database kependudukan.',
                'hasil' => 'download',
                'syarat' => ['Surat keterangan lahir', 'Fotokopi KK orang tua', 'Surat RT/RW'],
                'langkah' => [],
                'fields' => [
                    ['key' => 'keperluan', 'label' => 'Keperluan', 'type' => 'textarea', 'required' => true],
                ]
            ],
            [
                'kode' => 'SKWIRASWASTA',
                'nama' => 'Surat Keterangan Usaha/Wiraswasta',
                'desc' => 'Surat keterangan memiliki usaha untuk keperluan perbankan, perizinan, dll.',
                'hasil' => 'download',
                'syarat' => ['Fotokopi KTP', 'Fotokopi KK', 'Foto bukti usaha', 'Surat pengantar RT/RW'],
                'langkah' => [],
                'fields' => [
                    ['key' => 'nama_usaha', 'label' => 'Nama Usaha', 'type' => 'text', 'required' => true],
                    ['key' => 'jenis_usaha', 'label' => 'Jenis Usaha', 'type' => 'text', 'required' => true],
                    ['key' => 'alamat_usaha', 'label' => 'Alamat Usaha', 'type' => 'textarea', 'required' => true],
                    ['key' => 'pendapatan', 'label' => 'Perkiraan Pendapatan / Bulan (Rp)', 'type' => 'text', 'required' => true],
                    ['key' => 'keperluan', 'label' => 'Keperluan', 'type' => 'textarea', 'required' => true],
                ]
            ],
            [
                'kode' => 'SKPINDAH',
                'nama' => 'Surat Keterangan Pindah',
                'desc' => 'Surat keterangan kepindahan alamat tempat tinggal warga.',
                'hasil' => 'download',
                'syarat' => ['Fotokopi KTP', 'Fotokopi KK', 'Surat RT/RW'],
                'langkah' => [],
                'fields' => [
                    ['key' => 'alamat_tujuan', 'label' => 'Alamat Tujuan Lengkap', 'type' => 'textarea', 'required' => true],
                    ['key' => 'kel_tujuan', 'label' => 'Kelurahan/Desa Tujuan', 'type' => 'text', 'required' => true],
                    ['key' => 'kec_tujuan', 'label' => 'Kecamatan Tujuan', 'type' => 'text', 'required' => true],
                    ['key' => 'kota_tujuan', 'label' => 'Kota/Kabupaten Tujuan', 'type' => 'text', 'required' => true],
                    ['key' => 'alasan_pindah', 'label' => 'Alasan Pindah', 'type' => 'textarea', 'required' => true],
                ]
            ],
            [
                'kode' => 'SKKEMATIAN',
                'nama' => 'Surat Keterangan Kematian',
                'desc' => 'Surat keterangan kematian warga yang memerlukan pencatatan sipil.',
                'hasil' => 'pickup',
                'syarat' => ['Surat keterangan dokter/RS', 'KTP almarhum/ah', 'KK', 'Surat RT/RW'],
                'langkah' => [
                    ['judul' => 'Pengajuan Online', 'deskripsi' => 'Mengisi data kematian dan mengunggah berkas.'],
                    ['judul' => 'Verifikasi Staf', 'deskripsi' => 'Petugas kelurahan memproses data kematian.'],
                    ['judul' => 'Ambil Hasil', 'deskripsi' => 'Datang ke kelurahan untuk menandatangani dan mengambil surat fisik.'],
                ],
                'fields' => [
                    ['key' => 'nama_alm', 'label' => 'Nama Almarhum/ah', 'type' => 'text', 'required' => true],
                    ['key' => 'tempat_lahir_alm', 'label' => 'Tempat Lahir', 'type' => 'text', 'required' => true],
                    ['key' => 'tgl_lahir_alm', 'label' => 'Tanggal Lahir', 'type' => 'date', 'required' => true],
                    ['key' => 'nik_alm', 'label' => 'NIK Almarhum/ah', 'type' => 'text', 'required' => true],
                    ['key' => 'agama_alm', 'label' => 'Agama', 'type' => 'select', 'options' => ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'], 'required' => true],
                    ['key' => 'tgl_meninggal', 'label' => 'Tanggal Meninggal', 'type' => 'date', 'required' => true],
                    ['key' => 'tempat_meninggal', 'label' => 'Tempat Meninggal', 'type' => 'text', 'required' => true],
                    ['key' => 'sebab_kematian', 'label' => 'Sebab Kematian', 'type' => 'text', 'required' => true],
                    ['key' => 'alamat_alm', 'label' => 'Alamat Terakhir', 'type' => 'textarea', 'required' => true],
                    ['key' => 'keperluan', 'label' => 'Keperluan', 'type' => 'textarea', 'required' => true],
                ]
            ],
            [
                'kode' => 'SKKELAHIRAN',
                'nama' => 'Surat Keterangan Kelahiran',
                'desc' => 'Surat pengantar untuk mendaftarkan akta kelahiran baru.',
                'hasil' => 'pickup',
                'syarat' => ['Surat lahir RS/bidan', 'KTP orang tua', 'KK', 'Buku nikah'],
                'langkah' => [],
                'fields' => [
                    ['key' => 'nama_anak', 'label' => 'Nama Anak', 'type' => 'text', 'required' => true],
                    ['key' => 'jk_anak', 'label' => 'Jenis Kelamin Anak', 'type' => 'select', 'options' => ['Laki-laki', 'Perempuan'], 'required' => true],
                    ['key' => 'tempat_lahir_anak', 'label' => 'Tempat Lahir', 'type' => 'text', 'required' => true],
                    ['key' => 'tgl_lahir_anak', 'label' => 'Tanggal Lahir', 'type' => 'date', 'required' => true],
                    ['key' => 'nama_ayah', 'label' => 'Nama Ayah', 'type' => 'text', 'required' => true],
                    ['key' => 'nama_ibu', 'label' => 'Nama Ibu', 'type' => 'text', 'required' => true],
                    ['key' => 'keperluan', 'label' => 'Keperluan', 'type' => 'textarea', 'required' => true],
                ]
            ],
            [
                'kode' => 'SKGAJISWASTA',
                'nama' => 'Surat Keterangan Penghasilan (Swasta)',
                'desc' => 'Surat keterangan slip gaji/penghasilan bagi karyawan swasta.',
                'hasil' => 'download',
                'syarat' => ['KTP', 'KK', 'Surat slip gaji kantor/RT/RW'],
                'langkah' => [],
                'fields' => [
                    ['key' => 'pekerjaan', 'label' => 'Pekerjaan Detail', 'type' => 'text', 'required' => true],
                    ['key' => 'penghasilan', 'label' => 'Jumlah Penghasilan / Bulan (Rp)', 'type' => 'text', 'required' => true],
                    ['key' => 'keperluan', 'label' => 'Keperluan', 'type' => 'textarea', 'required' => true],
                ]
            ],
            [
                'kode' => 'SKGAJIPNS',
                'nama' => 'Surat Keterangan Penghasilan (PNS)',
                'desc' => 'Surat keterangan slip gaji bagi PNS/TNI/Polri.',
                'hasil' => 'download',
                'syarat' => ['KTP', 'KK', 'Slip gaji terakhir'],
                'langkah' => [],
                'fields' => [
                    ['key' => 'nip', 'label' => 'NIP / NPT', 'type' => 'text', 'required' => true],
                    ['key' => 'pangkat', 'label' => 'Pangkat / Golongan', 'type' => 'text', 'required' => true],
                    ['key' => 'jabatan', 'label' => 'Jabatan', 'type' => 'text', 'required' => true],
                    ['key' => 'instansi', 'label' => 'Instansi Kerja', 'type' => 'text', 'required' => true],
                    ['key' => 'penghasilan', 'label' => 'Gaji Pokok / Bulan (Rp)', 'type' => 'text', 'required' => true],
                    ['key' => 'keperluan', 'label' => 'Keperluan', 'type' => 'textarea', 'required' => true],
                ]
            ],
            [
                'kode' => 'SKPEMILIKAN',
                'nama' => 'Surat Keterangan Pemilikan Tanah',
                'desc' => 'Surat pengantar kepemilikan hak atas tanah.',
                'hasil' => 'pickup',
                'syarat' => ['Fotokopi KTP', 'Fotokopi KK', 'Bukti sertifikat/girik', 'Surat RT/RW'],
                'langkah' => [],
                'fields' => [
                    ['key' => 'lokasi_tanah', 'label' => 'Lokasi/Alamat Tanah', 'type' => 'textarea', 'required' => true],
                    ['key' => 'luas_tanah', 'label' => 'Luas Tanah (m2)', 'type' => 'text', 'required' => true],
                    ['key' => 'batas_utara', 'label' => 'Batas Sebelah Utara', 'type' => 'text', 'required' => true],
                    ['key' => 'batas_selatan', 'label' => 'Batas Sebelah Selatan', 'type' => 'text', 'required' => true],
                    ['key' => 'batas_timur', 'label' => 'Batas Sebelah Timur', 'type' => 'text', 'required' => true],
                    ['key' => 'batas_barat', 'label' => 'Batas Sebelah Barat', 'type' => 'text', 'required' => true],
                    ['key' => 'keperluan', 'label' => 'Keperluan', 'type' => 'textarea', 'required' => true],
                ]
            ],
            [
                'kode' => 'N1',
                'nama' => 'Surat Keterangan Untuk Nikah (N1)',
                'desc' => 'Formulir resmi kelurahan untuk pendaftaran nikah warga di KUA.',
                'hasil' => 'pickup',
                'syarat' => ['KTP', 'KK', 'Surat RT/RW', 'Pasfoto background biru'],
                'langkah' => [],
                'fields' => [
                    ['key' => 'calon_pasangan', 'label' => 'Nama Calon Pasangan', 'type' => 'text', 'required' => true],
                    ['key' => 'keperluan', 'label' => 'Keperluan', 'type' => 'textarea', 'required' => true],
                ]
            ],
            [
                'kode' => 'N2',
                'nama' => 'Surat Keterangan Asal Usul (N2)',
                'desc' => 'Surat keterangan asal usul orang tua pengantin.',
                'hasil' => 'pickup',
                'syarat' => ['KTP', 'KK', 'Buku nikah orang tua'],
                'langkah' => [],
                'fields' => [
                    ['key' => 'keperluan', 'label' => 'Keperluan', 'type' => 'textarea', 'required' => true],
                ]
            ],
            [
                'kode' => 'N4',
                'nama' => 'Surat Keterangan Tentang Orang Tua (N4)',
                'desc' => 'Surat keterangan mengenai identitas orang tua kandung pengantin.',
                'hasil' => 'pickup',
                'syarat' => ['KTP orang tua', 'KK'],
                'langkah' => [],
                'fields' => [
                    ['key' => 'keperluan', 'label' => 'Keperluan', 'type' => 'textarea', 'required' => true],
                ]
            ],
            [
                'kode' => 'PENGANTARSKCK',
                'nama' => 'Surat Pengantar SKCK',
                'desc' => 'Surat pengantar untuk pembuatan SKCK di Polsek/Polres.',
                'hasil' => 'download',
                'syarat' => ['KTP', 'KK', 'Surat RT/RW'],
                'langkah' => [],
                'fields' => [
                    ['key' => 'keperluan', 'label' => 'Keperluan', 'type' => 'textarea', 'required' => true],
                ]
            ],
            [
                'kode' => 'PENGANTAR',
                'nama' => 'Surat Pengantar (Umum)',
                'desc' => 'Surat pengantar umum untuk keperluan administrasi lainnya.',
                'hasil' => 'download',
                'syarat' => ['KTP', 'KK', 'Surat RT/RW'],
                'langkah' => [],
                'fields' => [
                    ['key' => 'keperluan', 'label' => 'Keperluan', 'type' => 'textarea', 'required' => true],
                ]
            ]
        ];

        foreach ($services as $srv) {
            Pelayanan::create([
                'nama_surat' => $srv['nama'],
                'kode_surat' => $srv['kode'],
                'deskripsi' => $srv['desc'],
                'estimasi_hari' => 1,
                'metode_pengajuan' => 'online',
                'metode_hasil' => $srv['hasil'],
                'status' => 'aktif',
                'syarat' => $srv['syarat'],
                'langkah' => $srv['langkah'],
                'form_fields' => $srv['fields'],
                'teks_tombol' => 'Ajukan Sekarang',
                'jam_pelayanan' => 'Senin - Jumat (08:00 - 15:00)',
                'lokasi' => 'Kantor Kelurahan Duren Mekar',
                'biaya' => 'Gratis',
            ]);
        }
    }
}
