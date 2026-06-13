// assets/js/staf/staf.js

const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

async function initStafDashboardLaravel() {
    const response = await fetch("/api/staf/dashboard");

    const data = await response.json();

    const suratMenunggu = document.getElementById("metricSuratMenunggu");

    const pengaduanAktif = document.getElementById("metricPengaduanAktif");

    const totalPengajuan = document.getElementById("metricTotalPengajuan");

    if (suratMenunggu) suratMenunggu.textContent = data.surat_menunggu;

    if (pengaduanAktif) pengaduanAktif.textContent = data.pengaduan_aktif;

    if (totalPengajuan) totalPengajuan.textContent = data.total_pengajuan;

    const listSurat = document.getElementById("listSuratMenunggu");

    if (listSurat) {
        listSurat.innerHTML = data.surat_terbaru
            .map(
                (item) => `

                <div class="stack-item">

                    <strong>
                        ${item.jenis_surat}
                    </strong>

                    <div class="muted">

                        ${item.user?.name ?? "-"}

                    </div>

                </div>

            `,
            )
            .join("");
    }

    const listPengaduan = document.getElementById("listPengaduanTerbaru");

    if (listPengaduan) {
        listPengaduan.innerHTML = data.pengaduan_terbaru
            .map(
                (item) => `

                <div class="stack-item">

                    <strong>
                        ${item.judul}
                    </strong>

                    <div class="muted">

                        ${item.user?.name ?? "-"}

                    </div>

                </div>

            `,
            )
            .join("");
    }
}
function fmtDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}
function statusBadge(status) {
    const s = String(status || "").toLowerCase();
    const map = {
        menunggu: "badge-wait",
        diproses: "badge-proses",
        selesai: "badge-done",
        siap_diambil: "badge-done",
        ditolak: "badge-reject",
    };
    const textMap = {
        menunggu: "Menunggu",
        diproses: "Diproses",
        selesai: "Selesai",
        ditolak: "Ditolak",
        siap_diambil: "Siap Diambil",
    };
    const cls = map[s] || "badge-neutral";
    const label = textMap[s] || status;
    return `
        <span class="badge ${cls}">
            ${label}
        </span>
    `;
}

const esc = (str) => {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const fmtSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

let currentDetailSurat = null;

async function openStafSuratDetail(id) {
    try {
        const res = await fetch(`/api/staf/surat/${id}`, {
            headers: { Accept: "application/json" }
        });
        const surat = await res.json();
        if (!surat) return;
        currentDetailSurat = surat;

        const modal = document.getElementById("suratDetailModal");
        const title = document.getElementById("suratDetailTitle");
        const sub = document.getElementById("suratDetailSub");
        const body = document.getElementById("suratDetailBody");

        if (title) title.textContent = surat.jenis_surat || "Detail Surat";
        if (sub) sub.textContent = `ID Pengajuan #${surat.id}`;

        const berkasList = Array.isArray(surat.berkas) ? surat.berkas : [];

        let statusText = "Menunggu Validasi";
        let statusPillClass = "badge-wait";
        if (surat.status === "diproses") {
            statusText = "Sedang Diproses";
            statusPillClass = "badge-proses";
        } else if (surat.status === "selesai") {
            statusText = "Selesai";
            statusPillClass = "badge-done";
        } else if (surat.status === "siap_diambil") {
            statusText = "Siap Diambil";
            statusPillClass = "badge-done";
        } else if (surat.status === "ditolak") {
            statusText = "Ditolak";
            statusPillClass = "badge-reject";
        }

        let extraFieldsHtml = "";
        const dataSurat = (surat.data_surat && typeof surat.data_surat === "object") ? surat.data_surat : {};
        const standardKeys = ["user_id", "nama", "nik", "telp", "rt", "rw", "alamat", "keperluan"];
        const customEntries = Object.entries(dataSurat).filter(([k]) => !standardKeys.includes(k));

        if (customEntries.length > 0) {
            extraFieldsHtml = `
            <div style="margin-top: 18px; padding-top: 14px; border-top: 1px dashed var(--border);">
              <h5 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 1000; color: var(--primary);">Detail Form Pengajuan</h5>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px;">
                ${customEntries.map(([key, val]) => {
                    const formattedLabel = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                    let valHtml = "";
                    if (typeof val === "string" && val.startsWith("data:image/")) {
                        valHtml = `<img src="${val}" style="max-width:100%; max-height:150px; border-radius:8px; display:block; margin-top:4px; border:1px solid var(--border);" />`;
                    } else if (typeof val === "string" && val.startsWith("data:application/pdf")) {
                        valHtml = `<a href="${val}" target="_blank" class="btn btn-light btn-sm" style="margin-top:4px; font-weight:bold; font-size:11px; padding:4px 8px; border:1px solid var(--border); border-radius:6px; display:inline-flex; align-items:center; gap:4px;"><i class="fa-solid fa-file-pdf" style="color:#ef4444;"></i> Buka Dokumen PDF</a>`;
                    } else {
                        valHtml = `<div style="font-weight: 1000; margin-top: 4px; color: var(--text);">${esc(val)}</div>`;
                    }
                    return `
                      <div>
                        <label style="font-size: 11px; color: var(--muted); font-weight: 900; text-transform: uppercase;">${esc(formattedLabel)}</label>
                        ${valHtml}
                      </div>
                    `;
                }).join("")}
              </div>
            </div>
            `;
        }

        let bodyHtml = `
<div class="surat-detail-grid" style="display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start;">
  <!-- LEFT COLUMN -->
  <div style="display: flex; flex-direction: column; gap: 20px;">
    <!-- Data Pemohon Card -->
    <div class="card" style="box-shadow: var(--shadow); border: 1px solid var(--border); border-radius: 14px; background: #fff;">
      <div class="card-body" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h4 style="margin: 0; font-size: 16px; font-weight: 1000;">Data Pemohon</h4>
          <span class="badge ${statusPillClass}">${statusText}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px 20px;">
          <div>
            <label style="font-size: 11px; color: var(--muted); font-weight: 900; text-transform: uppercase;">Nama Lengkap</label>
            <div style="font-weight: 1000; margin-top: 4px; color: var(--text);">${esc(surat.user?.name || '-')}</div>
          </div>
          <div>
            <label style="font-size: 11px; color: var(--muted); font-weight: 900; text-transform: uppercase;">NIK</label>
            <div style="font-weight: 1000; margin-top: 4px; color: var(--text);">${esc(surat.user?.nik || '-')}</div>
          </div>
          <div>
            <label style="font-size: 11px; color: var(--muted); font-weight: 900; text-transform: uppercase;">No. Telepon</label>
            <div style="font-weight: 1000; margin-top: 4px; color: var(--text);">${esc(surat.user?.telp || '-')}</div>
          </div>
          <div>
            <label style="font-size: 11px; color: var(--muted); font-weight: 900; text-transform: uppercase;">Tanggal Pengajuan</label>
            <div style="font-weight: 1000; margin-top: 4px; color: var(--text);">${fmtDate(surat.created_at)}</div>
          </div>
          <div style="grid-column: span 2;">
            <label style="font-size: 11px; color: var(--muted); font-weight: 900; text-transform: uppercase;">Alamat</label>
            <div style="font-weight: 1000; margin-top: 4px; color: var(--text);">${esc(surat.user?.alamat || '-')}, RT ${esc(surat.user?.rt || '-')}/RW ${esc(surat.user?.rw || '-')}</div>
          </div>
          <div style="grid-column: span 2;">
            <label style="font-size: 11px; color: var(--muted); font-weight: 900; text-transform: uppercase;">Keperluan</label>
            <div style="font-weight: 1000; margin-top: 4px; color: var(--text);">${esc(surat.keperluan || '-')}</div>
          </div>
        </div>
        ${extraFieldsHtml}
      </div>
    </div>
    
    <!-- Berkas Lampiran Section -->
    <div>
      <h4 style="margin: 0 0 12px; font-size: 16px; font-weight: 1000;">Berkas Lampiran (${berkasList.length})</h4>
      ${berkasList.length === 0 ? `
        <div class="muted" style="padding: 12px; background: rgba(148, 163, 184, 0.05); border: 1px dashed var(--border); border-radius: 12px;">
          Tidak ada berkas persyaratan yang diunggah.
        </div>
      ` : `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px;">
          ${berkasList.map((f) => {
            const isImg = (f.mime || '').startsWith('image/') || (f.fileName || '').match(/\.(jpg|jpeg|png|webp|gif)$/i);
            const thumbUrl = isImg && f.dataUrl ? f.dataUrl : '';
            
            let previewHtml = '';
            if (thumbUrl) {
              previewHtml = `<img src="${thumbUrl}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 10px 10px 0 0;" />`;
            } else {
              previewHtml = `
                <div style="width: 100%; height: 120px; background: rgba(148, 163, 184, 0.1); border-radius: 10px 10px 0 0; display: flex; align-items: center; justify-content: center;">
                  <i class="fa-solid fa-file-pdf" style="font-size: 48px; color: #ef4444;"></i>
                </div>
              `;
            }
            
            const openAction = f.dataUrl ? `href="${f.dataUrl}" target="_blank"` : `href="#" onclick="alert('File tidak dapat dibuka karena ukuran melebihi batas demo.'); return false;"`;
            const downloadAction = f.dataUrl ? `href="${f.dataUrl}" download="${esc(f.fileName)}"` : `href="#" onclick="alert('File tidak dapat didownload karena ukuran melebihi batas demo.'); return false;"`;
            
            return `
              <div class="card" style="box-shadow: var(--shadow-sm); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; background: #fff;">
                ${previewHtml}
                <div style="padding: 10px; display: flex; flex-direction: column; flex: 1; min-height: 80px;">
                  <div style="font-weight: 1000; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${esc(f.fileName)}">${esc(f.fileName || '-')}</div>
                  <div style="font-size: 11px; color: var(--muted); margin-top: 4px; font-weight: 700;">${esc(f.requirement || 'Berkas')}</div>
                  <div style="font-size: 11px; color: var(--muted); margin-top: 2px;">${fmtSize(f.size)}</div>
                  
                  <div style="margin-top: auto; padding-top: 8px; display: flex; gap: 6px; justify-content: flex-end;">
                    <a class="btn btn-light btn-sm" ${openAction} style="padding: 4px 8px; border-radius: 6px; font-size: 12px; border: 1px solid var(--border); display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px;" title="Lihat">
                      <i class="fa-regular fa-eye"></i>
                    </a>
                    <a class="btn btn-light btn-sm" ${downloadAction} style="padding: 4px 8px; border-radius: 6px; font-size: 12px; border: 1px solid var(--border); display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px;" title="Unduh">
                      <i class="fa-solid fa-download"></i>
                    </a>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  </div>
  
  <!-- RIGHT COLUMN -->
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <!-- Status & Timeline Card -->
    <div class="card" style="box-shadow: var(--shadow); border: 1px solid var(--border); border-radius: 14px; background: #fff;">
      <div class="card-body" style="padding: 16px;">
        <h4 style="margin: 0 0 14px; font-size: 14px; font-weight: 1000;">Status & Timeline</h4>
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: #22c55e; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">
            <i class="fa-solid fa-check"></i>
          </div>
          <div>
            <div style="font-weight: 1000; font-size: 13px;">Pengajuan Diterima</div>
            <div style="font-size: 11px; color: var(--muted); margin-top: 2px;">${fmtDate(surat.created_at)}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Validasi Berkas Card -->
    <div class="card" style="box-shadow: var(--shadow); border: 1px solid var(--border); border-radius: 14px; background: #fff;">
      <div class="card-body" style="padding: 16px; display: flex; flex-direction: column; gap: 10px;">
        <h4 style="margin: 0 0 4px; font-size: 14px; font-weight: 1000;">Validasi Berkas</h4>
        <button class="btn btn-success accept-surat" data-id="${surat.id}" style="width: 100%; border-radius: 12px; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 800; font-size: 13px; background: #22c55e; color: white; border: none; cursor: pointer; transition: transform 0.1s ease;">
          <i class="fa-solid fa-check-double"></i> Setujui & Proses
        </button>
        <button class="btn btn-danger reject-surat" data-id="${surat.id}" style="width: 100%; border-radius: 12px; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 800; font-size: 13px; background: #ef4444; color: white; border: none; cursor: pointer; transition: transform 0.1s ease;">
          <i class="fa-solid fa-ban"></i> Tolak Pengajuan
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Chat link at the bottom -->
<div style="margin-top: 20px;">
  <a href="#staf/chat" data-page="staf/chat" class="card" style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); border-radius: 12px; text-decoration: none; font-weight: 800; color: var(--primary); background: #fff; transition: background 0.15s ease;">
    <i class="fa-regular fa-comment-dots" style="font-size: 18px;"></i> Chat dengan Warga
  </a>
</div>

${surat.status !== 'selesai' && surat.status !== 'ditolak' ? `
<!-- Upload Surat Button in Detail -->
<div style="margin-top: 12px;">
  <button class="btn btn-success open-kirim-surat-from-detail" data-id="${surat.id}" style="width: 100%; border-radius: 12px; padding: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 800; font-size: 13px; background: #16a34a; color: white; border: none; cursor: pointer;">
    <i class="fa-solid fa-paper-plane"></i> Upload & Kirim Surat ke Warga
  </button>
</div>
` : ''}

${surat.file_surat ? `
<!-- Download Link -->
<div style="margin-top: 12px;">
  <a href="/storage/${surat.file_surat}" target="_blank" class="card" style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; box-shadow: var(--shadow-sm); border: 2px solid rgba(34,197,94,.22); border-radius: 12px; text-decoration: none; font-weight: 800; color: #16a34a; background: rgba(34,197,94,.04); transition: background 0.15s ease;">
    <i class="fa-solid fa-file-pdf" style="font-size: 18px;"></i> Download Surat (PDF)
  </a>
</div>
` : ''}
        `;

        if (body) body.innerHTML = bodyHtml;
        if (modal) {
            modal.classList.add("open");
            modal.setAttribute("aria-hidden", "false");
        }
    } catch (error) {
        console.error("Gagal memuat detail surat:", error);
    }
}

async function updateStafSuratStatus(id, status) {
    try {
        const response = await fetch(`/api/staf/surat/${id}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken,
                Accept: "application/json",
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            throw new Error("Gagal memperbarui status surat");
        }

        alert(`Status surat berhasil diperbarui ke ${status}`);
        
        // Close modal
        const modal = document.getElementById("suratDetailModal");
        if (modal) {
            modal.classList.remove("open");
            modal.setAttribute("aria-hidden", "true");
        }

        // Refresh table
        initStafSuratLaravel();
    } catch (error) {
        console.error(error);
        alert("Gagal memperbarui status surat");
    }
}

async function initStafSuratLaravel() {
    const tbody = document.getElementById("suratTbody");
    const filterWrap = document.getElementById("suratFilter");
    const searchInput = document.getElementById("suratSearch");

    if (!tbody) return;

    let allData = [];

    async function loadAndRender() {
        try {
            const res = await fetch("/api/staf/surat");
            allData = await res.json();
            renderTable();
        } catch (err) {
            console.error(err);
        }
    }

    function renderTable() {
        const q = (searchInput?.value || '').toLowerCase();
        let filtered = allData;

        if (q) {
            filtered = filtered.filter(s => {
                const hay = `${s.user?.name || ''} ${s.jenis_surat || ''} ${s.keperluan || ''}`.toLowerCase();
                return hay.includes(q);
            });
        }

        const emptyEl = document.getElementById("suratEmpty");
        if (emptyEl) {
            emptyEl.style.display = filtered.length ? "none" : "block";
        }

        tbody.innerHTML = filtered
            .map(
                (surat) => `
            <tr>
                <td>${fmtDate(surat.created_at)}</td>

                <td>${surat.user?.name ?? "-"}</td>

                <td>${surat.user?.rt ?? "-"}/${surat.user?.rw ?? "-"}</td>

                <td>${surat.jenis_surat}</td>

                <td>${surat.keperluan}</td>

                <td>${statusBadge(surat.status)}</td>

                <td>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
                        <button
                            class="btn btn-primary btn-sm view-surat-detail"
                            data-id="${surat.id}"
                            style="padding: 6px 10px; border-radius: 8px; font-weight: 800; font-size: 12px; border: none; cursor: pointer; color: white;"
                        >
                            <i class="fa-solid fa-eye"></i> Detail
                        </button>

                        <select
                            class="surat-status"
                            data-id="${surat.id}"
                            style="padding: 6px; border-radius: 6px; border: 1px solid var(--border); background: #fff;"
                        >
                            <option value="menunggu" ${surat.status === "menunggu" ? "selected" : ""}>Menunggu</option>
                            <option value="diproses" ${surat.status === "diproses" ? "selected" : ""}>Diproses</option>
                            <option value="selesai" ${surat.status === "selesai" ? "selected" : ""}>Selesai</option>
                            <option value="ditolak" ${surat.status === "ditolak" ? "selected" : ""}>Ditolak</option>
                        </select>

                        <button
                            class="btn save-surat"
                            data-id="${surat.id}"
                            style="padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 12px; background: var(--primary); color: white; border: none; cursor: pointer;">
                            Simpan
                        </button>

                        <button
                            class="btn btn-success btn-sm open-kirim-surat"
                            data-id="${surat.id}"
                            style="padding: 6px 10px; border-radius: 8px; font-weight: 800; font-size: 12px; background: #16a34a; color: #fff; border: none; cursor: pointer;"
                            title="Upload & Kirim Surat ke Warga"
                        >
                            <i class="fa-solid fa-paper-plane"></i> Kirim Surat
                        </button>
                        ${surat.file_surat ? `
                        <a href="/storage/${surat.file_surat}" target="_blank" class="btn btn-primary btn-sm" style="padding: 6px 10px; border-radius: 8px; font-weight: 800; font-size: 12px; text-decoration: none; display: flex; align-items: center; gap: 4px; background: #2563eb; color: white; border: none;">
                            <i class="fa-solid fa-download"></i> Download
                        </a>` : ''}
                        <button
                            class="btn btn-danger btn-sm delete-surat"
                            data-id="${surat.id}"
                            style="padding: 6px 10px; border-radius: 8px; font-weight: 800; font-size: 12px; background: #dc2626; color: white; border: none; cursor: pointer;"
                            title="Hapus Surat"
                        >
                            <i class="fa-solid fa-trash"></i> Hapus
                        </button>
                    </div>
                </td>
            </tr>
        `,
            )
            .join("");
    }

    // Search handler
    if (searchInput) {
        searchInput.addEventListener('input', renderTable);
    }

    await loadAndRender();

    // Store refresh function globally
    window._refreshStafSurat = loadAndRender;
}

// Bind modal-related click events for Staf
document.addEventListener("click", async (e) => {
    const viewBtn = e.target.closest(".view-surat-detail");
    if (viewBtn) {
        const id = viewBtn.dataset.id;
        openStafSuratDetail(id);
        return;
    }

    // Open Kirim Surat modal from table
    const kirimBtn = e.target.closest(".open-kirim-surat");
    if (kirimBtn) {
        const id = kirimBtn.dataset.id;
        openKirimSuratModal(id);
        return;
    }

    const delBtn = e.target.closest(".delete-surat");
    if (delBtn) {
        const id = delBtn.dataset.id;
        if (confirm("Hapus surat ini? Aksi ini tidak dapat dibatalkan.")) {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
            try {
                const res = await fetch(`/api/staf/surat/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': csrf,
                        'Accept': 'application/json'
                    }
                });
                if (!res.ok) throw new Error('Gagal menghapus surat');
                if (typeof window._refreshStafSurat === 'function') {
                    window._refreshStafSurat();
                }
            } catch (err) {
                alert(err.message);
            }
        }
        return;
    }

    // Open Kirim Surat modal from detail modal
    const kirimFromDetail = e.target.closest(".open-kirim-surat-from-detail");
    if (kirimFromDetail) {
        const id = kirimFromDetail.dataset.id;
        // Close detail modal first
        const detailModal = document.getElementById("suratDetailModal");
        if (detailModal) {
            detailModal.classList.remove("open");
            detailModal.setAttribute("aria-hidden", "true");
        }
        openKirimSuratModal(id);
        return;
    }

    if (e.target.closest("[data-action='closeModal']")) {
        // Move focus away before hiding to prevent aria-hidden focus warning
        if (document.activeElement && document.activeElement.closest('.modal')) {
            document.activeElement.blur();
        }
        const suratModal = document.getElementById("suratDetailModal");
        if (suratModal) {
            suratModal.classList.remove("open");
            suratModal.setAttribute("aria-hidden", "true");
        }
        const kirimModal = document.getElementById("kirimSuratModal");
        if (kirimModal) {
            kirimModal.classList.remove("open");
            kirimModal.setAttribute("aria-hidden", "true");
        }
        return;
    }

    const reviewBtn = e.target.closest(".btn-staf-review");
    if (reviewBtn) {
        const id = reviewBtn.dataset.id;
        openStafPengaduanDetail(id);
        return;
    }

    const acceptBtn = e.target.closest(".accept-surat");
    if (acceptBtn) {
        const id = acceptBtn.dataset.id;
        if (confirm("Setujui dan proses pengajuan surat ini?")) {
            await updateStafSuratStatus(id, "diproses");
            if (currentDetailSurat && String(currentDetailSurat.id) === String(id)) {
                sessionStorage.setItem('prefill_surat', JSON.stringify(currentDetailSurat));
                if (window.navigateTo) {
                    window.navigateTo("staf/buat-surat");
                } else {
                    window.location.hash = "#staf/buat-surat";
                }
            }
        }
        return;
    }

    const rejectBtn = e.target.closest(".reject-surat");
    if (rejectBtn) {
        const id = rejectBtn.dataset.id;
        if (confirm("Tolak pengajuan surat ini?")) {
            await updateStafSuratStatus(id, "ditolak");
        }
        return;
    }
});

// ── Kirim Surat Modal ─────────────────────────────────────────
function openKirimSuratModal(suratId) {
    const modal = document.getElementById("kirimSuratModal");
    const idInput = document.getElementById("kirimSuratId");
    const fileInput = document.getElementById("kirimSuratFile");
    const noteInput = document.getElementById("kirimSuratNote");

    if (!modal || !idInput) return;

    idInput.value = suratId;
    if (fileInput) fileInput.value = '';
    if (noteInput) noteInput.value = '';

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
}

// Handle Kirim Surat form submit
document.addEventListener("submit", async (e) => {
    if (!e.target.matches("#kirimSuratForm")) return;
    e.preventDefault();

    const form = e.target;
    const suratId = document.getElementById("kirimSuratId")?.value;
    const fileInput = document.getElementById("kirimSuratFile");
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!suratId || !fileInput?.files?.length) {
        alert("Silakan pilih file PDF terlebih dahulu.");
        return;
    }

    const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
    const formData = new FormData();
    formData.append('file_surat', fileInput.files[0]);

    // Disable button during upload
    const origHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengunggah...';

    try {
        const res = await fetch(`/api/staf/surat/${suratId}/upload-hasil`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrf,
                'Accept': 'application/json',
            },
            body: formData,
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || `HTTP error! status: ${res.status}`);
        }

        alert('Surat berhasil dikirim ke warga!');

        // Close modal
        const modal = document.getElementById("kirimSuratModal");
        if (modal) {
            modal.classList.remove("open");
            modal.setAttribute("aria-hidden", "true");
        }

        // Refresh table
        if (typeof window._refreshStafSurat === 'function') {
            window._refreshStafSurat();
        } else {
            initStafSuratLaravel();
        }
    } catch (err) {
        console.error('Upload surat gagal:', err);
        alert('Gagal mengirim surat: ' + err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHtml;
    }
});

document.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("save-pengumuman")) return;

    const id = e.target.dataset.id;

    const status = document.querySelector(
        `.pengumuman-status[data-id="${id}"]`,
    ).value;

    await fetch(`/api/public/pengumuman`, {
        method: "GET",
    });

    alert("Fitur manajemen pengumuman hanya untuk admin");
});

document.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("save-surat")) return;

    const id = e.target.dataset.id;
    const status = document.querySelector(`.surat-status[data-id="${id}"]`).value;
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content;

    try {
        const response = await fetch(`/api/staf/surat/${id}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrf,
                Accept: "application/json",
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            throw new Error("Gagal menyimpan status surat");
        }

        alert("Status surat berhasil diperbarui");
        initStafSuratLaravel();
    } catch (err) {
        console.error(err);
        alert("Gagal menyimpan status surat");
    }
});

document.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("save-pengaduan")) return;

    const id = e.target.dataset.id;

    const status = document.querySelector(
        `.pengaduan-status[data-id="${id}"]`,
    ).value;

    try {
        const response = await fetch(`/api/staf/pengaduan/${id}/status`, {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",

                "X-CSRF-TOKEN": csrfToken,

                Accept: "application/json",
            },

            body: JSON.stringify({
                status,
            }),
        });

        if (!response.ok) {
            throw new Error("Gagal menyimpan status pengaduan");
        }

        alert("Status pengaduan berhasil diperbarui");
        initStafPengaduanLaravel();
    } catch (err) {
        console.error(err);
        alert("Gagal menyimpan status pengaduan");
    }
});

async function openStafPengaduanDetail(id) {
    try {
        const res = await fetch(`/api/staf/pengaduan/${id}`, {
            headers: { Accept: "application/json" }
        });
        const item = await res.json();
        if (!item) return;

        document.getElementById("stafDetailPelapor").textContent = item.user?.name || "-";
        document.getElementById("stafDetailJudul").textContent = item.judul || "-";
        document.getElementById("stafDetailKategori").textContent = item.kategori || "-";
        document.getElementById("stafDetailTanggal").textContent = fmtDate(item.created_at);
        document.getElementById("stafDetailLokasi").textContent = item.lokasi || "-";
        document.getElementById("stafDetailIsi").textContent = item.isi || "";
        document.getElementById("stafDetailStatus").innerHTML = statusBadge(item.status);

        // Populate modal form
        document.getElementById("stafModalId").value = item.id;
        document.getElementById("stafModalStatus").value = item.status;
        const fileInput = document.getElementById("stafModalFotoTindakLanjut");
        if (fileInput) fileInput.value = "";

        // Populate follow up preview
        const modalPreview = document.getElementById("stafModalFotoPreview");
        if (modalPreview) {
            if (item.foto_tindak_lanjut) {
                modalPreview.src = item.foto_tindak_lanjut.startsWith("data:") || item.foto_tindak_lanjut.startsWith("http")
                    ? item.foto_tindak_lanjut
                    : "/storage/" + item.foto_tindak_lanjut;
                modalPreview.style.display = "block";
            } else {
                modalPreview.src = "";
                modalPreview.style.display = "none";
            }
        }

        const img = document.getElementById("stafDetailImg");
        const pdfLink = document.getElementById("stafDetailPdf");
        const noLampiran = document.getElementById("stafDetailNoLampiran");

        if (img && pdfLink && noLampiran) {
            img.style.display = "none";
            pdfLink.style.display = "none";
            noLampiran.style.display = "none";

            if (item.lampiran) {
                const fileUrl = item.lampiran.startsWith("data:") || item.lampiran.startsWith("http")
                    ? item.lampiran
                    : "/storage/" + item.lampiran;
                
                if (item.lampiran.toLowerCase().endsWith(".pdf")) {
                    pdfLink.href = fileUrl;
                    pdfLink.style.display = "inline-block";
                } else {
                    img.src = fileUrl;
                    img.style.display = "block";
                }
            } else {
                noLampiran.style.display = "inline";
            }
        }

        document.getElementById("stafPengaduanDetailModal").classList.add("open");
    } catch (error) {
        console.error("Gagal memuat detail pengaduan:", error);
    }
}

async function initStafPengaduanLaravel() {
    const tbody = document.getElementById("pengaduanTbody");

    if (!tbody) return;

    const res = await fetch("/api/staf/pengaduan");

    const data = await res.json();

    tbody.innerHTML = data
        .map(
            (item) => `
        <tr>

            <td>${fmtDate(item.created_at)}</td>

            <td>${item.user?.name ?? "-"}</td>

            <td>${item.judul}</td>

            <td>${statusBadge(item.status)}</td>

            <td>

                <select
                    class="pengaduan-status"
                    data-id="${item.id}"
                    style="padding: 6px; border-radius: 6px; border: 1px solid var(--border); background: #fff;"
                >
                    <option value="menunggu" ${item.status === "menunggu" ? "selected" : ""}>Menunggu</option>
                    <option value="diproses" ${item.status === "diproses" ? "selected" : ""}>Diproses</option>
                    <option value="selesai" ${item.status === "selesai" ? "selected" : ""}>Selesai</option>
                    <option value="ditolak" ${item.status === "ditolak" ? "selected" : ""}>Ditolak</option>
                </select>

                <button
                    class="btn btn-primary save-pengaduan"
                    data-id="${item.id}"
                    style="padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 12px; background: var(--primary); color: white; border: none; cursor: pointer;"
                >
                    Simpan
                </button>

                <button
                    class="btn btn-ghost btn-staf-review"
                    data-id="${item.id}"
                    style="margin-left: 5px; min-width: 60px; padding: 6px 12px; font-weight: 800; border-radius: 8px; cursor: pointer;"
                >
                    Review
                </button>

            </td>

        </tr>
    `,
        )
        .join("");

    // Handle form submit in modal
    const statusForm = document.getElementById("stafPengaduanStatusForm");
    if (statusForm && !statusForm.dataset.listenerBound) {
        statusForm.dataset.listenerBound = "true";
        statusForm.addEventListener("submit", async (ev) => {
            ev.preventDefault();
            const id = document.getElementById("stafModalId").value;
            const status = document.getElementById("stafModalStatus").value;
            const fileInput = document.getElementById("stafModalFotoTindakLanjut");
            const file = fileInput?.files?.[0] || null;

            const submitBtn = statusForm.querySelector("button[type='submit']");
            const origHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

            try {
                const formData = new FormData();
                formData.append("status", status);
                formData.append("_method", "PUT");
                if (file) {
                    formData.append("foto_tindak_lanjut", file);
                }

                const response = await fetch(`/api/staf/pengaduan/${id}/status`, {
                    method: "POST", // POST with spoofing PUT
                    headers: {
                        "X-CSRF-TOKEN": csrfToken,
                        Accept: "application/json",
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(err.message || "Gagal memperbarui tindak lanjut");
                }

                alert("Tindak lanjut pengaduan berhasil disimpan");
                document.getElementById("stafPengaduanDetailModal")?.classList.remove("open");
                initStafPengaduanLaravel(); // Refresh table
            } catch (err) {
                console.error(err);
                alert("Gagal memperbarui tindak lanjut: " + err.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = origHtml;
            }
        });
    }

    // Modal file preview change listener
    const stafModalFile = document.getElementById("stafModalFotoTindakLanjut");
    if (stafModalFile && !stafModalFile.dataset.listenerBound) {
        stafModalFile.dataset.listenerBound = "true";
        stafModalFile.addEventListener("change", (e) => {
            const file = e.target.files[0];
            const preview = document.getElementById("stafModalFotoPreview");
            if (file && preview) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    preview.src = event.target.result;
                    preview.style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Close modals
    if (!window._stafModalsBound) {
        window._stafModalsBound = true;
        document.addEventListener("click", (e) => {
            if (e.target.closest("#closeStafPengaduanDetailBtn") || e.target.matches("#stafPengaduanDetailModal")) {
                document.getElementById("stafPengaduanDetailModal")?.classList.remove("open");
            }
            if (e.target.closest("#closeStafImageZoomBtn") || e.target.matches("#stafImageZoomModal")) {
                document.getElementById("stafImageZoomModal")?.classList.remove("open");
            }
        });

        // Image zoom click
        const detailImg = document.getElementById("stafDetailImg");
        if (detailImg) {
            detailImg.onclick = () => {
                const zoomModal = document.getElementById("stafImageZoomModal");
                const zoomedImg = document.getElementById("stafZoomedImg");
                if (zoomModal && zoomedImg) {
                    zoomedImg.src = detailImg.src;
                    zoomModal.classList.add("open");
                }
            };
        }

        const modalPreview = document.getElementById("stafModalFotoPreview");
        if (modalPreview) {
            modalPreview.onclick = () => {
                const zoomModal = document.getElementById("stafImageZoomModal");
                const zoomedImg = document.getElementById("stafZoomedImg");
                if (zoomModal && zoomedImg) {
                    zoomedImg.src = modalPreview.src;
                    zoomModal.classList.add("open");
                }
            };
        }
    }
}

async function initStafPengumumanLaravel() {
    const tbody = document.getElementById("staf-pengumuman-table-body");
    if (!tbody) return;

    const response = await fetch("/api/public/pengumuman");

    const data = await response.json();

    tbody.innerHTML = data
        .map(
            (item) => `

<tr>

    <td>${item.title ?? "-"}</td>

    <td>${item.date ?? "-"}</td>

    <td>

        <span class="badge">
            ${item.status ?? "-"}
        </span>

    </td>

    <td>-</td>

    <td>

        <button
            class="btn btn-warning btn-sm edit-pengumuman"
            data-id="${item.id}">
            Edit
        </button>

    </td>

</tr>

`,
        )
        .join("");
}

async function savePengumumanLaravel() {
    const id = document.getElementById("staf-pengumuman-id").value;

    const payload = {
        title: document.getElementById("staf-pengumuman-judul").value,

        date: document.getElementById("staf-pengumuman-tanggal").value,

        status: document.getElementById("staf-pengumuman-status").value,

        content: document.getElementById("staf-pengumuman-isi").value,
    };

    let response;

    if (id) {
        response = await fetch(`/api/admin/pengumuman/${id}`, {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",

                "X-CSRF-TOKEN": csrfToken,

                Accept: "application/json",
            },

            body: JSON.stringify(payload),
        });
    } else {
        response = await fetch("/api/admin/pengumuman", {
            method: "POST",

            headers: {
                "Content-Type": "application/json",

                "X-CSRF-TOKEN": csrfToken,

                Accept: "application/json",
            },

            body: JSON.stringify(payload),
        });
    }

    if (!response.ok) {
        alert("Gagal menyimpan pengumuman");

        return;
    }

    alert("Pengumuman berhasil disimpan");

    initStafPengumumanLaravel();
}

const form = document.getElementById("staf-pengumuman-form");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        await savePengumumanLaravel();
    });
}
const Guard = window.KelurahanGuard;
let _stafMobileMenuBound = false;

function ensureStafMobileMenu() {
    if (_stafMobileMenuBound) return;
    _stafMobileMenuBound = true;

    // Backdrop
    if (!document.getElementById("stafMenuBackdrop")) {
        const bd = document.createElement("div");
        bd.id = "stafMenuBackdrop";
        document.body.appendChild(bd);
    }

    const close = () => document.body.classList.remove("staf-menu-open");
    const toggle = () => document.body.classList.toggle("staf-menu-open");

    document.addEventListener("click", (e) => {
        if (e.target.id === "stafMenuBackdrop") return close();
        if (e.target.closest?.("[data-action='toggleStafMenu']"))
            return toggle();
        if (e.target.closest?.(".staf-side a[data-page]")) return close();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
    });
}

function mountStafMenuButton() {
    const top = document.querySelector(".staf-top");
    if (!top) return;

    let actions = top.querySelector(".top-actions");
    if (!actions) {
        const children = Array.from(top.children);
        if (children.length > 1 && children[1].tagName === "DIV") {
            actions = children[1];
            actions.classList.add("top-actions");
        } else {
            actions = document.createElement("div");
            actions.className = "top-actions";
            top.appendChild(actions);
        }
    }

    if (actions.querySelector("[data-action='toggleStafMenu']")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-ghost";
    btn.setAttribute("data-action", "toggleStafMenu");
    btn.innerHTML = `<i class="fa-solid fa-bars"></i> Menu`;
    actions.prepend(btn);
}

function setStafSidebarActive(hash) {
    document.querySelectorAll(".staf-side a").forEach((a) => {
        const match = a.getAttribute("href") === hash;
        a.classList.toggle("active", match);
    });
}

function fillStafUserLabel() {
    const el = document.getElementById("stafUserLabel");
    if (!el) return;
    const s = Guard?.getSession();
    el.textContent = s ? `Login: ${s.name} (${s.role})` : "-";
}

window.addEventListener("page:loaded", (e) => {
    const page = e.detail?.name || "";
    const isStaf = page.startsWith("staf/");
    document.body.classList.toggle("is-staf", isStaf);
    if (!isStaf) {
        document.body.classList.remove("staf-menu-open");
        return;
    }

    if (!Guard?.requireStaf()) return;

    fillStafUserLabel();
    setStafSidebarActive("#" + page);
    ensureStafMobileMenu();
    mountStafMenuButton();

    if (page === "staf/dashboard") {
        initStafDashboardLaravel();
    }
    if (page === "staf/pengumuman") {
        initStafPengumumanLaravel();
    }
    if (page === "staf/surat") {
        initStafSuratLaravel();
    }

    if (page === "staf/pengaduan") {
        initStafPengaduanLaravel();
    }
    if (page === 'staf/buat-surat') {
        if (typeof window.initBuatSurat === 'function') window.initBuatSurat();
    }
    if (page === 'staf/arsip-surat') {
        if (typeof window.initArsipSurat === 'function') window.initArsipSurat();
    }
    if (page === 'staf/chat') {
        initStafChatLaravel();
    }
});

let stafChatPollInterval = null;
async function initStafChatLaravel() {
    const threadListEl = document.getElementById("chatThreadList");
    const msgEl = document.getElementById("chatMessages");
    const inputEl = document.getElementById("chatInput");
    const formEl = document.getElementById("chatSendForm");
    const headEl = document.getElementById("chatRoomHead");

    if (!threadListEl || !msgEl) return;

    let activeThreadId = null;
    if (stafChatPollInterval) {
        clearInterval(stafChatPollInterval);
        stafChatPollInterval = null;
    }

    msgEl.innerHTML = `
        <div class="muted" style="padding:40px;text-align:center">
            <i class="fa-solid fa-comments" style="font-size:32px;margin-bottom:10px;color:var(--primary);"></i>
            <p style="font-weight:700">Diskusi Obrolan Staf</p>
            <p style="font-size:13px">Pilih salah satu thread pengaduan di sebelah kiri untuk melihat pesan dan merespons warga.</p>
        </div>
    `;

    async function loadThreads() {
        try {
            const res = await fetch("/api/staf/pengaduan", { credentials: "include" });
            if (!res.ok) throw new Error("Gagal memuat pengaduan");
            const items = await res.json();

            threadListEl.innerHTML = items.map(p => `
                <div class="thread-item staf-chat-thread" data-id="${p.id}" style="padding: 12px; border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 8px; cursor: pointer; transition: all 0.2s;" id="staf-thread-${p.id}">
                    <div style="font-weight: 800; font-size: 14px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.judul}</div>
                    <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">Pelapor: <b>${p.user?.name || "-"}</b></div>
                    <div style="font-size: 11px; display: flex; justify-content: space-between; margin-top: 6px; align-items: center;">
                        <span class="muted">${fmtDate(p.created_at)}</span>
                        <span>${statusBadge(p.status)}</span>
                    </div>
                </div>
            `).join("") || `<div class="muted" style="padding: 20px; text-align: center;">Belum ada pengaduan warga.</div>`;

            // Bind click to threads
            threadListEl.querySelectorAll(".staf-chat-thread").forEach(el => {
                el.addEventListener("click", () => {
                    const id = el.getAttribute("data-id");
                    selectThread(id);
                });
            });

            if (activeThreadId) {
                const activeEl = document.getElementById(`staf-thread-${activeThreadId}`);
                if (activeEl) activeEl.style.background = "rgba(31, 95, 224, 0.08)";
            }
        } catch (err) {
            console.error(err);
            threadListEl.innerHTML = `<div class="muted" style="color:red">Gagal memuat daftar percakapan.</div>`;
        }
    }

    async function loadMessages(silent = false) {
        if (!activeThreadId) return;
        // Check if user has left the page
        if (!document.getElementById("chatMessages")) {
            if (stafChatPollInterval) {
                clearInterval(stafChatPollInterval);
                stafChatPollInterval = null;
            }
            return;
        }

        try {
            const res = await fetch(`/api/staf/pengaduan/${activeThreadId}/chats`, { credentials: "include" });
            if (!res.ok) throw new Error("Gagal mengambil pesan");
            const chats = await res.json();

            const session = Guard?.getSession();
            const userId = session ? session.id : null;

            const originalScrollHeight = msgEl.scrollHeight;
            const originalScrollTop = msgEl.scrollTop;
            const isNearBottom = originalScrollTop + msgEl.clientHeight >= originalScrollHeight - 60;

            msgEl.innerHTML = chats.map(c => {
                const isSelf = String(c.user_id) === String(userId);
                const senderName = isSelf ? "Anda (Staf)" : (c.user?.name || "Warga");
                const alignment = isSelf ? "align-self: flex-end; background: var(--primary); color: white;" : "align-self: flex-start; background: #f1f5f9; color: var(--text);";
                const alignContainer = isSelf ? "justify-content: flex-end;" : "justify-content: flex-start;";

                return `
                    <div style="display: flex; ${alignContainer} width: 100%; margin-bottom: 10px;">
                        <div style="max-width: 75%; padding: 10px 14px; border-radius: 12px; display: flex; flex-direction: column; gap: 4px; box-shadow: var(--shadow-sm); ${alignment}">
                            <div style="font-size: 11px; font-weight: 800; opacity: 0.85;">${senderName}</div>
                            <div style="font-size: 13px; line-height: 1.4; white-space: pre-wrap;">${c.pesan}</div>
                            <div style="font-size: 9px; align-self: flex-end; opacity: 0.7;">${fmtDate(c.created_at)}</div>
                        </div>
                    </div>
                `;
            }).join("") || `<div class="muted" style="padding: 40px; text-align: center;">Belum ada pesan. Kirim tanggapan untuk memulai obrolan.</div>`;

            if (!silent || isNearBottom) {
                msgEl.scrollTop = msgEl.scrollHeight;
            }
        } catch (err) {
            console.error("Gagal memuat pesan:", err);
            if (!silent) {
                msgEl.innerHTML = `<div class="muted" style="color:red; text-align:center; padding:20px;">Gagal memuat pesan.</div>`;
            }
        }
    }

    async function selectThread(id) {
        activeThreadId = id;

        // Highlight selected
        threadListEl.querySelectorAll(".staf-chat-thread").forEach(el => {
            const elId = el.getAttribute("data-id");
            el.style.background = elId === String(id) ? "rgba(31, 95, 224, 0.08)" : "transparent";
            el.style.borderColor = elId === String(id) ? "var(--primary)" : "var(--border)";
        });

        // Update header
        try {
            const res = await fetch(`/api/staf/pengaduan/${id}`, { credentials: "include" });
            const p = await res.json();
            if (p && headEl) {
                headEl.innerHTML = `
                    <div style="font-weight: 1000; font-size: 16px;">${p.judul}</div>
                    <div style="font-size: 12px; color: var(--muted); margin-top: 2px;">
                        Pelapor: <b>${p.user?.name || "-"}</b> • Status: ${statusBadge(p.status)}
                    </div>
                `;
            }
        } catch (_) {}

        msgEl.innerHTML = `<div class="muted" style="padding:40px; text-align:center;"><i class="fa-solid fa-spinner fa-spin" style="font-size:24px; margin-bottom:10px;"></i><p>Memuat percakapan...</p></div>`;
        await loadMessages();

        // Set polling interval
        if (stafChatPollInterval) clearInterval(stafChatPollInterval);
        stafChatPollInterval = setInterval(() => loadMessages(true), 4000);
    }

    async function sendMessage(e) {
        if (e) e.preventDefault();

        if (!activeThreadId) {
            alert("Pilih percakapan pengaduan terlebih dahulu.");
            return;
        }
        const pesan = inputEl.value.trim();
        if (!pesan) return;

        const btn = formEl.querySelector("button[type='submit']");
        if (btn) btn.disabled = true;

        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
            const res = await fetch(`/api/staf/pengaduan/${activeThreadId}/chats`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrf,
                    Accept: "application/json"
                },
                body: JSON.stringify({ pesan })
            });

            if (!res.ok) throw new Error("Gagal mengirim pesan");
            inputEl.value = "";
            await loadMessages();
        } catch (err) {
            console.error(err);
            alert("Gagal mengirim pesan.");
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    // Bind events
    if (formEl) formEl.onsubmit = sendMessage;

    // Initialize threads
    loadThreads();
}
