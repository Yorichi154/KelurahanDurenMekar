// ===================================================================
// arsip-surat.js — SiSurat: Halaman Arsip Surat Digital
// ===================================================================

const ARSIP_JENIS_LIST = [
  'Surat Keterangan Tidak Mampu', 'Surat Keterangan Domisili',
  'Surat Keterangan Domisili Menetap', 'Surat Keterangan Masih Hidup',
  'Surat Keterangan Belum Memiliki NIK', 'Surat Keterangan Usaha/Wiraswasta',
  'Surat Keterangan Pindah', 'Surat Keterangan Kematian',
  'Surat Keterangan Kelahiran', 'Surat Keterangan Penghasilan (Swasta)',
  'Surat Keterangan Penghasilan (PNS)', 'Surat Keterangan Pemilikan Tanah',
  'Surat Keterangan Tidak Buta Huruf', 'Surat Keterangan Bebas Sengketa',
  'Surat Keterangan Berkelakuan Baik', 'Surat Keterangan Untuk Nikah (N1)',
  'Surat Keterangan Asal Usul (N2)', 'Surat Keterangan Tentang Orang Tua (N4)',
  'Surat Pengantar (Umum)', 'Surat Pengantar SKCK', 'Surat Pengantar Pindah',
  'Surat Rekomendasi', 'Surat Kuasa',
];

let arsipPage = 1;
let arsipDebounce = null;

function arsipFmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function arsipStatusBadge(status) {
  const map = { menunggu: 'badge-wait', diproses: 'badge-proses', selesai: 'badge-done', ditolak: 'badge-reject' };
  return `<span class="badge ${map[status] || 'badge-neutral'}">${status}</span>`;
}

async function fetchArsip(page = 1) {
  arsipPage = page;
  const tbody = document.getElementById('arsipTbody');
  const emptyEl = document.getElementById('arsipEmpty');
  const paginationEl = document.getElementById('arsipPagination');
  const infoEl = document.getElementById('arsipInfo');
  const pagesEl = document.getElementById('arsipPages');

  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--muted)">
    <i class="fa-solid fa-spinner fa-spin" style="color:var(--primary)"></i> Memuat arsip...
  </td></tr>`;

  const params = new URLSearchParams({ page });
  const search = document.getElementById('arsipSearch')?.value;
  const jenis  = document.getElementById('arsipJenis')?.value;
  const from   = document.getElementById('arsipFrom')?.value;
  const to     = document.getElementById('arsipTo')?.value;
  if (search) params.set('search', search);
  if (jenis)  params.set('jenis', jenis);
  if (from)   params.set('from', from);
  if (to)     params.set('to', to);

  try {
    const res  = await fetch('/api/staf/arsip-surat?' + params.toString());
    const data = await res.json();

    const items = data.data || [];
    const total = data.total || 0;
    const perPage = data.per_page || 20;
    const lastPage = data.last_page || 1;

    if (!items.length) {
      tbody.innerHTML = '';
      if (emptyEl) emptyEl.style.display = '';
      if (paginationEl) paginationEl.style.display = 'none';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (paginationEl) paginationEl.style.display = 'flex';

    tbody.innerHTML = items.map(item => `
      <tr>
        <td style="font-family:monospace;font-size:12px;font-weight:700;color:var(--primary)">
          ${item.nomor_surat || '-'}
        </td>
        <td style="font-weight:800">${item.jenis_surat || '-'}</td>
        <td>${item.user?.name || item.data_surat?.nama || '-'}</td>
        <td>${arsipFmtDate(item.created_at)}</td>
        <td style="color:var(--muted);font-size:13px">${item.pembuatSurat?.name || '-'}</td>
        <td>${arsipStatusBadge(item.status)}</td>
        <td>
          <a href="/api/staf/buat-surat/${item.id}/download"
             class="btn btn-primary btn-sm"
             style="padding:6px 10px;border-radius:8px;font-size:12px;white-space:nowrap;gap:6px"
             title="Unduh PDF Surat">
            <i class="fa-solid fa-download"></i> PDF
          </a>
        </td>
      </tr>
    `).join('');

    // Info text
    const from2 = (page - 1) * perPage + 1;
    const to2   = Math.min(page * perPage, total);
    if (infoEl) infoEl.textContent = `Menampilkan ${from2}–${to2} dari ${total} arsip`;

    // Pagination buttons
    if (pagesEl) {
      let pages = '';
      if (page > 1) pages += `<button class="btn btn-ghost btn-sm arsip-page" data-page="${page - 1}"><i class="fa-solid fa-chevron-left"></i></button>`;
      for (let p = Math.max(1, page - 2); p <= Math.min(lastPage, page + 2); p++) {
        pages += `<button class="btn ${p === page ? 'btn-primary' : 'btn-ghost'} btn-sm arsip-page" data-page="${p}">${p}</button>`;
      }
      if (page < lastPage) pages += `<button class="btn btn-ghost btn-sm arsip-page" data-page="${page + 1}"><i class="fa-solid fa-chevron-right"></i></button>`;
      pagesEl.innerHTML = pages;
    }

  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#ef4444;padding:24px">Gagal memuat arsip: ${e.message}</td></tr>`;
  }
}

function initArsipSurat() {
  // Populate jenis dropdown
  const jenisSelect = document.getElementById('arsipJenis');
  if (jenisSelect) {
    ARSIP_JENIS_LIST.forEach(j => {
      const opt = document.createElement('option');
      opt.value = j;
      opt.textContent = j;
      jenisSelect.appendChild(opt);
    });
  }

  // Fetch data
  fetchArsip(1);

  // Search with debounce
  const searchEl = document.getElementById('arsipSearch');
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      clearTimeout(arsipDebounce);
      arsipDebounce = setTimeout(() => fetchArsip(1), 400);
    });
  }

  // Filter changes
  ['arsipJenis', 'arsipFrom', 'arsipTo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => fetchArsip(1));
  });

  // Clear filter
  const clearBtn = document.getElementById('arsipClearFilter');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchEl) searchEl.value = '';
      if (jenisSelect) jenisSelect.value = '';
      const fromEl = document.getElementById('arsipFrom');
      const toEl   = document.getElementById('arsipTo');
      if (fromEl) fromEl.value = '';
      if (toEl) toEl.value = '';
      fetchArsip(1);
    });
  }

  // Pagination click delegation
  const pagesEl = document.getElementById('arsipPages');
  if (pagesEl) {
    pagesEl.addEventListener('click', e => {
      const btn = e.target.closest('.arsip-page');
      if (btn) fetchArsip(parseInt(btn.dataset.page));
    });
  }
}

window.initArsipSurat = initArsipSurat;
