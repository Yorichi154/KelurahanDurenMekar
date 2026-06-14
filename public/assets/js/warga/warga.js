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
            siap_diambil: "green",
            ditolak: "red",
            baru: "yellow",
        };
        const textMap = {
            siap_diambil: "Siap Diambil",
        };
        const cls = map[s] || "";
        const label = textMap[s] || s;
        return `<span class="pill ${cls}">${label || "-"}</span>`;
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

            if (item?.status === 'siap_diambil' && item?.pickup) {
                const p = item.pickup;
                html += `
                    <div class="card" style="margin-bottom:15px; border-left: 5px solid #10b981; background: #f0fdf4;">
                        <div class="card-body" style="padding:16px">
                            <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">
                                <i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 20px;"></i>
                                <span style="font-weight:1000; color: #14532d; font-size:15px;">Pengajuan Surat Disetujui & Siap Diambil</span>
                            </div>
                            <p style="font-size:13px; color:#14532d; margin-bottom:12px;">
                                Silakan datang ke Kelurahan Duren Mekar untuk pengambilan surat dengan membawa dokumen asli: <b>KTP Asli</b> dan <b>KK Asli</b>.
                            </p>
                            <div style="background:#fff; border:1px solid #dcfce7; padding:12px; border-radius:6px; font-size:13px; display:flex; flex-direction:column; gap:6px;">
                                <div><b>Nomor Surat:</b> ${esc(p.nomor_surat || '-')}</div>
                                <div><b>Nomor Antrian:</b> <span class="pill green" style="font-weight:bold; font-size:12px;">${esc(p.nomor_antrian || '-')}</span></div>
                                <div><b>Tanggal Pengambilan:</b> ${esc(fmtDate(p.tanggal_pengambilan))}</div>
                            </div>
                        </div>
                    </div>`;
            }

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
            } else if (item?.status !== 'siap_diambil') {
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

        const drawServicesGrid = async () => {
            const grid = document.getElementById("wargaServicesGrid");
            if (!grid) return;

            try {
                const res = await fetch("/api/public/pelayanan", { credentials: "include" });
                if (!res.ok) throw new Error("Gagal mengambil pelayanan");
                const services = await res.json();

                if (!services || !services.length) {
                    grid.innerHTML = `<div class="muted" style="grid-column: 1/-1; text-align: center; padding: 20px;">Belum ada pelayanan tersedia.</div>`;
                    return;
                }

                grid.innerHTML = services.map(x => {
                    const isOnline = !!x.online;
                    const badgeClass = isOnline ? "badge-success" : "badge-warning";
                    const badgeText = isOnline ? "Bisa Online" : "Harus Datang Langsung";
                    const estimasi = x.estimasi || (isOnline ? "1 hari kerja" : "1-3 hari kerja");
                    const biaya = x.biaya || "Gratis";
                    const iconClass = isOnline ? "fa-file-signature" : "fa-building-columns";

                    let actionBtn = "";
                    if (isOnline) {
                        actionBtn = `<button class="btn btn-primary btn-sm srv-apply-btn" data-id="${x.id}" style="width:100%; text-align:center; font-weight:bold;">
                            <i class="fa-solid fa-paper-plane" style="margin-right:6px;"></i> ${x.teks_tombol || "Ajukan Sekarang"}
                        </button>`;
                    } else {
                        actionBtn = `<div class="muted" style="text-align:center; font-size:12px; font-weight:bold; padding: 6px; border: 1px dashed var(--border); border-radius: 6px; background: rgba(148,163,184,0.05);">
                            <i class="fa-solid fa-circle-info" style="margin-right:6px; color:var(--warning);"></i> Silakan datang langsung
                        </div>`;
                    }

                    return `
                        <div class="warga-card" style="border: 1px solid var(--border); border-radius: 12px; padding: 16px; background:#fff; display: flex; flex-direction: column; justify-content: space-between; box-shadow: none;">
                            <div>
                                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:12px;">
                                    <div style="background: var(--primary-soft); color: var(--primary); width:40px; height:40px; border-radius:10px; display:inline-flex; align-items:center; justify-content:center; font-size:16px;">
                                        <i class="fa-solid ${iconClass}"></i>
                                    </div>
                                    <span class="badge ${badgeClass}" style="font-size: 10px; padding: 2px 6px; border-radius: 6px;">${badgeText}</span>
                                </div>
                                <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight:800; color: var(--text);">${esc(x.nama)}</h3>
                                <div style="display:flex; gap:12px; font-size:11px; margin-bottom:12px;" class="muted">
                                    <span><i class="fa-regular fa-clock"></i> ${esc(estimasi)}</span>
                                    <span><i class="fa-solid fa-rupiah-sign"></i> ${esc(biaya)}</span>
                                </div>
                            </div>
                            <div style="margin-top:12px;">
                                ${actionBtn}
                            </div>
                        </div>
                    `;
                }).join("");

                // Add click listener
                grid.querySelectorAll(".srv-apply-btn").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const id = btn.getAttribute("data-id");
                        if (window.KelurahanStore?.Storage?.set) {
                            window.KelurahanStore.Storage.set("pelayananSelected", id);
                        }
                        sessionStorage.setItem("pelayananSelected", id);
                        if (typeof window.navigateTo === "function") {
                            window.navigateTo("pengajuan-online");
                        } else {
                            window.location.hash = "#pengajuan-online";
                        }
                    });
                });
            } catch (err) {
                console.error(err);
                grid.innerHTML = `<div class="muted" style="grid-column: 1/-1; text-align: center; padding: 20px; color: var(--danger);">Gagal memuat daftar pelayanan.</div>`;
            }
        };

        drawServicesGrid();
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
                                    <td><button class="btn btn-ghost btn-sm btn-warga-review" data-id="${p.id}"><i class="fa-solid fa-eye"></i> Review</button></td>
                                </tr>`,
                        )
                        .join("") ||
                    `<tr><td colspan="5" class="muted">Belum ada pengaduan.</td></tr>`;

                // Attach click listeners to Review buttons
                tbody.querySelectorAll(".btn-warga-review").forEach((btn) => {
                    btn.addEventListener("click", () => {
                        const id = btn.getAttribute("data-id");
                        const p = items.find((x) => String(x.id) === String(id));
                        if (p) {
                            document.getElementById("wargaDetailJudul").textContent = p.judul || "-";
                            document.getElementById("wargaDetailKategori").textContent = p.kategori || "-";
                            document.getElementById("wargaDetailTanggal").textContent = fmtDate(p.created_at || p.tanggal);
                            document.getElementById("wargaDetailLokasi").textContent = p.lokasi || "-";
                            document.getElementById("wargaDetailIsi").textContent = p.isi || "";
                            document.getElementById("wargaDetailStatus").innerHTML = pill(p.status);

                            // Handle staff resolution follow up photo
                            const hasilContainer = document.getElementById("wargaDetailTindakLanjutContainer");
                            const hasilImg = document.getElementById("wargaDetailHasilImg");
                            if (hasilContainer && hasilImg) {
                                if (p.foto_tindak_lanjut) {
                                    const hasilUrl = p.foto_tindak_lanjut.startsWith("data:") || p.foto_tindak_lanjut.startsWith("http")
                                        ? p.foto_tindak_lanjut
                                        : "/storage/" + p.foto_tindak_lanjut;
                                    hasilImg.src = hasilUrl;
                                    hasilContainer.style.display = "block";
                                } else {
                                    hasilImg.src = "";
                                    hasilContainer.style.display = "none";
                                }
                            }

                            const img = document.getElementById("wargaDetailImg");
                            const pdfLink = document.getElementById("wargaDetailPdf");
                            const noLampiran = document.getElementById("wargaDetailNoLampiran");

                            img.style.display = "none";
                            pdfLink.style.display = "none";
                            noLampiran.style.display = "none";

                            if (p.lampiran) {
                                const fileUrl = p.lampiran.startsWith("data:") || p.lampiran.startsWith("http")
                                    ? p.lampiran
                                    : "/storage/" + p.lampiran;
                                
                                if (p.lampiran.toLowerCase().endsWith(".pdf")) {
                                    pdfLink.href = fileUrl;
                                    pdfLink.style.display = "inline-block";
                                } else {
                                    img.src = fileUrl;
                                    img.style.display = "block";
                                }
                            } else {
                                noLampiran.style.display = "inline";
                            }

                            document.getElementById("wargaPengaduanDetailModal").classList.add("open");
                        }
                    });
                });

                // Global Close modal listener for review modals
                if (!window._wargaModalsBound) {
                    window._wargaModalsBound = true;
                    document.addEventListener("click", (e) => {
                        if (e.target.closest("#closeWargaPengaduanDetailBtn") || e.target.matches("#wargaPengaduanDetailModal")) {
                            document.getElementById("wargaPengaduanDetailModal")?.classList.remove("open");
                        }
                        if (e.target.closest("#closeImageZoomBtn") || e.target.matches("#imageZoomModal")) {
                            document.getElementById("imageZoomModal")?.classList.remove("open");
                        }
                    });

                    // Image zoom click
                    const detailImg = document.getElementById("wargaDetailImg");
                    if (detailImg) {
                        detailImg.onclick = () => {
                            const zoomModal = document.getElementById("imageZoomModal");
                            const zoomedImg = document.getElementById("zoomedImg");
                            if (zoomModal && zoomedImg) {
                                zoomedImg.src = detailImg.src;
                                zoomModal.classList.add("open");
                            }
                        };
                    }

                    const hasilImg = document.getElementById("wargaDetailHasilImg");
                    if (hasilImg) {
                        hasilImg.onclick = () => {
                            const zoomModal = document.getElementById("imageZoomModal");
                            const zoomedImg = document.getElementById("zoomedImg");
                            if (zoomModal && zoomedImg) {
                                zoomedImg.src = hasilImg.src;
                                zoomModal.classList.add("open");
                            }
                        };
                    }
                }
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

    let chatPollInterval = null;
    let chatStaffPollInterval = null;
    function initChat() {
        const threadListEl = document.getElementById("wargaThreadList");
        const msgEl = document.getElementById("wargaChatMessages");
        const inputEl = document.getElementById("wargaChatInput");
        const sendBtn = document.getElementById("wargaChatSend");
        const subEl = document.getElementById("wargaChatSub");

        if (!threadListEl || !msgEl) return;

        // Reset state
        let activeStaffId = null;
        let activeRoomId = null;
        let staffList = [];
        let socket = null;

        if (chatPollInterval) {
            clearInterval(chatPollInterval);
            chatPollInterval = null;
        }
        if (chatStaffPollInterval) {
            clearInterval(chatStaffPollInterval);
            chatStaffPollInterval = null;
        }

        msgEl.innerHTML = `
            <div class="muted" style="padding:40px;text-align:center">
                <i class="fa-solid fa-comments" style="font-size:32px;margin-bottom:10px;color:var(--primary);"></i>
                <p style="font-weight:700">Konsultasi dengan Staf Kelurahan</p>
                <p style="font-size:13px">Pilih salah satu staf kelurahan di sebelah kiri untuk berkonsultasi secara langsung.</p>
            </div>
        `;

        async function loadStaff(silent = false) {
            try {
                const res = await fetch("/api/warga/chat/staff", { credentials: "include" });
                if (!res.ok) throw new Error("Gagal memuat staf");
                staffList = await res.json();
                
                threadListEl.innerHTML = staffList.map(st => {
                    const isOnline = st.is_online;
                    const lastMsgText = st.last_message ? st.last_message.message : 'Belum ada percakapan.';
                    const dateText = st.last_message ? fmtDate(st.last_message.created_at) : '';
                    
                    return `
                        <div class="thread-item warga-chat-thread" data-id="${st.id}" style="padding: 12px; border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 8px; cursor: pointer; transition: all 0.2s; position: relative;" id="staf-item-${st.id}">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="font-weight: 800; font-size: 14px; color: var(--text); display: flex; align-items: center; gap: 8px;">
                                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${isOnline ? '#10b981' : '#cbd5e1'}; box-shadow: ${isOnline ? '0 0 8px #10b981' : 'none'};"></span>
                                    ${st.name}
                                </div>
                                <span class="badge ${st.role === 'admin' ? 'badge-done' : 'badge-wait'}" style="font-size: 10px; padding: 2px 6px;">${st.role === 'admin' ? 'Admin' : 'Staf'}</span>
                            </div>
                            <div style="font-size: 12px; color: var(--muted); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 90%;">
                                ${lastMsgText}
                            </div>
                            <div style="font-size: 10px; color: var(--muted); margin-top: 4px; text-align: right;">
                                ${dateText}
                            </div>
                            ${st.unread_count > 0 ? `<span class="badge" style="position: absolute; right: 12px; top: 12px; font-size: 10px; background: #ef4444; border: none; color: #fff; border-radius: 50%; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; padding: 0;">${st.unread_count}</span>` : ''}
                        </div>
                    `;
                }).join("") || `<div class="muted" style="padding: 20px; text-align: center;">Belum ada staf kelurahan yang terdaftar.</div>`;

                // Bind click to threads
                threadListEl.querySelectorAll(".warga-chat-thread").forEach(el => {
                    el.addEventListener("click", () => {
                        const id = el.getAttribute("data-id");
                        selectStaff(id);
                    });
                });

                if (activeStaffId) {
                    const activeEl = document.getElementById(`staf-item-${activeStaffId}`);
                    if (activeEl) {
                        activeEl.style.background = "rgba(31, 95, 224, 0.08)";
                        activeEl.style.borderColor = "var(--primary)";
                    }
                }
            } catch (err) {
                console.error(err);
                if (!silent) {
                    threadListEl.innerHTML = `<div class="muted" style="color:red">Gagal memuat daftar staf.</div>`;
                }
            }
        }

        async function loadMessages(silent = false) {
            if (!activeRoomId) return;
            // Check if user has left the page
            if (!document.getElementById("wargaChatMessages")) {
                cleanup();
                return;
            }

            try {
                const res = await fetch(`/api/chat/room/${activeRoomId}/messages`, { credentials: "include" });
                if (!res.ok) throw new Error("Gagal mengambil pesan");
                const messages = await res.json();
                
                const session = Guard?.getSession();
                const userId = session ? session.id : null;

                const originalScrollHeight = msgEl.scrollHeight;
                const originalScrollTop = msgEl.scrollTop;
                const isNearBottom = originalScrollTop + msgEl.clientHeight >= originalScrollHeight - 60;

                const messagesHtml = messages.map(c => {
                    const isSelf = String(c.sender_id) === String(userId);
                    const senderName = isSelf ? "Anda" : "Petugas";
                    const alignment = isSelf ? "align-self: flex-end; background: var(--primary); color: white;" : "align-self: flex-start; background: #f1f5f9; color: var(--text);";
                    const alignContainer = isSelf ? "justify-content: flex-end;" : "justify-content: flex-start;";
                    
                    return `
                        <div style="display: flex; ${alignContainer} width: 100%; margin-bottom: 10px;">
                            <div style="max-width: 75%; padding: 10px 14px; border-radius: 12px; display: flex; flex-direction: column; gap: 4px; box-shadow: var(--shadow-sm); ${alignment}">
                                <div style="font-size: 11px; font-weight: 800; opacity: 0.85;">${senderName}</div>
                                <div style="font-size: 13px; line-height: 1.4; white-space: pre-wrap;">${c.message}</div>
                                <div style="font-size: 9px; align-self: flex-end; opacity: 0.7;">${fmtDate(c.created_at)}</div>
                            </div>
                        </div>
                    `;
                }).join("") || `<div class="muted" style="padding: 40px; text-align: center;">Belum ada pesan. Kirim pesan pertama untuk memulai konsultasi.</div>`;

                if (msgEl.getAttribute("data-content-hash") !== messagesHtml.length.toString()) {
                    msgEl.innerHTML = messagesHtml;
                    msgEl.setAttribute("data-content-hash", messagesHtml.length.toString());
                    if (!silent || isNearBottom) {
                        msgEl.scrollTop = msgEl.scrollHeight;
                    }
                }
            } catch (err) {
                console.error("Gagal memuat pesan:", err);
                if (!silent) {
                    msgEl.innerHTML = `<div class="muted" style="color:red; text-align:center; padding:20px;">Gagal memuat pesan.</div>`;
                }
            }
        }

        async function selectStaff(stafId) {
            activeStaffId = stafId;
            
            // Highlight selected
            threadListEl.querySelectorAll(".warga-chat-thread").forEach(el => {
                const elId = el.getAttribute("data-id");
                el.style.background = elId === String(stafId) ? "rgba(31, 95, 224, 0.08)" : "transparent";
                el.style.borderColor = elId === String(stafId) ? "var(--primary)" : "var(--border)";
            });

            msgEl.innerHTML = `<div class="muted" style="padding:40px; text-align:center;"><i class="fa-solid fa-spinner fa-spin" style="font-size:24px; margin-bottom:10px;"></i><p>Memuat percakapan...</p></div>`;

            try {
                const session = Guard?.getSession();
                const wargaId = session ? session.id : null;
                
                const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
                const roomRes = await fetch('/api/chat/room', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrf,
                        Accept: 'application/json'
                    },
                    body: JSON.stringify({ warga_id: wargaId, staf_id: stafId })
                });
                
                if (!roomRes.ok) throw new Error("Gagal membuka room");
                const room = await roomRes.json();
                activeRoomId = room.id;

                const staffObj = staffList.find(x => String(x.id) === String(stafId));
                if (staffObj && subEl) {
                    const statusText = staffObj.is_online ? '<span style="color: #10b981; font-weight: 800;">● Online</span>' : '<span style="color: var(--muted);">● Offline</span>';
                    subEl.innerHTML = `Konsultasi dengan: <b>${staffObj.name}</b> (${statusText})`;
                }

                await loadMessages();
                
                // Reset unread count locally and load list again
                await loadStaff(true);

                // Setup realtime poll fallback (1-second polling)
                setupRealtime();
            } catch (err) {
                console.error(err);
                msgEl.innerHTML = `<div class="muted" style="color:red; text-align:center; padding:20px;">Gagal memuat percakapan.</div>`;
            }
        }

        function setupRealtime() {
            if (chatPollInterval) clearInterval(chatPollInterval);
            
            // Try connecting WebSocket first
            try {
                if (socket) {
                    socket.close();
                }
                socket = new WebSocket("ws://127.0.0.1:8085");
                socket.onopen = () => {
                    console.log("[WS Warga] Connected successfully");
                };
                socket.onmessage = (e) => {
                    try {
                        const data = JSON.parse(e.data);
                        if (String(data.room_id) === String(activeRoomId)) {
                            loadMessages(true);
                        }
                        if (data.type === 'update_list' || String(data.receiver_id) === String(Guard?.getSession()?.id)) {
                            loadStaff(true);
                        }
                    } catch (_) {}
                };
                socket.onclose = () => {
                    startPollingFallback();
                };
                socket.onerror = () => {
                    startPollingFallback();
                };
            } catch (e) {
                startPollingFallback();
            }
        }

        function startPollingFallback() {
            if (chatPollInterval) clearInterval(chatPollInterval);
            chatPollInterval = setInterval(() => {
                loadMessages(true);
            }, 1000);
        }

        async function sendMessage() {
            if (!activeRoomId) {
                alert("Pilih staf terlebih dahulu.");
                return;
            }
            const message = inputEl.value.trim();
            if (!message) return;

            sendBtn.disabled = true;
            try {
                const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
                const res = await fetch(`/api/chat/room/${activeRoomId}/messages`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrf,
                        Accept: "application/json"
                    },
                    body: JSON.stringify({ message })
                });

                if (!res.ok) throw new Error("Gagal mengirim pesan");
                inputEl.value = "";
                await loadMessages();
                
                // notify WebSocket server if connected
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({
                        room_id: activeRoomId,
                        sender_id: Guard?.getSession()?.id,
                        receiver_id: activeStaffId,
                        message: message
                    }));
                }
                
                await loadStaff(true);
            } catch (err) {
                console.error(err);
                alert("Gagal mengirim pesan.");
            } finally {
                sendBtn.disabled = false;
            }
        }

        function cleanup() {
            if (chatPollInterval) {
                clearInterval(chatPollInterval);
                chatPollInterval = null;
            }
            if (chatStaffPollInterval) {
                clearInterval(chatStaffPollInterval);
                chatStaffPollInterval = null;
            }
            if (socket) {
                socket.close();
                socket = null;
            }
        }

        // Bind events
        sendBtn.onclick = sendMessage;
        inputEl.onkeydown = (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        };

        // Initialize
        loadStaff();
        
        // Poll staff list status every 5 seconds
        chatStaffPollInterval = setInterval(() => {
            loadStaff(true);
        }, 5000);
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
