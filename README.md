# Sistem Informasi Kelurahan Duren Mekar

## Deskripsi

Sistem Informasi Kelurahan Duren Mekar merupakan aplikasi berbasis web yang dibangun menggunakan Laravel untuk membantu digitalisasi pelayanan administrasi kelurahan. Sistem ini menyediakan layanan informasi publik, pengelolaan pengaduan masyarakat, pengajuan surat online, pengelolaan berita, pengumuman, agenda kegiatan, galeri, serta manajemen pengguna.

## Fitur Utama

### Halaman Publik

* Informasi profil kelurahan
* Berita dan informasi terbaru
* Pengumuman
* Agenda kegiatan
* Galeri foto
* Informasi lembaga kemasyarakatan
* Informasi pelayanan

### Dashboard Warga

* Registrasi dan login warga
* Pengajuan surat secara online
* Pengaduan masyarakat
* Riwayat pengajuan surat
* Monitoring status pengaduan

### Dashboard Staf

* Verifikasi pengajuan surat
* Pengelolaan pengaduan warga
* Pengelolaan pengumuman
* Monitoring aktivitas pelayanan

### Dashboard Admin

* Manajemen pengguna
* Manajemen berita
* Manajemen pengumuman
* Manajemen agenda
* Manajemen galeri
* Manajemen layanan
* Manajemen lembaga kemasyarakatan
* Manajemen RT/RW
* Pengaturan website

---

## Teknologi yang Digunakan

* PHP 8.x
* Laravel 10
* MySQL / MariaDB
* Blade Template
* Bootstrap / CSS Custom
* JavaScript
* Laragon (Development Environment)

---

## Persyaratan Sistem

Pastikan perangkat Anda telah terinstal:

* PHP >= 8.1
* Composer
* MySQL / MariaDB
* Node.js & NPM
* Git

---

## Cara Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/Yorichi154/KelurahanDurenMekar.git
```

### 2. Masuk ke Folder Project

```bash
cd KelurahanDurenMekar
```

### 3. Install Dependency PHP

```bash
composer install
```

### 4. Install Dependency Frontend

```bash
npm install
```

### 5. Salin File Environment

```bash
cp .env.example .env
```

Atau pada Windows:

```bash
copy .env.example .env
```

### 6. Generate Application Key

```bash
php artisan key:generate
```

### 7. Konfigurasi Database

Edit file `.env`

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kelurahan
DB_USERNAME=root
DB_PASSWORD=
```

### 8. Jalankan Migrasi Database

```bash
php artisan migrate
```

Jika tersedia seeder:

```bash
php artisan db:seed
```

### 9. Jalankan Server

```bash
php artisan serve
```

Akses aplikasi melalui:

```text
http://127.0.0.1:8000
```

---

## Struktur Hak Akses

### Admin

Memiliki akses penuh terhadap seluruh fitur sistem.

### Staf

Mengelola pengaduan, surat, dan pelayanan masyarakat.

### Warga

Mengajukan surat, membuat pengaduan, dan melihat status layanan.

---

## Kontributor

* Ikmal Ahmad
* Tim Pengembang Sistem Informasi Kelurahan Duren Mekar

---

## Lisensi

Project ini dikembangkan untuk keperluan akademik dan implementasi Sistem Informasi Kelurahan Duren Mekar.
"# Kelurahan2" 
