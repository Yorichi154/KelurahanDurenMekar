// assets/js/warga/warga.js
// - Ajukan surat & pengaduan
// - Pantau status
// - Chat dinonaktifkan
(function () {
    const Guard = window.KelurahanGuard;

    const fmtDate = (iso) => {
        if (!iso) return "-";
        try {
            return new Date(iso).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch (_) {
            return iso;
        }
    };

    const fmtDateTime = (iso) => {
        if (!iso) return "-";
        try {
            const d = new Date(iso);
            const tgl = d.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
            const jam = d.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
            });
            return `${tgl} ${jam}`;
        } catch (_) {
            return iso;
        }
    };

    const fileToDataURL = (file) =>
        new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(String(r.result || ""));
            r.onerror = () => reject(new Error("Gagal membaca file"));
            r.readAsDataURL(file);
        });

    function pill(status) {
        const s = String(status || "").toLowerCase();
        const map = {
            menunggu: "yellow",
            ditinjau: "blue",
            diproses: "blue",
            selesai: "green",
            ditolak: "red",
            baru: "yellow",
        };
        const cls = map[s] || "";
        return `<span class="pill ${cls}">${s || "-"}</span>`;
    }

    const esc = (v) =>
        String(v ?? "").replace(
            /[&<>"]/g,
            (ch) =>
                ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                })[ch],
        );

    let _wargaMobileMenuBound = false;

    function ensureWargaMobileMenu() {
        if (_wargaMobileMenuBound) return;
        _wargaMobileMenuBound = true;

        // Backdrop
        if (!document.getElementById("wargaMenuBackdrop")) {
            const bd = document.createElement("div");
            bd.id = "wargaMenuBackdrop";
            document.body.appendChild(bd);
        }

        const close = () => document.body.classList.remove("warga-menu-open");
        const toggle = () => document.body.classList.toggle("warga-menu-open");

        document.addEventListener("click", (e) => {
            if (e.target.id === "wargaMenuBackdrop") return close();
            if (e.target.closest?.("[data-action='toggleWargaMenu']"))
                return toggle();
            if (e.target.closest?.(".warga-side a[data-page]")) return close();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") close();
        });
    }

    function mountWargaMenuButton() {
        const top = document.querySelector(".warga-top");
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

        if (actions.querySelector("[data-action='toggleWargaMenu']")) return;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-ghost";
        btn.setAttribute("data-action", "toggleWargaMenu");
        btn.innerHTML = `<i class="fa-solid fa-bars"></i> Menu`;
        actions.prepend(btn);
    }

    function setWargaSidebarActive(hash) {
        document.querySelectorAll(".warga-side a").forEach((a) => {
            const match = a.getAttribute("href") === hash;
            a.classList.toggle("active", match);
        });
    }

    function fillWargaUserLabel() {
        const el = document.getElementById("wargaUserLabel");
        if (!el) return;
        const s = Guard?.getSession();
        if (s) {
            const rtRw =
                s.rt || s.rw
                    ? ` RT ${s.rt || "-"}/RW ${s.rw || "-"}`
                    : "";
            el.textContent = `${s.name || "Warga"}${rtRw}${s.email ? ` • ${s.email}` : ""}`;
        } else {
            el.textContent = "-";
        }
    }

    // =========================
    // DASHBOARD
    // =========================
    async function initDashboard() {
        try {
            const response = await fetch("/api/warga/dashboard", {
                credentials: "include",
            });

            if (!response.ok) {
                console.warn("Dashboard API tidak tersedia");
                return;
            }

            const data = await response.json();

            const setTxt = (id, value) => {
                const el = document.getElementById(id);
                if (el) {
                    el.textContent = value;
                }
            };

            setTxt("metricWSuratMenunggu", data.surat_menunggu || 0);
            setTxt("metricWSuratDiproses", data.surat_diproses || 0);
            setTxt("metricWSuratSelesai", data.surat_selesai || 0);
            setTxt("metricWPengaduanAktif", data.pengaduan_aktif || 0);

            const tableSurat = document.getElementById("wargaSuratLatest");
            if (tableSurat) {
                if (data.surat_terbaru && data.surat_terbaru.length) {
                    tableSurat.innerHTML = data.surat_terbaru
                        .map(
                            (s) => `
                            <tr>
                                <td><b>${esc(s.jenis_surat || "-")}</b><div class="muted" style="font-size:11px">${esc(s.keperluan || "")}</div></td>
                                <td>${fmtDate(s.created_at)}</td>
                                <td>${pill(s.status)}</td>
                            </tr>`,
                        )
                        .join("");
                } else {
                    tableSurat.innerHTML = `<tr><td colspan="3" class="muted" style="text-align:center;padding:12px">Belum ada pengajuan surat.</td></tr>`;
                }
            }

            const tablePengaduan = document.getElementById("wargaPengaduanLatest");
            if (tablePengaduan) {
                if (data.pengaduan_terbaru && data.pengaduan_terbaru.length) {
                    tablePengaduan.innerHTML = data.pengaduan_terbaru
                        .map(
                            (p) => `
                            <tr>
                                <td><b>${esc(p.judul || "-")}</b><div class="muted" style="font-size:11px">${esc(p.kategori || "")}</div></td>
                                <td>${fmtDate(p.created_at)}</td>
                                <td>${pill(p.status)}</td>
                            </tr>`,
                        )
                        .join("");
                } else {
                    tablePengaduan.innerHTML = `<tr><td colspan="3" class="muted" style="text-align:center;padding:12px">Belum ada pengaduan.</td></tr>`;
                }
            }
        } catch (error) {
            console.error("Gagal memuat dashboard:", error);
        }
    }

    // =========================
    // SURAT (Tanpa Global Flag)
    // =========================
    async function initSurat() {
        const tbody = document.getElementById("wargaSuratTbody");
        const search = document.getElementById("wargaSuratSearch");
        const filter = document.getElementById("wargaSuratFilter");
        const form = document.getElementById("wargaSuratForm");
        let currentLetters = [];

        // esc is defined globally in warga.js

        const fmtSize = (n) => {
            const b = Number(n || 0);
            if (!b) return "-";
            if (b < 1024) return `${b} B`;
            if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
            return `${(b / (1024 * 1024)).toFixed(1)} MB`;
        };

        const isRealUrl = (u) =>
            /^(https?:\/\/|\/|assets\/|data:)/i.test(String(u || "").trim());

        function ensureBerkasModal() {
            let modal = document.getElementById("wargaBerkasModal");
            if (modal) {
                return {
                    modal,
                    meta: modal.querySelector("#wargaBerkasMeta"),
                    body: modal.querySelector("#wargaBerkasBody"),
                };
            }

            modal = document.createElement("div");
            modal.className = "modal";
            modal.id = "wargaBerkasModal";
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-head">
                            <div class="modal-title">
                                <h3>Berkas Persyaratan</h3>
                                <div class="muted" id="wargaBerkasMeta" style="font-size:12px"></div>
                            </div>
                            <button class="icon-btn" type="button" data-action="closeWargaBerkas" aria-label="Tutup">
                                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div id="wargaBerkasBody"></div>
                        </div>
                        <div class="modal-foot">
                            <button class="btn btn-light" type="button" data-action="closeWargaBerkas">Tutup</button>
                        </div>
                    </div>
                </div>`;

            document.body.appendChild(modal);

            return {
                modal,
                meta: modal.querySelector("#wargaBerkasMeta"),
                body: modal.querySelector("#wargaBerkasBody"),
            };
        }

        const berkasUi = ensureBerkasModal();

        function openBerkasModal(item) {
            const files = Array.isArray(item?.berkas) ? item.berkas : [];
            const fileSurat = item?.file_surat;
            const hasil =
                item?.hasilSurat && typeof item.hasilSurat === "object"
                    ? item.hasilSurat
                    : null;
            if (berkasUi.meta) {
                const jenis = item?.jenis_surat || item?.jenis || "-";
                const tanggal = item?.created_at || item?.tanggal;
                berkasUi.meta.innerHTML = `${esc(jenis)} • ${esc(fmtDate(tanggal))} • ${pill(item?.status)}`;
            }

            if (!berkasUi.body) return;

            let html = "";

            if (fileSurat) {
                const fileUrl = `/storage/${fileSurat}`;
                html += `
                    <div class="card" style="margin-bottom:10px">
                        <div class="card-body" style="padding:14px">
                            <div style="display:flex;gap:12px;justify-content:space-between;align-items:flex-start;flex-wrap:wrap">
                                <div>
                                    <div style="font-weight:1000">Hasil Surat</div>
                                    <div class="muted" style="font-size:12px">Surat selesai diproses.</div>
                                </div>
                                <div>
                                    <a class="btn btn-primary btn-sm" href="${fileUrl}" target="_blank" rel="noopener">
                                        <i class="fa-regular fa-eye" aria-hidden="true"></i> Buka Surat
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>`;
            } else if (hasil) {
                const hName = esc(hasil.fileName || "surat.pdf");
                const hMeta = `${esc(hasil.mime || "application/pdf")}${hasil.size ? ` • ${fmtSize(hasil.size)}` : ""}`;
                const hNote = hasil.note
                    ? `<div class="muted" style="font-size:12px;margin-top:6px">Catatan: ${esc(hasil.note)}</div>`
                    : "";
                const hSent = hasil.sentAt
                    ? `<div class="muted" style="font-size:12px;margin-top:6px">Dikirim: ${esc(fmtDateTime(hasil.sentAt))}</div>`
                    : "";
                const hBtn = hasil.dataUrl
                    ? `<a class="btn btn-primary btn-sm" href="${hasil.dataUrl}" target="_blank" rel="noopener">
                        <i class="fa-regular fa-eye" aria-hidden="true"></i> Buka Surat
                    </a>`
                    : `<span class="pill yellow">Tidak ada file</span>`;

                html += `
                    <div class="card" style="margin-bottom:10px">
                        <div class="card-body" style="padding:14px">
                            <div style="display:flex;gap:12px;justify-content:space-between;align-items:flex-start;flex-wrap:wrap">
                                <div>
                                    <div style="font-weight:1000">Hasil Surat</div>
                                    <div class="muted" style="font-size:12px">${hName}${hMeta ? ` • ${hMeta}` : ""}</div>
                                    ${hNote}
                                    ${hSent}
                                </div>
                                <div>${hBtn}</div>
                            </div>
                        </div>
                    </div>`;
            } else {
                html += `<div class="muted" style="margin-bottom:10px">Hasil surat belum tersedia. Silakan menunggu proses dari petugas.</div>`;
            }

            html += `<div style="font-weight:1000; margin:6px 0 10px">Berkas Persyaratan</div>`;

            if (!files.length) {
                html += `<div class="muted">Tidak ada berkas persyaratan yang diunggah.</div>`;
            } else {
                html += files
                    .map((f) => {
                        const req = esc(f?.requirement || "Berkas");
                        const name = esc(f?.fileName || "-");
                        const meta = `${esc(f?.mime || "")}${f?.size ? ` • ${fmtSize(f.size)}` : ""}`;
                        const openBtn = f?.dataUrl
                            ? `<a class="btn btn-primary btn-sm" href="${f.dataUrl}" target="_blank" rel="noopener">
                                <i class="fa-regular fa-eye" aria-hidden="true"></i> Buka
                            </a>`
                            : `<span class="pill yellow">Tidak ada preview</span>`;

                        const note = !f?.dataUrl
                            ? `<div class="muted" style="font-size:12px;margin-top:6px">Catatan: file demo hanya menyimpan preview untuk berkas kecil (≤ 200KB).</div>`
                            : "";

                        return `
                            <div class="card" style="margin-bottom:10px">
                                <div class="card-body" style="padding:14px">
                                    <div style="display:flex;gap:12px;justify-content:space-between;align-items:flex-start;flex-wrap:wrap">
                                        <div>
                                            <div style="font-weight:1000">${req}</div>
                                            <div class="muted" style="font-size:12px">${name}${meta ? ` • ${meta}` : ""}</div>
                                            ${note}
                                        </div>
                                        <div>${openBtn}</div>
                                    </div>
                                </div>
                            </div>`;
                    })
                    .join("");
            }

            berkasUi.body.innerHTML = html;
            berkasUi.modal.classList.add("open");
        }

        function closeBerkasModal() {
            berkasUi.modal.classList.remove("open");
        }

        const draw = async () => {
            if (!tbody) return;

            try {
                const response = await fetch("/api/warga/surat", {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                let items = await response.json();
                currentLetters = items;

                const q = (search?.value || "").toLowerCase();
                const f = (filter?.value || "").toLowerCase();

                if (f) {
                    items = items.filter(
                        (x) => String(x.status).toLowerCase() === f,
                    );
                }

                if (q) {
                    items = items.filter((x) => {
                        const hay =
                            `${x.jenis_surat || ""} ${x.keperluan || ""}`.toLowerCase();
                        return hay.includes(q);
                    });
                }

                items = items.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at),
                );

                tbody.innerHTML =
                    items
                        .map(
                            (s) => `
                                <tr>
                                    <td><b>${esc(s.jenis_surat || "-")}</b></td>
                                    <td>${esc(s.keperluan || "-")}</td>
                                    <td>${fmtDate(s.created_at)}</td>
                                    <td>${pill(s.status)}</td>
                                    <td>
                                        <button type="button" class="btn btn-primary btn-sm" data-action="viewDetail" data-id="${s.id}">
                                            <i class="fa-solid fa-eye"></i> Detail
                                        </button>
                                        ${
                                            s.file_surat
                                                ? `
                                             <a href="/storage/${s.file_surat}" target="_blank" class="btn btn-success btn-sm" style="margin-left:4px">
                                                 <i class="fa-solid fa-download"></i> Download
                                             </a>
                                         `
                                                : ""
                                        }
                                    </td>
                                </tr>
                            `,
                        )
                        .join("") ||
                    `
                        <tr>
                            <td colspan="5" class="muted" style="text-align:center;padding:20px">
                                Belum ada pengajuan surat.
                            </td>
                        </tr>
                    `;
            } catch (error) {
                console.error("Gagal memuat data surat:", error);
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="muted" style="text-align:center;padding:20px;color:red">
                            Gagal memuat data surat. Silakan refresh halaman.
                        </td>
                    </tr>
                `;
            }
        };

        // ✅ Event Delegation untuk tombol detail (mencegah duplicate listeners)
        tbody?.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-action='viewDetail']");
            if (!btn) return;
            const id = btn.dataset.id;
            const item = currentLetters.find(x => String(x.id) === String(id));
            if (item) {
                openBerkasModal(item);
            } else {
                console.warn("Letter not found for ID:", id);
            }
        });

        // ✅ Event Delegation untuk close modal
        document.addEventListener("click", (e) => {
            if (e.target.closest("[data-action='closeWargaBerkas']")) {
                closeBerkasModal();
                return;
            }
            if (e.target === berkasUi.modal) {
                closeBerkasModal();
            }
        });

        // ✅ Form submit - cleanup listener sebelumnya
        if (form) {
            // Hapus listener lama jika ada (mencegah duplicate)
            form.replaceWith(form.cloneNode(true));
            const newForm = document.getElementById("wargaSuratForm");

            newForm.addEventListener("submit", async (ev) => {
                ev.preventDefault();

                const session = Guard?.getSession();
                if (!session) {
                    alert("Silakan login terlebih dahulu");
                    return;
                }

                const jenis = (
                    document.getElementById("wsJenis")?.value || ""
                ).trim();
                const keperluan = (
                    document.getElementById("wsKeperluan")?.value || ""
                ).trim();

                if (!jenis || !keperluan) {
                    alert("Jenis surat dan keperluan wajib diisi.");
                    return;
                }

                try {
                    const csrf = document.querySelector(
                        'meta[name="csrf-token"]',
                    )?.content;

                    const response = await fetch("/api/warga/surat", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            "X-CSRF-TOKEN": csrf,
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            jenis_surat: jenis,
                            keperluan: keperluan,
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(
                            `HTTP error! status: ${response.status}`,
                        );
                    }

                    alert(
                        "Pengajuan surat berhasil dikirim. Silakan pantau statusnya.",
                    );
                    newForm.reset();
                    draw();
                } catch (error) {
                    console.error("Gagal mengirim surat:", error);
                    alert("Gagal mengirim surat. Silakan coba lagi.");
                }
            });
        }

        draw();
    }

    // =========================
    // PENGADUAN (Tanpa Global Flag)
    // =========================
    async function initPengaduan() {
        const tbody = document.getElementById("wargaPengaduanTbody");
        const search = document.getElementById("wargaPengaduanSearch");
        const filter = document.getElementById("wargaPengaduanFilter");
        const form = document.getElementById("wargaPengaduanForm");

        const draw = async () => {
            if (!tbody) return;

            try {
                const response = await fetch("/api/warga/pengaduan", {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                let items = await response.json();

                const q = (search?.value || "").toLowerCase();
                const f = (filter?.value || "").toLowerCase();

                if (f) {
                    items = items.filter(
                        (x) => String(x.status).toLowerCase() === f,
                    );
                }

                if (q) {
                    items = items.filter((x) => {
                        const hay =
                            `${x.judul || ""} ${x.kategori || ""} ${x.lokasi || ""}`.toLowerCase();
                        return hay.includes(q);
                    });
                }

                items = items.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at),
                );

                tbody.innerHTML =
                    items
                        .map(
                            (p) => `
                                <tr>
                                    <td><b>${p.judul || "-"}</b> <div class="muted" style="font-size:12px">${p.deskripsi || p.isi || ""}</div></td>
                                    <td>${p.kategori || "-"} <div class="muted" style="font-size:12px">${p.lokasi || ""}</div></td>
                                    <td>${fmtDate(p.created_at || p.tanggal)}</td>
                                    <td>${pill(p.status)}</td>
                                    <td>-</td>
                                </tr>`,
                        )
                        .join("") ||
                    `<tr><td colspan="5" class="muted">Belum ada pengaduan.</td></tr>`;
            } catch (error) {
                console.error("Gagal memuat pengaduan:", error);
                tbody.innerHTML = `<tr><td colspan="4" class="muted" style="color:red">Gagal memuat data pengaduan.</td></tr>`;
            }
        };

        // ✅ Form submit - cleanup listener sebelumnya
        if (form) {
            form.replaceWith(form.cloneNode(true));
            const newForm = document.getElementById("wargaPengaduanForm");

            newForm.addEventListener("submit", async (ev) => {
                ev.preventDefault();

                const session = Guard?.getSession();
                if (!session) {
                    alert("Silakan login terlebih dahulu");
                    return;
                }

                const kategori = (
                    document.getElementById("wpKategori")?.value || ""
                ).trim();
                const judul = (
                    document.getElementById("wpJudul")?.value || ""
                ).trim();
                const lokasi = (
                    document.getElementById("wpLokasi")?.value || ""
                ).trim();
                const buktiInput = document.getElementById("wpBukti");
                const buktiFile = buktiInput?.files?.[0] || null;
                const deskripsi = (
                    document.getElementById("wpDeskripsi")?.value || ""
                ).trim();

                if (!kategori || !judul || !lokasi || !deskripsi) {
                    alert(
                        "Kategori, judul, lokasi, dan deskripsi wajib diisi.",
                    );
                    return;
                }

                try {
                    const csrf = document.querySelector(
                        'meta[name="csrf-token"]',
                    )?.content;

                    // ✅ Upload lampiran via FormData
                    const formData = new FormData();
                    formData.append("judul", judul);
                    formData.append("isi", deskripsi);
                    formData.append("kategori", kategori);
                    formData.append("lokasi", lokasi);
                    formData.append("status", "menunggu");

                    if (buktiFile) {
                        formData.append("lampiran", buktiFile);
                    }

                    const response = await fetch("/api/warga/pengaduan", {
                        method: "POST",
                        headers: {
                            "X-CSRF-TOKEN": csrf,
                            Accept: "application/json",
                        },
                        credentials: "include",
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error(
                            `HTTP error! status: ${response.status}`,
                        );
                    }

                    const pengaduan = await response.json();

                    sessionStorage.setItem("postSubmitType", "pengaduan");
                    sessionStorage.setItem("postSubmitId", pengaduan.id);
                    sessionStorage.setItem("postSubmitTitle", judul);

                    if (typeof window.navigateTo === "function")
                        window.navigateTo("warga/konfirmasi");
                    else window.location.hash = "#warga/konfirmasi";
                } catch (error) {
                    console.error("Gagal mengirim pengaduan:", error);
                    alert("Gagal mengirim pengaduan. Coba lagi.");
                }
            });
        }

        draw();
    }

    // =========================
    // CHAT - DINONAKTIFKAN
    // =========================
    function initChat() {
        console.warn(
            "️ Chat belum terhubung backend. Fitur ini dinonaktifkan sementara.",
        );

        const msgEl = document.getElementById("wargaChatMessages");
        if (msgEl) {
            msgEl.innerHTML = `
                <div class="muted" style="padding:20px;text-align:center">
                    <i class="fa-solid fa-info-circle" style="font-size:24px;margin-bottom:10px"></i>
                    <p>Fitur chat sedang dalam pengembangan.</p>
                    <p>Silakan gunakan pengaduan untuk komunikasi dengan petugas.</p>
                </div>
            `;
        }
    }

    // =========================
    // PROFIL (Tanpa Global Flag)
    // =========================
    async function initProfil() {
        const form = document.getElementById("wargaProfilForm");
        if (!form) return;

        try {
            // Load profil dari API
            const response = await fetch("/api/warga/profil", {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const user = await response.json();

            const setVal = (id, v) => {
                const el = document.getElementById(id);
                if (el) el.value = v || "";
            };

            setVal("wpNama", user.name || "");
            setVal("wpEmail", user.email || "");
            setVal("wpTelp", user.telp || "");
            setVal("wpRT", user.rt || "");
            setVal("wpRW", user.rw || "");
            setVal("wpAlamat", user.alamat || "");

            // Update label user
            const label = document.getElementById("wargaUserLabel");
            if (label) {
                const rtRw =
                    user.rt || user.rw
                        ? ` RT ${user.rt || "-"}/RW ${user.rw || "-"}`
                        : "";
                label.textContent = `${user.name || "Warga"}${rtRw}${user.email ? ` • ${user.email}` : ""}`;
            }

            // ✅ Form submit - cleanup listener sebelumnya
            form.replaceWith(form.cloneNode(true));
            const newForm = document.getElementById("wargaProfilForm");

            newForm.addEventListener("submit", async (e) => {
                e.preventDefault();

                const payload = {
                    name: document.getElementById("wpNama")?.value || "",
                    telp: document.getElementById("wpTelp")?.value || "",
                    rt: document.getElementById("wpRT")?.value || "",
                    rw: document.getElementById("wpRW")?.value || "",
                    alamat: document.getElementById("wpAlamat")?.value || "",
                };

                try {
                    const csrf = document.querySelector(
                        'meta[name="csrf-token"]',
                    )?.content;

                    const response = await fetch("/api/warga/profil", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": csrf,
                            Accept: "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify(payload),
                    });

                    if (!response.ok) {
                        throw new Error(
                            `HTTP error! status: ${response.status}`,
                        );
                    }

                    alert("Profil berhasil diperbarui");

                    // Update session di Guard
                    const updatedSession = {
                        ...Guard.getSession(),
                        ...payload,
                    };
                    Guard.setSession(updatedSession);
                } catch (error) {
                    console.error("Gagal menyimpan profil:", error);
                    alert("Gagal menyimpan profil. Silakan coba lagi.");
                }
            });
        } catch (error) {
            console.error("Gagal memuat profil:", error);
        }
    }

    // =========================
    // KONFIRMASI (Thank You)
    // =========================
    function initKonfirmasi() {
        const type = (
            sessionStorage.getItem("postSubmitType") || ""
        ).toLowerCase();
        const id = sessionStorage.getItem("postSubmitId") || "";

        const titleEl = document.getElementById("thanksMainTitle");
        const descEl = document.getElementById("thanksMainDesc");
        const refBox = document.getElementById("thanksRefBox");
        const refCode = document.getElementById("thanksRefCode");
        const trackLink = document.getElementById("thanksTrackLink");

        const refLabel = document.getElementById("refLabel");
        const refSub = document.getElementById("refSub");
        
        const card1Title = document.getElementById("card1Title");
        const card1Desc = document.getElementById("card1Desc");
        
        const step1Text = document.getElementById("step1Text");
        const step2Text = document.getElementById("step2Text");
        const step3Text = document.getElementById("step3Text");
        
        const thanksBtnSurat = document.getElementById("thanksBtnSurat");

        if (id && refBox && refCode) {
            refBox.style.display = "block";
            refCode.textContent = id;
        } else if (refBox) {
            refBox.style.display = "none";
        }

        if (type === "pengaduan") {
            if (titleEl) titleEl.textContent = "Laporan Pengaduan Berhasil Dikirim!";
            if (descEl) descEl.textContent = "Terima kasih atas laporan Anda. Kami akan menindaklanjutinya segera.";
            
            if (refLabel) refLabel.textContent = "Nomor Referensi Laporan:";
            if (refSub) refSub.textContent = "Simpan nomor referensi ini untuk melacak status laporan Anda";
            
            if (card1Title) card1Title.textContent = "Waktu Peninjauan";
            if (card1Desc) card1Desc.textContent = "Laporan pengaduan Anda akan ditinjau oleh petugas kelurahan dalam waktu 1-2 hari kerja.";
            
            if (step1Text) step1Text.textContent = "Pantau perkembangan tindak lanjut laporan melalui menu Pengaduan Saya";
            if (step2Text) step2Text.textContent = "Petugas mungkin akan menghubungi Anda untuk meminta informasi tambahan";
            if (step3Text) step3Text.textContent = "Apabila laporan selesai ditindaklanjuti, status laporan akan diperbarui menjadi Selesai";
            
            if (trackLink) {
                trackLink.innerHTML = `<i class="fa-regular fa-comments"></i> Lihat Status Laporan`;
                trackLink.dataset.page = "warga/pengaduan";
                trackLink.setAttribute("href", "#warga/pengaduan");
            }
            
            if (thanksBtnSurat) {
                thanksBtnSurat.innerHTML = `<i class="fa-solid fa-bullhorn"></i> Buat Laporan Lagi`;
                thanksBtnSurat.dataset.page = "layanan";
                thanksBtnSurat.setAttribute("href", "#layanan");
            }
        } else {
            if (titleEl) titleEl.textContent = "Permohonan Surat Berhasil Dikirim!";
            if (descEl) descEl.textContent = "Terima kasih atas kepercayaan Anda menggunakan layanan kami";
            
            if (refLabel) refLabel.textContent = "Nomor Registrasi:";
            if (refSub) refSub.textContent = "Simpan nomor ini untuk melacak status permohonan surat Anda";
            
            if (card1Title) card1Title.textContent = "Waktu Pemprosesan";
            if (card1Desc) card1Desc.textContent = "Permohonan surat Anda akan diproses dalam waktu 2-5 hari kerja. Status akan diperbarui secara berkala.";
            
            if (step1Text) step1Text.textContent = "Pantau status permohonan Anda secara berkala melalui dashboard";
            if (step2Text) step2Text.textContent = "Pastikan notifikasi email Anda aktif agar tidak melewatkan update penting";
            if (step3Text) step3Text.textContent = "Jika surat sudah selesai, Anda akan diberitahu untuk mengambil dokumen di kantor kelurahan";
            
            if (trackLink) {
                trackLink.innerHTML = `<i class="fa-regular fa-file-lines"></i> Lihat Status Surat`;
                trackLink.dataset.page = "warga/surat";
                trackLink.setAttribute("href", "#warga/surat");
            }
            
            if (thanksBtnSurat) {
                thanksBtnSurat.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Ajukan Surat Lagi`;
                thanksBtnSurat.dataset.page = "pengajuan-online";
                thanksBtnSurat.setAttribute("href", "#pengajuan-online");
            }
        }

        const btnCopy = document.getElementById("btnCopyReg");
        if (btnCopy) {
            btnCopy.onclick = () => {
                if (id) {
                    navigator.clipboard.writeText(id).then(() => {
                        alert("Nomor registrasi berhasil disalin!");
                    }).catch(() => {
                        alert("Gagal menyalin nomor registrasi.");
                    });
                }
            };
        }
    }

    // =========================
    // HOOK ROUTER (Tanpa Global Flags)
    // =========================
    window.addEventListener("page:loaded", (e) => {
        const name = e.detail?.name || "";
        const isWarga = name.startsWith("warga/");
        document.body.classList.toggle("is-warga", isWarga);
        if (!isWarga) {
            document.body.classList.remove("warga-menu-open");
            return;
        }

        const session = Guard?.getSession();
        if (!session) {
            console.warn("User tidak terautentikasi");
            return;
        }

        fillWargaUserLabel();
        setWargaSidebarActive("#" + name);
        ensureWargaMobileMenu();
        mountWargaMenuButton();

        if (name === "warga/pengaduan") {
            initPengaduan();
        }
        if (name === "warga/profil") {
            initProfil();
        }
        if (name === "warga/dashboard") {
            initDashboard();
        }
        if (name === "warga/surat") {
            initSurat();
        }
        if (name === "warga/chat") {
            initChat();
        }
        if (name === "warga/konfirmasi") {
            initKonfirmasi();
        }
    });
})();
