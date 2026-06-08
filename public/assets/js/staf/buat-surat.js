// ===================================================================
// buat-surat.js — SiSurat: Fitur Pembuatan Surat Otomatis (Staf)
// ===================================================================

const CSRF = () => document.querySelector('meta[name="csrf-token"]')?.content;

// ── Konfigurasi Jenis Surat & Field Form ──────────────────────────
const SURAT_CONFIG = {
  SKTM: {
    kode: 'SKTM', nama: 'Surat Keterangan Tidak Mampu', icon: 'fa-hand-holding-heart', color: '#ef4444',
    checklist: ['Fotokopi KTP', 'Fotokopi KK', 'Surat RT/RW', 'Keterangan penghasilan'],
    fields: [
      ...fieldsPemohon(),
      { id: 'keperluan', label: 'Keperluan', type: 'textarea', required: true, placeholder: 'Beasiswa, BPJS, dll.' },
    ]
  },
  SKDOM: {
    kode: 'SKDOM', nama: 'Surat Keterangan Domisili', icon: 'fa-house-chimney', color: '#3b82f6',
    checklist: ['Fotokopi KTP', 'Fotokopi KK', 'Surat RT/RW'],
    fields: [
      ...fieldsPemohon(),
      { id: 'jenis_domisili', label: 'Jenis Domisili', type: 'select', required: true, options: ['tetap', 'sementara'] },
      { id: 'sejak_tahun', label: 'Berdomisili Sejak Tahun', type: 'text', required: true, placeholder: '2015' },
      { id: 'keperluan', label: 'Keperluan', type: 'textarea', required: true, placeholder: 'Keperluan pengajuan domisili...' },
    ]
  },
  SKDM: {
    kode: 'SKDM', nama: 'Surat Keterangan Domisili Menetap', icon: 'fa-location-dot', color: '#06b6d4',
    checklist: ['Fotokopi KTP', 'Fotokopi KK', 'Surat RT/RW'],
    fields: [
      ...fieldsPemohon(),
      { id: 'sejak_tahun', label: 'Menetap Sejak Tahun', type: 'text', required: true, placeholder: '2015' },
      { id: 'keperluan', label: 'Keperluan', type: 'textarea', required: true },
    ]
  },
  SKKEHIDUPAN: {
    kode: 'SKKEHIDUPAN', nama: 'Surat Keterangan Masih Hidup', icon: 'fa-heart-pulse', color: '#22c55e',
    checklist: ['Fotokopi KTP', 'Fotokopi KK', 'Datang langsung ke kelurahan'],
    fields: [
      ...fieldsPemohon(),
      { id: 'keperluan', label: 'Keperluan', type: 'textarea', required: true, placeholder: 'Pencairan pensiun, BPJS, dll.' },
    ]
  },
  SKBELUMNIK: {
    kode: 'SKBELUMNIK', nama: 'Surat Keterangan Belum Memiliki NIK', icon: 'fa-id-card', color: '#f59e0b',
    checklist: ['Surat keterangan lahir', 'Fotokopi KK orang tua', 'Surat RT/RW'],
    fields: [
      ...fieldsPemohon(false), // no NIK field
      { id: 'keperluan', label: 'Keperluan', type: 'textarea', required: true },
    ]
  },
  SKWIRASWASTA: {
    kode: 'SKWIRASWASTA', nama: 'Surat Keterangan Usaha/Wiraswasta', icon: 'fa-store', color: '#8b5cf6',
    checklist: ['Fotokopi KTP', 'Fotokopi KK', 'Bukti usaha (foto/nota)', 'Surat RT/RW'],
    fields: [
      ...fieldsPemohon(),
      { id: 'nama_usaha', label: 'Nama Usaha', type: 'text', required: true, placeholder: 'Warung Pak Budi' },
      { id: 'jenis_usaha', label: 'Jenis Usaha', type: 'text', required: true, placeholder: 'Warung makan, konveksi, dll.' },
      { id: 'alamat_usaha', label: 'Alamat Usaha', type: 'textarea', required: true },
      { id: 'pendapatan', label: 'Perkiraan Pendapatan / Bulan (Rp)', type: 'text', required: true, placeholder: '2.000.000' },
      { id: 'keperluan', label: 'Keperluan', type: 'textarea', required: true },
    ]
  },
  SKPINDAH: {
    kode: 'SKPINDAH', nama: 'Surat Keterangan Pindah', icon: 'fa-truck-moving', color: '#f97316',
    checklist: ['Fotokopi KTP', 'Fotokopi KK', 'Surat RT/RW'],
    fields: [
      ...fieldsPemohon(),
      { id: 'alamat_tujuan', label: 'Alamat Tujuan Lengkap', type: 'textarea', required: true },
      { id: 'kel_tujuan', label: 'Kelurahan/Desa Tujuan', type: 'text', required: true },
      { id: 'kec_tujuan', label: 'Kecamatan Tujuan', type: 'text', required: true },
      { id: 'kota_tujuan', label: 'Kota/Kabupaten Tujuan', type: 'text', required: true },
      { id: 'alasan_pindah', label: 'Alasan Pindah', type: 'textarea', required: true },
    ]
  },
  SKKEMATIAN: {
    kode: 'SKKEMATIAN', nama: 'Surat Keterangan Kematian', icon: 'fa-book', color: '#64748b',
    checklist: ['Surat keterangan dokter/RS', 'Fotokopi KTP almarhum/ah', 'Fotokopi KK', 'Surat RT/RW'],
    fields: [
      { id: 'nama_alm', label: 'Nama Almarhum/ah', type: 'text', required: true },
      { id: 'tempat_lahir_alm', label: 'Tempat Lahir', type: 'text', required: true },
      { id: 'tgl_lahir_alm', label: 'Tanggal Lahir', type: 'date', required: true },
      { id: 'nik_alm', label: 'NIK Almarhum/ah', type: 'text', required: true, placeholder: '16 digit' },
      { id: 'agama_alm', label: 'Agama', type: 'select', required: true, options: ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'] },
      { id: 'tgl_meninggal', label: 'Tanggal Meninggal', type: 'date', required: true },
      { id: 'tempat_meninggal', label: 'Tempat Meninggal', type: 'text', required: true, placeholder: 'RS, rumah, dll.' },
      { id: 'sebab_kematian', label: 'Sebab Kematian', type: 'text', required: true, placeholder: 'Sakit, kecelakaan, dll.' },
      { id: 'alamat_alm', label: 'Alamat Terakhir', type: 'textarea', required: true },
      { id: 'keperluan', label: 'Keperluan', type: 'textarea', required: true },
    ]
  },
  SKKELAHIRAN: {
    kode: 'SKKELAHIRAN', nama: 'Surat Keterangan Kelahiran', icon: 'fa-baby', color: '#ec4899',
    checklist: ['Surat keterangan lahir dari RS/bidan', 'Fotokopi KTP orang tua', 'Fotokopi KK', 'Buku nikah'],
    fields: [
      { id: 'nama_anak', label: 'Nama Anak', type: 'text', required: true },
      { id: 'jk_anak', label: 'Jenis Kelamin Anak', type: 'select', required: true, options: ['Laki-laki', 'Perempuan'] },
      { id: 'tempat_lahir_anak', label: 'Tempat Lahir', type: 'text', required: true },
      { id: 'tgl_lahir_anak', label: 'Tanggal Lahir', type: 'date', required: true },
      { id: 'nama_ayah', label: 'Nama Ayah', type: 'text', required: true },
      { id: 'nama_ibu', label: 'Nama Ibu', type: 'text', required: true },
      { id: 'alamat_ortu', label: 'Alamat Orang Tua', type: 'textarea', required: true },
      { id: 'keperluan', label: 'Keperluan', type: 'textarea', required: true },
    ]
  },
  SKGAJISWASTA: {
    kode: 'SKGAJISWASTA', nama: 'Surat Keterangan Penghasilan (Swasta)', icon: 'fa-briefcase', color: '#0ea5e9',
    checklist: ['Fotokopi KTP', 'Fotokopi KK', 'Slip gaji / bukti penghasilan', 'Surat RT/RW'],
    fields: [
      ...fieldsPemohon(),
      { id: 'jabatan', label: 'Jabatan', type: 'text', required: true, placeholder: 'Karyawan, supervisor, dll.' },
      { id: 'nama_perusahaan', label: 'Nama Perusahaan', type: 'text', required: true },
      { id: 'penghasilan', label: 'Penghasilan / Bulan (Rp)', type: 'text', required: true, placeholder: '4.500.000' },
      { id: 'keperluan', label: 'Keperluan', type: 'textarea', required: true },
    ]
  },
  SKGAJIPNS: {
    kode: 'SKGAJIPNS', nama: 'Surat Keterangan Penghasilan (PNS)', icon: 'fa-building-columns', color: '#6366f1',
    checklist: ['Fotokopi KTP', 'Fotokopi KK', 'Fotokopi SK PNS', 'Slip gaji terakhir'],
    fields: [
      ...fieldsPemohon(),
      { id: 'instansi', label: 'Nama Instansi', type: 'text', required: true, placeholder: 'Dinas Pendidikan Kota Depok' },
      { id: 'golongan', label: 'Golongan', type: 'text', required: true, placeholder: 'III/a' },
      { id: 'penghasilan', label: 'Penghasilan / Bulan (Rp)', type: 'text', required: true, placeholder: '6.000.000' },
      { id: 'keperluan', label: 'Keperluan', type: 'textarea', required: true },
    ]
  },
  SKPEMILIKAN: {
    kode: 'SKPEMILIKAN', nama: 'Surat Keterangan Pemilikan Tanah', icon: 'fa-map', color: '#84cc16',
    checklist: ['Fotokopi KTP', 'Fotokopi KK', 'Bukti kepemilikan tanah (girik/SHM)', 'Surat RT/RW'],
    fields: [
      ...fieldsPemohon(),
      { id: 'luas_tanah', label: 'Luas Tanah (m²)', type: 'text', required: true, placeholder: '120' },
      { id: 'lokasi_tanah', label: 'Lokasi/Alamat Tanah', type: 'textarea', required: true },
      { id: 'bukti_kepemilikan', label: 'Jenis Bukti Kepemilikan', type: 'text', required: true, placeholder: 'Girik, AJB, SHM' },
      { id: 'no_sertifikat', label: 'Nomor Sertifikat/Girik', type: 'text', required: false, placeholder: 'Opsional' },
      { id: 'keperluan', label: 'Keperluan', type: 'textarea', required: true },
    ]
  },
  SKTIDAKBUTA: {
    kode: 'SKTIDAKBUTA', nama: 'Surat Keterangan Tidak Buta Huruf', icon: 'fa-book-open', color: '#14b8a6',
    checklist: ['Fotokopi KTP', 'Surat RT/RW'],
    fields: [
      ...fieldsPemohon(),
      { id: 'keperluan', label: 'Keperluan', type: 'textarea', required: true },
    ]
  },
  SKSENGKETA: {
    kode: 'SKSENGKETA', nama: 'Surat Keterangan Bebas Sengketa', icon: 'fa-gavel', color: '#a855f7',
    checklist: ['Fotokopi KTP', 'Fotokopi KK', 'Bukti kepemilikan tanah/bangunan', 'Surat RT/RW'],
    fields: [
      ...fieldsPemohon(),
      { id: 'alamat_tanah', label: 'Lokasi Tanah/Bangunan', type: 'textarea', required: true },
      { id: 'keperluan', label: 'Keperluan', type: 'textarea', required: true },
    ]
  },
  SKBERSIH: {
    kode: 'SKBERSIH', nama: 'Surat Keterangan Berkelakuan Baik', icon: 'fa-shield-halved', color: '#22c55e',
    checklist: ['Fotokopi KTP', 'Fotokopi KK', 'Pas foto 3x4 (2 lembar)', 'Surat RT/RW'],
    fields: [
      ...fieldsPemohon(),
      { id: 'keperluan', label: 'Keperluan', type: 'textarea', required: true, placeholder: 'Melamar kerja, pendaftaran, dll.' },
    ]
  },
  N1: {
    kode: 'N1', nama: 'Surat Keterangan Untuk Nikah (N1)', icon: 'fa-rings-wedding', color: '#f43f5e',
    checklist: ['Fotokopi KTP', 'Fotokopi KK', 'Pas foto 2x3 (4 lembar)', 'Akta kelahiran', 'Ijazah terakhir', 'Surat RT/RW'],
    fields: [
      ...fieldsPemohon(),
      { id: 'nama_pasangan', label: 'Nama Calon Pasangan', type: 'text', required: true },
      { id: 'ttl_pasangan', label: 'Tempat/Tgl Lahir Calon Pasangan', type: 'text', required: true, placeholder: 'Depok, 1 Januari 1995' },
      { id: 'nik_pasangan', label: 'NIK Calon Pasangan', type: 'text', required: true },
      { id: 'alamat_pasangan', label: 'Alamat Calon Pasangan', type: 'textarea', required: true },
      { id: 'rencana_nikah', label: 'Rencana Tanggal Pernikahan', type: 'date', required: true },
    ]
  },
  N2: {
    kode: 'N2', nama: 'Surat Keterangan Asal Usul (N2)', icon: 'fa-family', color: '#f43f5e',
    checklist: ['Fotokopi KTP', 'Fotokopi KK', 'Akta kelahiran', 'Buku nikah orang tua'],
    fields: [
      ...fieldsPemohon(),
      { id: 'nama_ayah', label: 'Nama Ayah', type: 'text', required: true },
      { id: 'nama_ibu', label: 'Nama Ibu', type: 'text', required: true },
      { id: 'alamat_ortu', label: 'Alamat Orang Tua', type: 'textarea', required: true },
      { id: 'status_ortu', label: 'Status Perkawinan Orang Tua', type: 'select', required: true, options: ['Menikah', 'Cerai hidup', 'Cerai mati'] },
    ]
  },
  N4: {
    kode: 'N4', nama: 'Surat Keterangan Tentang Orang Tua (N4)', icon: 'fa-people-roof', color: '#f43f5e',
    checklist: ['Fotokopi KK', 'Fotokopi KTP Ayah', 'Fotokopi KTP Ibu', 'Buku nikah orang tua'],
    fields: [
      { id: 'nama_ayah', label: 'Nama Ayah', type: 'text', required: true },
      { id: 'ttl_ayah', label: 'Tempat/Tgl Lahir Ayah', type: 'text', required: true, placeholder: 'Jakarta, 1 Maret 1965' },
      { id: 'pekerjaan_ayah', label: 'Pekerjaan Ayah', type: 'text', required: true },
      { id: 'nama_ibu', label: 'Nama Ibu', type: 'text', required: true },
      { id: 'ttl_ibu', label: 'Tempat/Tgl Lahir Ibu', type: 'text', required: true, placeholder: 'Depok, 5 Mei 1970' },
      { id: 'pekerjaan_ibu', label: 'Pekerjaan Ibu', type: 'text', required: true },
      { id: 'alamat_ortu', label: 'Alamat Orang Tua', type: 'textarea', required: true },
    ]
  },
  PENGANTAR: {
    kode: 'PENGANTAR', nama: 'Surat Pengantar (Umum)', icon: 'fa-envelope-open-text', color: '#6b7280',
    checklist: ['Fotokopi KTP', 'Surat RT/RW'],
    fields: [
      ...fieldsPemohon(),
      { id: 'tujuan_instansi', label: 'Tujuan Instansi', type: 'text', required: true, placeholder: 'Kantor Kecamatan Bojongsari' },
      { id: 'keperluan', label: 'Keperluan', type: 'textarea', required: true },
    ]
  },
  PENGANTARSKCK: {
    kode: 'PENGANTARSKCK', nama: 'Surat Pengantar SKCK', icon: 'fa-shield-heart', color: '#dc2626',
    checklist: ['Fotokopi KTP', 'Fotokopi KK', 'Pas foto 4x6 (6 lembar, background merah)', 'Surat RT/RW'],
    fields: [
      ...fieldsPemohon(),
      { id: 'keperluan', label: 'Keperluan SKCK', type: 'textarea', required: true, placeholder: 'Melamar kerja, administrasi, dll.' },
    ]
  },
  PENGANTARPINDAH: {
    kode: 'PENGANTARPINDAH', nama: 'Surat Pengantar Pindah', icon: 'fa-right-from-bracket', color: '#f97316',
    checklist: ['Fotokopi KTP', 'Fotokopi KK', 'Surat RT/RW'],
    fields: [
      ...fieldsPemohon(),
      { id: 'alamat_tujuan', label: 'Alamat Tujuan Lengkap', type: 'textarea', required: true },
      { id: 'kel_tujuan', label: 'Kelurahan/Desa Tujuan', type: 'text', required: true },
      { id: 'kec_tujuan', label: 'Kecamatan Tujuan', type: 'text', required: true },
      { id: 'kota_tujuan', label: 'Kota/Kabupaten Tujuan', type: 'text', required: true },
    ]
  },
  REKOMENDASI: {
    kode: 'REKOMENDASI', nama: 'Surat Rekomendasi', icon: 'fa-star', color: '#eab308',
    checklist: ['Fotokopi KTP', 'Fotokopi KK', 'Surat RT/RW'],
    fields: [
      ...fieldsPemohon(),
      { id: 'keperluan', label: 'Hal yang Direkomendasikan', type: 'textarea', required: true },
    ]
  },
  KUASA: {
    kode: 'KUASA', nama: 'Surat Kuasa', icon: 'fa-handshake', color: '#0891b2',
    checklist: ['Fotokopi KTP Pemberi Kuasa', 'Fotokopi KTP Penerima Kuasa', 'Meterai Rp 10.000'],
    fields: [
      { id: 'nama', label: 'Nama Pemberi Kuasa', type: 'text', required: true },
      { id: 'nik', label: 'NIK Pemberi Kuasa', type: 'text', required: true },
      { id: 'alamat', label: 'Alamat Pemberi Kuasa', type: 'textarea', required: true },
      { id: 'rt', label: 'RT', type: 'text', required: true, placeholder: '001' },
      { id: 'rw', label: 'RW', type: 'text', required: true, placeholder: '001' },
      { id: 'nama_penerima', label: 'Nama Penerima Kuasa', type: 'text', required: true },
      { id: 'nik_penerima', label: 'NIK Penerima Kuasa', type: 'text', required: true },
      { id: 'hubungan', label: 'Hubungan dengan Pemberi Kuasa', type: 'text', required: true, placeholder: 'Suami/Istri, Anak, dll.' },
      { id: 'alamat_penerima', label: 'Alamat Penerima Kuasa', type: 'textarea', required: true },
      { id: 'keperluan', label: 'Keperluan Pemberian Kuasa', type: 'textarea', required: true },
    ]
  },
};

// ── Helper: Common Pemohon Fields ─────────────────────────────────
function fieldsPemohon(includeNIK = true) {
  const base = [
    { id: 'nama', label: 'Nama Lengkap', type: 'text', required: true, placeholder: 'Sesuai KTP' },
    { id: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', required: true },
    { id: 'tgl_lahir', label: 'Tanggal Lahir', type: 'date', required: true },
    { id: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', required: true, options: ['Laki-laki', 'Perempuan'] },
    { id: 'agama', label: 'Agama', type: 'select', required: true, options: ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'] },
    { id: 'status_nikah', label: 'Status Perkawinan', type: 'select', required: true, options: ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'] },
    { id: 'pekerjaan', label: 'Pekerjaan', type: 'text', required: true, placeholder: 'Wiraswasta, PNS, Petani, dll.' },
  ];
  if (includeNIK) {
    base.push({ id: 'nik', label: 'NIK', type: 'text', required: true, placeholder: '16 digit NIK' });
    base.push({ id: 'no_kk', label: 'No. Kartu Keluarga', type: 'text', required: true, placeholder: '16 digit KK' });
  }
  base.push({ id: 'alamat', label: 'Alamat Lengkap', type: 'textarea', required: true });
  base.push({ id: 'rt', label: 'RT', type: 'text', required: true, placeholder: '001' });
  base.push({ id: 'rw', label: 'RW', type: 'text', required: true, placeholder: '001' });
  return base;
}

// ── State ─────────────────────────────────────────────────────────
let sisState = {
  step: 1,
  selectedKode: null,
  formData: {},
};

// ── Step Management ───────────────────────────────────────────────
function sisGoStep(n) {
  sisState.step = n;
  document.getElementById('sisStep1').style.display = n === 1 ? '' : 'none';
  document.getElementById('sisStep2').style.display = n === 2 ? '' : 'none';
  document.getElementById('sisStep3').style.display = n === 3 ? '' : 'none';

  // Update step bar
  document.querySelectorAll('.sis-step').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.toggle('active', s === n);
    el.classList.toggle('done', s < n);
  });
}

// ── Step 1: Jenis Grid ────────────────────────────────────────────
function sisRenderJenisGrid(filter = '') {
  const grid = document.getElementById('sisJenisGrid');
  if (!grid) return;

  const entries = Object.values(SURAT_CONFIG).filter(j =>
    !filter || j.nama.toLowerCase().includes(filter.toLowerCase()) || j.kode.toLowerCase().includes(filter.toLowerCase())
  );

  if (!entries.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:32px">Jenis surat tidak ditemukan.</div>`;
    return;
  }

  grid.innerHTML = entries.map(j => `
    <button type="button" class="sisurat-jenis-card" data-kode="${j.kode}" title="${j.nama}">
      <div class="sis-jenis-icon" style="background:${j.color}20;color:${j.color}">
        <i class="fa-solid ${j.icon}"></i>
      </div>
      <div class="sis-jenis-nama">${j.nama}</div>
      <div class="sis-jenis-kode">${j.kode}</div>
      <div class="sis-jenis-chevron"><i class="fa-solid fa-chevron-right"></i></div>
    </button>
  `).join('');
}

// ── Step 2: Dynamic Form ──────────────────────────────────────────
function sisRenderStep2(kode) {
  const cfg = SURAT_CONFIG[kode];
  if (!cfg) return;

  sisState.selectedKode = kode;

  // Update info cards
  const nameEl = document.getElementById('sisSelectedName');
  const kodeEl = document.getElementById('sisSelectedKode');
  const nomorKodeEl = document.getElementById('sisNomorKode');
  if (nameEl) nameEl.textContent = cfg.nama;
  if (kodeEl) kodeEl.textContent = `Kode: ${cfg.kode}`;
  if (nomorKodeEl) nomorKodeEl.textContent = cfg.kode;

  document.getElementById('sisFormTitle').textContent = cfg.nama;

  // Render form fields
  const formFields = document.getElementById('sisFormFields');
  formFields.innerHTML = '';

  // Group fields into pairs for 2-col grid where possible
  const fieldsHtml = cfg.fields.map(f => {
    const isWide = f.type === 'textarea' || f.id === 'alamat' || f.id === 'alamat_usaha' || f.id === 'alamat_tujuan';
    const req = f.required ? '*' : '';
    let input = '';
    if (f.type === 'select') {
      input = `<select id="sisf_${f.id}" class="input" ${f.required ? 'required' : ''}>
        <option value="">-- Pilih --</option>
        ${(f.options || []).map(o => `<option value="${o}">${o}</option>`).join('')}
      </select>`;
    } else if (f.type === 'textarea') {
      input = `<textarea id="sisf_${f.id}" class="input" rows="3" ${f.required ? 'required' : ''} placeholder="${f.placeholder || ''}">${sisState.formData[f.id] || ''}</textarea>`;
    } else {
      input = `<input id="sisf_${f.id}" type="${f.type}" class="input" ${f.required ? 'required' : ''} placeholder="${f.placeholder || ''}" value="${sisState.formData[f.id] || ''}" />`;
    }

    return `<div class="field ${isWide ? 'sis-field-wide' : ''}">
      <label for="sisf_${f.id}">${f.label} ${req ? '<span style="color:#ef4444">*</span>' : ''}</label>
      ${input}
    </div>`;
  }).join('');

  formFields.innerHTML = `<div class="sis-form-grid">${fieldsHtml}</div>`;

  // Restore saved values
  cfg.fields.forEach(f => {
    const el = document.getElementById(`sisf_${f.id}`);
    if (el && sisState.formData[f.id]) el.value = sisState.formData[f.id];
  });

  // Checklist
  const clBody = document.getElementById('sisChecklistBody');
  clBody.innerHTML = cfg.checklist.map((item, i) => `
    <label class="sis-check-item" for="sisCL_${i}">
      <input type="checkbox" id="sisCL_${i}" class="sis-checklist-cb" />
      <span>${item}</span>
    </label>
  `).join('');

  // Enable/disable preview button
  const previewBtn = document.getElementById('sisPreviewBtn');
  const updatePreviewBtn = () => {
    const allChecked = [...document.querySelectorAll('.sis-checklist-cb')].every(cb => cb.checked);
    previewBtn.disabled = !allChecked;
  };
  document.querySelectorAll('.sis-checklist-cb').forEach(cb => cb.addEventListener('change', updatePreviewBtn));
  updatePreviewBtn();

  sisGoStep(2);
}

// ── Step 3: Preview ───────────────────────────────────────────────
async function sisShowPreview() {
  const cfg = SURAT_CONFIG[sisState.selectedKode];
  if (!cfg) return;

  // Collect form data
  const data = {};
  cfg.fields.forEach(f => {
    const el = document.getElementById(`sisf_${f.id}`);
    if (el) data[f.id] = el.value;
  });
  sisState.formData = data;

  // Add keperluan from step 3 textarea if it exists
  const keperluanEl = document.getElementById('sisKeperluan');
  if (keperluanEl && !data.keperluan) data.keperluan = keperluanEl.value;

  sisGoStep(3);

  // Reset success state
  document.getElementById('sisSuccessState').style.display = 'none';
  document.getElementById('sisGenerateBtn').style.display = '';

  // Fetch preview HTML from server
  const frame = document.getElementById('sisPreviewFrame');
  frame.srcdoc = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-family:sans-serif;color:#6b7280;"><i class="fa-solid fa-spinner fa-spin" style="margin-right:8px"></i> Memuat preview...</div>';

  try {
    const ukuran = document.getElementById('sisUkuranKertas')?.value || 'F4';
    const res = await fetch('/api/staf/buat-surat/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': CSRF(),
        'Accept': 'application/json',
      },
      body: JSON.stringify({ kode_jenis: sisState.selectedKode, data_surat: data, ukuran_kertas: ukuran }),
    });
    const html = await res.text();
    frame.srcdoc = html;
  } catch (e) {
    frame.srcdoc = '<div style="padding:20px;color:#ef4444">Gagal memuat preview: ' + e.message + '</div>';
  }
}

// ── Generate PDF ──────────────────────────────────────────────────
async function sisGenerate() {
  const cfg = SURAT_CONFIG[sisState.selectedKode];
  if (!cfg) return;

  const keperluan = document.getElementById('sisKeperluan')?.value || sisState.formData.keperluan || '-';
  const catatanStaf = document.getElementById('sisCatatanStaf')?.value || '';

  const genBtn = document.getElementById('sisGenerateBtn');
  const genState = document.getElementById('sisGeneratingState');
  genBtn.style.display = 'none';
  genState.style.display = '';

  try {
    const ukuran = document.getElementById('sisUkuranKertas')?.value || 'F4';
    const res = await fetch('/api/staf/buat-surat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': CSRF(),
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        kode_jenis: sisState.selectedKode,
        data_surat: { ...sisState.formData, catatan_staf: catatanStaf },
        keperluan,
        ukuran_kertas: ukuran,
      }),
    });

    const result = await res.json();
    genState.style.display = 'none';

    if (res.ok && result.success) {
      // Show success card
      const successState = document.getElementById('sisSuccessState');
      const successNomor = document.getElementById('sisSuccessNomor');
      const downloadLink = document.getElementById('sisDownloadLink');
      successState.style.display = '';
      successNomor.textContent = result.nomor_surat;
      downloadLink.href = result.download_url;
      downloadLink.setAttribute('download', `Surat_${result.nomor_surat.replace(/\//g, '_')}.pdf`);

      // Auto-download
      window.location.href = result.download_url;
    } else {
      genBtn.style.display = '';
      alert('Gagal membuat surat: ' + (result.message || JSON.stringify(result)));
    }
  } catch (e) {
    genState.style.display = 'none';
    genBtn.style.display = '';
    alert('Terjadi kesalahan: ' + e.message);
  }
}

// ── Init ──────────────────────────────────────────────────────────
function initBuatSurat() {
  sisState = { step: 1, selectedKode: null, formData: {} };
  sisGoStep(1);
  sisRenderJenisGrid();

  // Events
  const grid = document.getElementById('sisJenisGrid');
  if (grid) {
    grid.addEventListener('click', e => {
      const card = e.target.closest('.sisurat-jenis-card');
      if (card) sisRenderStep2(card.dataset.kode);
    });
  }

  const searchEl = document.getElementById('sisJenisSearch');
  if (searchEl) {
    searchEl.addEventListener('input', () => sisRenderJenisGrid(searchEl.value));
  }

  const backBtn = document.getElementById('sisBackBtn');
  if (backBtn) backBtn.addEventListener('click', () => sisGoStep(1));

  const previewBtn = document.getElementById('sisPreviewBtn');
  if (previewBtn) previewBtn.addEventListener('click', sisShowPreview);

  const editBtn = document.getElementById('sisEditBtn');
  if (editBtn) editBtn.addEventListener('click', () => {
    sisGoStep(2);
    sisRenderStep2(sisState.selectedKode);
  });

  const generateBtn = document.getElementById('sisGenerateBtn');
  if (generateBtn) generateBtn.addEventListener('click', sisGenerate);

  const buatLagiBtn = document.getElementById('sisBuatLagiBtn');
  if (buatLagiBtn) buatLagiBtn.addEventListener('click', () => {
    sisState = { step: 1, selectedKode: null, formData: {} };
    sisGoStep(1);
    sisRenderJenisGrid();
  });
}

// ── Expose ────────────────────────────────────────────────────────
window.initBuatSurat = initBuatSurat;
