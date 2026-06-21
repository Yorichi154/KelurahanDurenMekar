<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Faq;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            [
                'category' => 'Umum',
                'question' => 'Apa itu website Kelurahan Duren Mekar?',
                'answer' => 'Website Kelurahan Duren Mekar adalah media informasi dan layanan digital kelurahan yang dapat digunakan warga untuk melihat informasi kelurahan, membaca berita dan pengumuman, melihat layanan, mengajukan surat, serta menyampaikan pengaduan secara online.',
            ],
            [
                'category' => 'Umum',
                'question' => 'Siapa saja yang dapat menggunakan website ini?',
                'answer' => 'Masyarakat umum dapat mengakses informasi publik seperti berita, pengumuman, agenda, galeri, profil kelurahan, dan pelayanan. Untuk fitur pengajuan surat, pengaduan, dan chat dengan staf, pengguna perlu login menggunakan akun warga.',
            ],
            [
                'category' => 'Umum',
                'question' => 'Apakah website ini bisa diakses melalui HP?',
                'answer' => 'Ya. Website dapat diakses melalui browser di HP, laptop, komputer, atau tablet selama perangkat terhubung dengan internet.',
            ],
            [
                'category' => 'Umum',
                'question' => 'Apakah informasi di website ini resmi?',
                'answer' => 'Informasi yang ditampilkan pada website dikelola oleh admin atau staf kelurahan yang memiliki hak akses, sehingga informasi dapat digunakan sebagai rujukan awal layanan kelurahan.',
            ],
            [
                'category' => 'Akun',
                'question' => 'Bagaimana cara membuat akun warga?',
                'answer' => 'Buka halaman register, isi data yang diminta seperti nama, email, password, NIK, nomor telepon, alamat, RT, dan RW jika tersedia, lalu kirim pendaftaran. Setelah berhasil, warga dapat login menggunakan email dan password yang didaftarkan.',
            ],
            [
                'category' => 'Akun',
                'question' => 'Bagaimana cara login ke website?',
                'answer' => 'Buka halaman login, masukkan email dan password yang sudah terdaftar, lalu klik tombol masuk atau login.',
            ],
            [
                'category' => 'Akun',
                'question' => 'Bagaimana jika saya lupa password?',
                'answer' => 'Gunakan fitur lupa password pada halaman login. Ikuti instruksi reset password atau verifikasi OTP sesuai alur yang tersedia pada website.',
            ],
            [
                'category' => 'Akun',
                'question' => 'Apakah data profil warga bisa diubah?',
                'answer' => 'Ya. Setelah login, warga dapat membuka menu profil untuk memperbarui data seperti nama, nomor telepon, alamat, RT, RW, dan informasi lain yang tersedia.',
            ],
            [
                'category' => 'Akun',
                'question' => 'Mengapa saya tidak bisa mengakses dashboard warga?',
                'answer' => 'Pastikan sudah login menggunakan akun dengan role warga. Jika akun belum aktif, role tidak sesuai, atau sesi login sudah berakhir, akses ke dashboard warga dapat ditolak.',
            ],
            [
                'category' => 'Layanan Surat',
                'question' => 'Apa saja layanan surat yang tersedia di website?',
                'answer' => 'Daftar layanan surat dapat dilihat pada menu Pelayanan. Jenis surat yang tersedia bergantung pada data yang diatur oleh admin, seperti surat keterangan tidak mampu, surat keterangan domisili, surat pengantar, surat keterangan usaha, dan layanan administrasi lainnya.',
            ],
            [
                'category' => 'Layanan Surat',
                'question' => 'Bagaimana cara mengajukan surat secara online?',
                'answer' => 'Login sebagai warga, buka menu Surat atau Pelayanan, pilih jenis surat yang ingin diajukan, isi keperluan dan data yang diminta, unggah berkas jika diperlukan, lalu kirim pengajuan.',
            ],
            [
                'category' => 'Layanan Surat',
                'question' => 'Apakah pengajuan surat harus login?',
                'answer' => 'Ya. Pengajuan surat online membutuhkan akun warga agar sistem dapat mencatat identitas pemohon dan menampilkan riwayat pengajuan pada dashboard warga.',
            ],
            [
                'category' => 'Layanan Surat',
                'question' => 'Apa saja status pengajuan surat?',
                'answer' => 'Status pengajuan surat dapat berupa menunggu, diproses, selesai, atau ditolak. Status tersebut diperbarui oleh staf sesuai perkembangan pengajuan.',
            ],
            [
                'category' => 'Layanan Surat',
                'question' => 'Apa arti status surat menunggu?',
                'answer' => 'Status menunggu berarti pengajuan surat sudah masuk ke sistem tetapi belum diproses oleh staf kelurahan.',
            ],
            [
                'category' => 'Layanan Surat',
                'question' => 'Apa arti status surat diproses?',
                'answer' => 'Status diproses berarti pengajuan sedang diperiksa, diverifikasi, atau sedang dibuat oleh staf kelurahan.',
            ],
            [
                'category' => 'Layanan Surat',
                'question' => 'Apa arti status surat selesai?',
                'answer' => 'Status selesai berarti surat sudah selesai diproses. Jika hasil surat tersedia dalam bentuk file, warga dapat mengunduhnya melalui akun masing-masing.',
            ],
            [
                'category' => 'Layanan Surat',
                'question' => 'Apa arti status surat ditolak?',
                'answer' => 'Status ditolak berarti pengajuan tidak dapat diproses, misalnya karena data tidak sesuai, berkas kurang lengkap, atau alasan administratif lainnya.',
            ],
            [
                'category' => 'Layanan Surat',
                'question' => 'Apakah surat bisa diunduh langsung dari website?',
                'answer' => 'Ya. Jika metode hasil surat diatur sebagai download dan staf sudah mengunggah file hasil surat, warga dapat mengunduh surat melalui akun masing-masing.',
            ],
            [
                'category' => 'Layanan Surat',
                'question' => 'Apakah ada surat yang harus diambil langsung ke kantor kelurahan?',
                'answer' => 'Ya, beberapa layanan dapat menggunakan metode pengambilan langsung atau pickup. Jika layanan menggunakan metode tersebut, warga perlu mengikuti informasi pengambilan yang diberikan oleh kelurahan.',
            ],
            [
                'category' => 'Layanan Surat',
                'question' => 'Berapa lama proses pembuatan surat?',
                'answer' => 'Estimasi waktu pemrosesan bergantung pada jenis layanan. Informasi estimasi dapat dilihat pada detail pelayanan jika sudah diatur oleh admin.',
            ],
            [
                'category' => 'Layanan Surat',
                'question' => 'Apakah pengajuan surat dikenakan biaya?',
                'answer' => 'Biaya layanan mengikuti informasi yang tercantum pada detail pelayanan. Jika tertulis gratis atau tidak ada biaya, maka layanan tersebut tidak dikenakan biaya.',
            ],
            [
                'category' => 'Layanan Surat',
                'question' => 'Dokumen apa saja yang harus dilampirkan saat mengajukan surat?',
                'answer' => 'Persyaratan dokumen berbeda untuk setiap jenis layanan. Warga dapat melihat daftar syarat pada halaman detail pelayanan sebelum mengajukan surat.',
            ],
            [
                'category' => 'Pengaduan',
                'question' => 'Bagaimana cara membuat pengaduan?',
                'answer' => 'Login sebagai warga, buka menu Pengaduan, isi judul, isi pengaduan, kategori, lokasi, dan lampiran jika ada, lalu kirim pengaduan.',
            ],
            [
                'category' => 'Pengaduan',
                'question' => 'Apakah pengaduan bisa dilengkapi dengan foto?',
                'answer' => 'Ya. Warga dapat melampirkan file seperti JPG, JPEG, PNG, atau PDF jika tersedia pada form pengaduan.',
            ],
            [
                'category' => 'Pengaduan',
                'question' => 'Apa saja status pengaduan?',
                'answer' => 'Status pengaduan dapat berupa menunggu, diproses, selesai, atau ditolak. Status diperbarui oleh staf sesuai tindak lanjut pengaduan.',
            ],
            [
                'category' => 'Pengaduan',
                'question' => 'Apa arti status pengaduan menunggu?',
                'answer' => 'Status menunggu berarti pengaduan sudah diterima oleh sistem tetapi belum ditangani oleh staf.',
            ],
            [
                'category' => 'Pengaduan',
                'question' => 'Apa arti status pengaduan diproses?',
                'answer' => 'Status diproses berarti pengaduan sedang ditindaklanjuti oleh staf atau pihak terkait.',
            ],
            [
                'category' => 'Pengaduan',
                'question' => 'Apa arti status pengaduan selesai?',
                'answer' => 'Status selesai berarti pengaduan sudah ditangani atau telah mendapatkan tindak lanjut.',
            ],
            [
                'category' => 'Pengaduan',
                'question' => 'Apakah saya bisa melihat riwayat pengaduan saya?',
                'answer' => 'Ya. Warga yang login dapat melihat daftar pengaduan yang pernah dibuat melalui menu Pengaduan.',
            ],
            [
                'category' => 'Pengaduan',
                'question' => 'Apakah staf bisa mengirim bukti tindak lanjut pengaduan?',
                'answer' => 'Ya. Sistem menyediakan fitur upload foto atau file tindak lanjut oleh staf ketika memperbarui status pengaduan.',
            ],
            [
                'category' => 'Chat',
                'question' => 'Apakah warga bisa berkomunikasi dengan staf melalui website?',
                'answer' => 'Ya. Website menyediakan fitur chat antara warga dan staf untuk membantu komunikasi terkait layanan atau kebutuhan informasi.',
            ],
            [
                'category' => 'Chat',
                'question' => 'Apakah chat hanya bisa digunakan setelah login?',
                'answer' => 'Ya. Fitur chat membutuhkan akun pengguna agar percakapan dapat dikaitkan dengan warga dan staf yang bersangkutan.',
            ],
            [
                'category' => 'Informasi Publik',
                'question' => 'Apa isi menu Berita?',
                'answer' => 'Menu Berita berisi informasi atau artikel terbaru yang dipublikasikan oleh kelurahan.',
            ],
            [
                'category' => 'Informasi Publik',
                'question' => 'Apa isi menu Pengumuman?',
                'answer' => 'Menu Pengumuman berisi pemberitahuan resmi seperti informasi kegiatan, jadwal pelayanan, kebijakan, atau informasi penting lainnya.',
            ],
            [
                'category' => 'Informasi Publik',
                'question' => 'Apa isi menu Agenda?',
                'answer' => 'Menu Agenda menampilkan jadwal kegiatan kelurahan, termasuk tanggal, waktu, lokasi, dan deskripsi kegiatan.',
            ],
            [
                'category' => 'Informasi Publik',
                'question' => 'Apa isi menu Galeri?',
                'answer' => 'Menu Galeri menampilkan dokumentasi foto atau media kegiatan kelurahan.',
            ],
            [
                'category' => 'Informasi Publik',
                'question' => 'Apa isi menu Profil Kelurahan?',
                'answer' => 'Menu Profil Kelurahan berisi informasi umum seperti nama kelurahan, visi, misi, profil, alamat, kontak, wilayah, jumlah penduduk, jumlah RT/RW, dan data pendukung lainnya.',
            ],
            [
                'category' => 'Informasi Publik',
                'question' => 'Apa isi menu Struktur Organisasi?',
                'answer' => 'Menu Struktur Organisasi menampilkan susunan pejabat atau perangkat kelurahan sesuai data yang diinput oleh admin.',
            ],
            [
                'category' => 'Informasi Publik',
                'question' => 'Apa isi menu RT/RW?',
                'answer' => 'Menu RT/RW menampilkan daftar RT dan RW, nama ketua, alamat, dan kontak jika tersedia.',
            ],
            [
                'category' => 'Informasi Publik',
                'question' => 'Apa isi menu Lembaga Kemasyarakatan?',
                'answer' => 'Menu Lembaga Kemasyarakatan berisi informasi lembaga seperti PKK, Karang Taruna, LPMK, RT, RW, atau lembaga lain yang ada di lingkungan kelurahan.',
            ],
            [
                'category' => 'Informasi Publik',
                'question' => 'Apa isi menu Unit Kerja?',
                'answer' => 'Menu Unit Kerja berisi informasi unit atau bagian kerja kelurahan, termasuk nama unit, pimpinan, kontak, tugas, dan kewenangan.',
            ],
            [
                'category' => 'Admin & Staf',
                'question' => 'Siapa yang dapat mengelola konten website?',
                'answer' => 'Konten website dikelola oleh pengguna dengan role admin atau staf sesuai hak akses masing-masing.',
            ],
            [
                'category' => 'Admin & Staf',
                'question' => 'Apa saja yang dapat dikelola admin?',
                'answer' => 'Admin dapat mengelola pengguna, berita, pengumuman, agenda, galeri, pelayanan, FAQ, RT/RW, lembaga, unit kerja, struktur organisasi, pengaturan kelurahan, surat, pengaduan, dan laporan.',
            ],
            [
                'category' => 'Admin & Staf',
                'question' => 'Apa tugas staf pada sistem?',
                'answer' => 'Staf dapat memproses pengajuan surat, mengelola pengaduan, memperbarui status, mengunggah hasil surat, membuat surat, melihat arsip surat, dan berkomunikasi dengan warga melalui chat.',
            ],
            [
                'category' => 'Admin & Staf',
                'question' => 'Apakah admin bisa menambah jenis layanan surat?',
                'answer' => 'Ya. Admin dapat menambah atau mengubah data pelayanan atau jenis surat, termasuk syarat, langkah, estimasi, biaya, metode pengajuan, metode hasil, dan template surat.',
            ],
            [
                'category' => 'Admin & Staf',
                'question' => 'Apakah data laporan bisa diekspor?',
                'answer' => 'Ya. Sistem menyediakan fitur laporan dan ekspor data dalam beberapa format seperti CSV, PDF, dan DOCX.',
            ],
            [
                'category' => 'Teknis',
                'question' => 'Mengapa gambar atau file tidak muncul?',
                'answer' => 'Pastikan file sudah tersimpan dengan benar dan storage link Laravel sudah dibuat. Pada Laravel biasanya dapat diperbaiki dengan menjalankan perintah php artisan storage:link.',
            ],
            [
                'category' => 'Teknis',
                'question' => 'Mengapa muncul error folder session tidak ditemukan?',
                'answer' => 'Error tersebut biasanya terjadi karena folder storage/framework/sessions belum ada atau tidak bisa ditulis. Buat folder tersebut dan pastikan folder storage memiliki izin tulis.',
            ],
            [
                'category' => 'Teknis',
                'question' => 'Mengapa pengajuan gagal dikirim?',
                'answer' => 'Pengajuan dapat gagal jika data wajib belum lengkap, format file tidak sesuai, ukuran file terlalu besar, koneksi bermasalah, atau akun tidak memiliki hak akses yang sesuai.',
            ],
            [
                'category' => 'Teknis',
                'question' => 'Mengapa saya tidak bisa membuka halaman admin atau staf?',
                'answer' => 'Halaman admin hanya dapat diakses oleh akun admin, sedangkan halaman staf hanya dapat diakses oleh akun staf. Jika role akun tidak sesuai, sistem akan menolak akses.',
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::updateOrCreate(
                ['question' => $faq['question']],
                [
                    'answer' => $faq['answer'],
                    'category' => $faq['category'],
                ]
            );
        }
    }
}
