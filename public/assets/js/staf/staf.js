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
    return `
        <span class="badge badge-${status}">
            ${status}
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

async function openStafSuratDetail(id) {
    try {
        const res = await fetch(`/api/staf/surat/${id}`, {
            headers: { Accept: "application/json" }
        });
        const surat = await res.json();
        if (!surat) return;

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
        } else if (surat.status === "ditolak") {
            statusText = "Ditolak";
            statusPillClass = "badge-reject";
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

    if (!tbody) return;

    try {
        const res = await fetch("/api/staf/surat");

        const data = await res.json();
        const emptyEl = document.getElementById("staf-pengumuman-empty");
        if (emptyEl) {
            emptyEl.style.display = data.length ? "none" : "block";
        }

        tbody.innerHTML = data
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
                    <button
                        class="btn btn-primary btn-sm view-surat-detail"
                        data-id="${surat.id}"
                        style="padding: 6px 10px; border-radius: 8px; font-weight: 800; font-size: 12px; margin-right: 6px;"
                    >
                        <i class="fa-solid fa-eye"></i> Detail
                    </button>
                    <select
                        class="surat-status"
                        data-id="${surat.id}"
                        style="padding: 4px; border-radius: 6px;"
                    >
                        <option value="menunggu"
                            ${surat.status === "menunggu" ? "selected" : ""}>
                            Menunggu
                        </option>

                        <option value="diproses"
                            ${surat.status === "diproses" ? "selected" : ""}>
                            Diproses
                        </option>

                        <option value="selesai"
                            ${surat.status === "selesai" ? "selected" : ""}>
                            Selesai
                        </option>

                        <option value="ditolak"
                            ${surat.status === "ditolak" ? "selected" : ""}>
                            Ditolak
                        </option>
                    </select>

                    <button
                        class="btn btn-ghost save-surat"
                        data-id="${surat.id}">
                        Simpan
                    </button>
                </td>
            </tr>
        `,
            )
            .join("");
    } catch (err) {
        console.error(err);
    }
}

// Bind modal-related click events for Staf
document.addEventListener("click", async (e) => {
    const viewBtn = e.target.closest(".view-surat-detail");
    if (viewBtn) {
        const id = viewBtn.dataset.id;
        openStafSuratDetail(id);
        return;
    }

    if (e.target.closest("[data-action='closeModal']")) {
        const modal = document.getElementById("suratDetailModal");
        if (modal) {
            modal.classList.remove("open");
            modal.setAttribute("aria-hidden", "true");
        }
        return;
    }

    const acceptBtn = e.target.closest(".accept-surat");
    if (acceptBtn) {
        const id = acceptBtn.dataset.id;
        if (confirm("Setujui dan proses pengajuan surat ini?")) {
            await updateStafSuratStatus(id, "diproses");
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
                >
                    <option value="menunggu" ${item.status === "menunggu" ? "selected" : ""}>Menunggu</option>
                    <option value="diproses" ${item.status === "diproses" ? "selected" : ""}>Diproses</option>
                    <option value="selesai" ${item.status === "selesai" ? "selected" : ""}>Selesai</option>
                    <option value="ditolak" ${item.status === "ditolak" ? "selected" : ""}>Ditolak</option>
                </select>

                <button
                    class="btn btn-primary save-pengaduan"
                    data-id="${item.id}"
                >
                    Simpan
                </button>

            </td>

        </tr>
    `,
        )
        .join("");
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
});
