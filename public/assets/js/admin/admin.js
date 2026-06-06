/* =========================================================
   admin.js
   - CRUD untuk berita, galeri, agenda, pengumuman (localStorage)
========================================================= */

(function () {
    const { Data, uid } = window.KelurahanStore;
    const Guard = window.KelurahanGuard;

    const fmtDate = (iso) => {
        try {
            const d = new Date(iso);
            return d.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch (_) {
            return iso || "";
        }
    };

    // Read file input -> dataURL (frontend-only)
    const fileToDataURL = (file) =>
        new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(String(r.result || ""));
            r.onerror = () => reject(new Error("Gagal membaca file"));
            r.readAsDataURL(file);
        });

    function setImagePreview(src) {
        const img = document.getElementById("fImagePreview");
        if (!img) return;
        if (src) {
            img.src = src;
            img.style.display = "block";
        } else {
            img.removeAttribute("src");
            img.style.display = "none";
        }
    }

    function setAdminMode(on) {
        document.body.classList.toggle("is-admin", !!on);
    }

    function setSidebarActive(hash) {
        document.querySelectorAll(".admin-side a").forEach((a) => {
            a.classList.toggle("active", a.getAttribute("href") === hash);
        });
    }

    // --------------------
    // Sidebar collapse groups
    // --------------------
    let _sidebarCollapseBound = false;

    function ensureSidebarCollapse() {
        if (_sidebarCollapseBound) return;
        _sidebarCollapseBound = true;

        document.addEventListener("click", (e) => {
            const btn = e.target.closest?.(".group-toggle");
            if (!btn) return;
            const group = btn.closest?.(".menu-group");
            if (!group) return;

            const open = !group.classList.contains("open");
            group.classList.toggle("open", open);
            btn.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function syncSidebarGroups(hash) {
        const menu = document.getElementById("adminSideMenu");
        if (!menu) return;

        // open group that contains active link
        const active = menu.querySelector(`a[href="${hash}"]`);
        if (!active) return;
        const group = active.closest?.(".menu-group");
        if (group) {
            group.classList.add("open");
            const btn = group.querySelector(".group-toggle");
            if (btn) btn.setAttribute("aria-expanded", "true");
        }
    }

    // --------------------
    // Mobile drawer (Admin)
    // --------------------
    let _adminMobileMenuBound = false;

    function ensureAdminMobileMenu() {
        if (_adminMobileMenuBound) return;
        _adminMobileMenuBound = true;

        // Backdrop
        if (!document.getElementById("adminMenuBackdrop")) {
            const bd = document.createElement("div");
            bd.id = "adminMenuBackdrop";
            document.body.appendChild(bd);
        }

        const close = () => document.body.classList.remove("admin-menu-open");
        const toggle = () => document.body.classList.toggle("admin-menu-open");

        document.addEventListener("click", (e) => {
            if (e.target.id === "adminMenuBackdrop") return close();
            if (e.target.closest?.("[data-action='toggleAdminMenu']"))
                return toggle();
            if (e.target.closest?.(".admin-side a[data-page]")) return close();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") close();
        });
    }

    function mountAdminMenuButton() {
        const actions = document.querySelector(".admin-top .top-actions");
        if (!actions) return;
        if (actions.querySelector("[data-action='toggleAdminMenu']")) return;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-ghost";
        btn.setAttribute("data-action", "toggleAdminMenu");
        btn.innerHTML = `<i class="fa-solid fa-bars"></i> Menu`;
        actions.prepend(btn);
    }

    function fillAdminUserLabel() {
        const el = document.getElementById("adminUserLabel");
        if (!el) return;
        const s = Guard.getSession();
        el.textContent = s ? `Login: ${s.name} (${s.role})` : "-";
    }

    // --------------------
    // Dashboard
    // --------------------
    async function initDashboard() {
        try {
            const response = await fetch("/api/admin/stats", {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Gagal mengambil statistik");
            }

            const stats = await response.json();

            console.log("Stats:", stats);

            const berita = document.getElementById("metricBerita");
            const galeri = document.getElementById("metricGaleri");
            const agenda = document.getElementById("metricAgenda");
            const pengumuman = document.getElementById("metricPengumuman");

            if (berita) berita.textContent = stats.berita ?? 0;
            if (galeri) galeri.textContent = stats.galeri ?? 0;
            if (agenda) agenda.textContent = stats.agenda ?? 0;
            if (pengumuman) pengumuman.textContent = stats.pengumuman ?? 0;
        } catch (error) {
            console.error("Dashboard Error:", error);

            const berita = document.getElementById("metricBerita");
            const galeri = document.getElementById("metricGaleri");
            const agenda = document.getElementById("metricAgenda");
            const pengumuman = document.getElementById("metricPengumuman");

            if (berita) berita.textContent = "-";
            if (galeri) galeri.textContent = "-";
            if (agenda) agenda.textContent = "-";
            if (pengumuman) pengumuman.textContent = "-";
        }
    }
    // --------------------
    // Generic list CRUD
    // --------------------
    function renderRow(type, item) {
        if (type === "berita") {
            const badge = `<span class="badge">${item.category || "Info"}</span>`;
            const status = `<span class="badge" style="${
                item.status === "published"
                    ? "background:rgba(34,197,94,.12);color:#16a34a"
                    : "background:rgba(148,163,184,.22);color:#334155"
            }">${item.status || "draft"}</span>`;

            return `
        <tr>
          <td><b>${item.title}</b><div class="muted" style="font-size:12px">${item.excerpt || ""}</div></td>
          <td>${badge}</td>
          <td>${fmtDate(item.date)}</td>
          <td>${status}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-warning btn-sm" data-action="edit" data-id="${item.id}"><i class="fa-solid fa-pen"></i> Edit</button>
              <button class="btn btn-danger btn-sm" data-action="delete" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>`;
        }

        if (type === "agenda") {
            return `
        <tr>
          <td><b>${item.title}</b><div class="muted" style="font-size:12px">${item.content || ""}</div></td>
          <td>${fmtDate(item.date)}${item.time ? " • " + item.time : ""}</td>
          <td>${item.location || "-"}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-warning btn-sm" data-action="edit" data-id="${item.id}"><i class="fa-solid fa-pen"></i> Edit</button>
              <button class="btn btn-danger btn-sm" data-action="delete" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>`;
        }

        if (type === "galeri") {
            return `
        <tr>
          <td><b>${item.title}</b><div class="muted" style="font-size:12px">${item.content || ""}</div></td>
          <td><span class="badge">${item.category || "-"}</span></td>
          <td>${fmtDate(item.date)}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-warning btn-sm" data-action="edit" data-id="${item.id}"><i class="fa-solid fa-pen"></i> Edit</button>
              <button class="btn btn-danger btn-sm" data-action="delete" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>`;
        }

        if (type === "pengumuman") {
            const pr = item.status || "info";
            const badge =
                pr === "urgent"
                    ? '<span class="badge badge-cat-darurat">URGENT</span>'
                    : '<span class="badge badge-cat-info">INFO</span>';

            return `
        <tr>
          <td><b>${item.title}</b><div class="muted" style="font-size:12px">${item.content || ""}</div></td>
          <td>${fmtDate(item.date)}</td>
          <td>${badge}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-warning btn-sm" data-action="edit" data-id="${item.id}"><i class="fa-solid fa-pen"></i> Edit</button>
              <button class="btn btn-danger btn-sm" data-action="delete" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>`;
        }

        return "";
    }

    function openModal(type, item) {
        const modal = document.getElementById("adminModal");
        if (!modal) return;

        const title = document.getElementById("adminModalTitle");
        if (title) title.textContent = item ? "Edit" : "Tambah";

        // fill fields if exist
        const idEl = document.getElementById("itemId");
        if (idEl) idEl.value = item?.id || "";

        const map = {
            fTitle: item?.title || "",
            fCategory: item?.category || "",
            fDate: item?.date || "",
            fTime: item?.time || "",
            fLocation: item?.location || "",
            fExcerpt: item?.excerpt || "",
            fContent: item?.content || "",
            fStatus:
                item?.status || (type === "pengumuman" ? "info" : "published"),
        };

        Object.entries(map).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.value = val;
        });

        // file input (tidak bisa di-set value). Pakai hidden existing + preview.
        const existing = document.getElementById("fImageExisting");
        if (existing) existing.value = item?.image || "";
        const fileEl = document.getElementById("fImage");
        if (fileEl && fileEl.type === "file") fileEl.value = "";
        setImagePreview(item?.image || "");

        modal.classList.add("open");
    }

    function closeModal() {
        const modal = document.getElementById("adminModal");
        if (modal) modal.classList.remove("open");
    }

    function readForm(type) {
        const get = (id) => document.getElementById(id)?.value?.trim() || "";
        const id = get("itemId") || uid();

        const base = { id };

        if (type === "berita") {
            return {
                ...base,
                title: get("fTitle"),
                category: get("fCategory"),
                date: get("fDate"),
                image: "", // diisi dari file upload / existing
                excerpt: get("fExcerpt"),
                content: get("fContent"),
                status: get("fStatus") || "draft",
            };
        }

        if (type === "agenda") {
            return {
                ...base,
                title: get("fTitle"),
                date: get("fDate"),
                time: get("fTime"),
                location: get("fLocation"),
                content: get("fContent"),
            };
        }

        if (type === "galeri") {
            return {
                ...base,
                title: get("fTitle"),
                category: get("fCategory"),
                date: get("fDate"),
                image: "", // diisi dari file upload / existing
                content: get("fContent"),
            };
        }

        if (type === "pengumuman") {
            return {
                ...base,
                title: get("fTitle"),
                date: get("fDate"),
                status: get("fStatus") || "info",
                content: get("fContent"),
            };
        }

        return base;
    }
    // --------------------
    // Helpers (localStorage plain array) - for surat/pengaduan integration with staf/warga
    // --------------------
    function _getArr(key) {
        try {
            const raw = localStorage.getItem(key);
            const v = raw ? JSON.parse(raw) : [];
            return Array.isArray(v) ? v : [];
        } catch {
            return [];
        }
    }

    function _setArr(key, arr) {
        localStorage.setItem(
            key,
            JSON.stringify(Array.isArray(arr) ? arr : []),
        );
    }

    function _makeId(prefix = "id") {
        return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
    }

    function _fmtDate(input) {
        if (!input) return "-";
        const d = new Date(input);
        if (Number.isNaN(d.getTime())) return String(input);
        return d.toLocaleString("id-ID", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function _badge(status, kind = "pengaduan") {
        const s = (status || "").toLowerCase();
        let cls = "badge-neutral";
        if (kind === "pengaduan") {
            if (s === "baru") cls = "badge-new";
            if (s === "diproses") cls = "badge-proses";
            if (s === "selesai") cls = "badge-done";
            if (s === "ditolak") cls = "badge-reject";
        } else {
            if (s === "menunggu") cls = "badge-wait";
            if (s === "diproses") cls = "badge-proses";
            if (s === "selesai") cls = "badge-done";
            if (s === "ditolak") cls = "badge-reject";
        }
        // extra kinds
        if (kind === "umkm") {
            if (s === "aktif") cls = "badge-done";
            if (s === "nonaktif") cls = "badge-neutral";
        }
        if (kind === "faq") {
            if (s === "published") cls = "badge-done";
            if (s === "draft") cls = "badge-wait";
        }
        return `<span class="badge ${cls}">${status || "-"}</span>`;
    }

    function _openModal(id) {
        const m = document.getElementById(id);
        if (!m) return;
        m.classList.add("open");
        m.setAttribute("aria-hidden", "false");
    }

    function _closeModal(id) {
        const m = document.getElementById(id);
        if (!m) return;
        m.classList.remove("open");
        m.setAttribute("aria-hidden", "true");
    }

    // --------------------
    // Admin - Profil Kelurahan
    // --------------------
    let _profilBound = false;
    function initProfilKelurahan() {
        const s = Data.settings();

        const setVal = (id, v) => {
            const el = document.getElementById(id);
            if (el) el.value = v || "";
        };

        setVal("pkSiteName", s.siteName);
        setVal("pkLurahName", s.lurahName);
        setVal("pkKecamatan", s.kecamatan);
        setVal("pkKota", s.kota);
        setVal("pkProvinsi", s.provinsi);
        setVal("pkKodepos", s.kodepos);
        setVal("pkDeskripsi", s.profil);

        setVal("pkEmail", s.email);
        setVal("pkPhone", s.phone);
        setVal("pkAddress", s.address);
        setVal("pkInstagram", s.instagram);
        setVal("pkMaps", s.maps);
        setVal("pkJam", s.jamPelayanan || s.note);

        if (_profilBound) return;
        _profilBound = true;

        document.addEventListener("click", (e) => {
            const save = e.target.closest("[data-action='saveProfil']");
            const reset = e.target.closest("[data-action='resetProfil']");

            if (reset) {
                // reload from current storage
                const cur = Data.settings();
                setVal("pkSiteName", cur.siteName);
                setVal("pkLurahName", cur.lurahName);
                setVal("pkKecamatan", cur.kecamatan);
                setVal("pkKota", cur.kota);
                setVal("pkProvinsi", cur.provinsi);
                setVal("pkKodepos", cur.kodepos);
                setVal("pkDeskripsi", cur.profil);
                setVal("pkEmail", cur.email);
                setVal("pkPhone", cur.phone);
                setVal("pkAddress", cur.address);
                setVal("pkInstagram", cur.instagram);
                setVal("pkMaps", cur.maps);
                setVal("pkJam", cur.jamPelayanan || cur.note);
                return;
            }

            if (!save) return;

            const get = (id) =>
                document.getElementById(id)?.value?.trim() || "";
            const prev = Data.settings();

            Data.saveSettings({
                ...prev,
                siteName: get("pkSiteName"),
                lurahName: get("pkLurahName"),
                kecamatan: get("pkKecamatan"),
                kota: get("pkKota"),
                provinsi: get("pkProvinsi"),
                kodepos: get("pkKodepos"),
                profil: get("pkDeskripsi"),
                email: get("pkEmail"),
                phone: get("pkPhone"),
                address: get("pkAddress"),
                instagram: get("pkInstagram"),
                maps: get("pkMaps"),
                jamPelayanan: get("pkJam"),
                // keep note for older footer widgets
                note: get("pkJam") || prev.note,
            });

            alert("Profil kelurahan tersimpan.");
            window.dispatchEvent(new CustomEvent("settings:changed"));
        });
    }

    // --------------------
    // Admin - Pengaduan
    // --------------------
    let _pengaduanBound = false;
    function initAdminPengaduan() {
        const tbody = document.getElementById("adminPengaduanTbody");
        const empty = document.getElementById("adminPengaduanEmpty");
        const q = document.getElementById("adminPengaduanSearch");
        const f = document.getElementById("adminPengaduanFilter");

        if (!tbody) return;

        const ensure = () => {
            const arr = _getArr("pengaduan");
            let changed = false;
            for (const it of arr) {
                if (!it.id) {
                    it.id = _makeId("pd");
                    changed = true;
                }
                if (!it.status) {
                    it.status = "baru";
                    changed = true;
                }
            }
            if (changed) _setArr("pengaduan", arr);
        };

        const read = () =>
            _getArr("pengaduan")
                .slice()
                .sort((a, b) => {
                    const da = new Date(
                        a.tanggal || a.createdAt || 0,
                    ).getTime();
                    const db = new Date(
                        b.tanggal || b.createdAt || 0,
                    ).getTime();
                    return db - da;
                });

        const render = () => {
            const keyword = (q?.value || "").trim().toLowerCase();
            const status = (f?.value || "").trim().toLowerCase();

            let items = read();
            if (keyword) {
                items = items.filter((it) =>
                    `${it.nama || ""} ${it.judul || ""} ${it.isi || ""}`
                        .toLowerCase()
                        .includes(keyword),
                );
            }
            if (status)
                items = items.filter(
                    (it) => (it.status || "").toLowerCase() == status,
                );

            tbody.innerHTML = items
                .map(
                    (it) => `
          <tr>
            <td>${it.nama || "-"}</td>
            <td>${it.judul || "-"}</td>
            <td>${_fmtDate(it.tanggal || it.createdAt)}</td>
            <td>${_badge(it.status, "pengaduan")}</td>
            <td>
              <div class="row-actions">
                <button class="btn btn-ghost" data-action="pengaduanDetail" data-id="${it.id}"><i class="fa-regular fa-eye"></i> Detail</button>
                <button class="btn btn-ghost" data-action="pengaduanDelete" data-id="${it.id}"><i class="fa-regular fa-trash-can"></i> Hapus</button>
              </div>
            </td>
          </tr>
        `,
                )
                .join("");

            if (empty) empty.style.display = items.length ? "none" : "block";
        };

        ensure();
        render();

        q?.addEventListener("input", render);
        f?.addEventListener("change", render);

        if (_pengaduanBound) return;
        _pengaduanBound = true;

        document.addEventListener("click", (e) => {
            const detail = e.target.closest("[data-action='pengaduanDetail']");
            const del = e.target.closest("[data-action='pengaduanDelete']");
            const close = e.target.closest(
                "[data-action='closePengaduanModal']",
            );
            const save = e.target.closest(
                "[data-action='savePengaduanStatus']",
            );

            if (close) {
                _closeModal("adminPengaduanModal");
                return;
            }

            if (del) {
                const id = del.dataset.id;
                if (!confirm("Hapus pengaduan ini?")) return;
                const arr = _getArr("pengaduan").filter((x) => x.id != id);
                _setArr("pengaduan", arr);
                render();
                return;
            }

            if (detail) {
                const id = detail.dataset.id;
                const arr = _getArr("pengaduan");
                const it = arr.find((x) => x.id == id);
                if (!it) return;

                document.getElementById("apdId").value = it.id;
                document.getElementById("apdNama").value = it.nama || "";
                document.getElementById("apdTanggal").value = _fmtDate(
                    it.tanggal || it.createdAt,
                );
                document.getElementById("apdJudul").value = it.judul || "";
                document.getElementById("apdIsi").value = it.isi || "";
                document.getElementById("apdStatus").value = (
                    it.status || "baru"
                ).toLowerCase();
                document.getElementById("apdCatatan").value =
                    it.catatanAdmin || "";

                const sub = document.getElementById("adminPengaduanModalSub");
                if (sub) sub.textContent = `ID: ${it.id}`;

                _openModal("adminPengaduanModal");
                return;
            }

            if (save) {
                const id = document.getElementById("apdId").value;
                const newStatus = document.getElementById("apdStatus").value;
                const cat =
                    document.getElementById("apdCatatan").value?.trim() || "";
                const arr = _getArr("pengaduan");
                const it = arr.find((x) => x.id == id);
                if (!it) return;
                it.status = newStatus;
                it.catatanAdmin = cat;
                it.updatedAt = new Date().toISOString();
                _setArr("pengaduan", arr);
                _closeModal("adminPengaduanModal");
                render();
            }
        });
    }

    // --------------------
    // Admin - Surat
    // --------------------
    let _suratBound = false;
    function initAdminSurat() {
        const tbody = document.getElementById("adminSuratTbody");
        const empty = document.getElementById("adminSuratEmpty");
        const q = document.getElementById("adminSuratSearch");
        const f = document.getElementById("adminSuratFilter");

        if (!tbody) return;

        const ensure = () => {
            const arr = _getArr("surat");
            let changed = false;
            for (const it of arr) {
                if (!it.id) {
                    it.id = _makeId("sr");
                    changed = true;
                }
                if (!it.status) {
                    it.status = "menunggu";
                    changed = true;
                }
            }
            if (changed) _setArr("surat", arr);
        };

        const read = () =>
            _getArr("surat")
                .slice()
                .sort((a, b) => {
                    const da = new Date(
                        a.tanggal || a.createdAt || 0,
                    ).getTime();
                    const db = new Date(
                        b.tanggal || b.createdAt || 0,
                    ).getTime();
                    return db - da;
                });

        const render = () => {
            const keyword = (q?.value || "").trim().toLowerCase();
            const status = (f?.value || "").trim().toLowerCase();

            let items = read();
            if (keyword) {
                items = items.filter((it) =>
                    `${it.nama || ""} ${it.jenis || it.jenisSurat || ""} ${it.keperluan || ""}`
                        .toLowerCase()
                        .includes(keyword),
                );
            }
            if (status)
                items = items.filter(
                    (it) => (it.status || "").toLowerCase() == status,
                );

            tbody.innerHTML = items
                .map(
                    (it) => `
          <tr>
            <td>${it.jenis || it.jenisSurat || "-"}</td>
            <td>${it.nama || "-"}</td>
            <td>${_fmtDate(it.tanggal || it.createdAt)}</td>
            <td>${_badge(it.status, "surat")}</td>
            <td>
              <div class="row-actions">
                <button class="btn btn-ghost" data-action="suratDetail" data-id="${it.id}"><i class="fa-regular fa-eye"></i> Detail</button>
                <button class="btn btn-ghost" data-action="suratDelete" data-id="${it.id}"><i class="fa-regular fa-trash-can"></i> Hapus</button>
              </div>
            </td>
          </tr>
        `,
                )
                .join("");

            if (empty) empty.style.display = items.length ? "none" : "block";
        };

        ensure();
        render();

        q?.addEventListener("input", render);
        f?.addEventListener("change", render);

        if (_suratBound) return;
        _suratBound = true;

        document.addEventListener("click", (e) => {
            const detail = e.target.closest("[data-action='suratDetail']");
            const del = e.target.closest("[data-action='suratDelete']");
            const close = e.target.closest("[data-action='closeSuratModal']");
            const save = e.target.closest("[data-action='saveSuratStatus']");

            if (close) {
                _closeModal("adminSuratModal");
                return;
            }

            if (del) {
                const id = del.dataset.id;
                if (!confirm("Hapus pengajuan surat ini?")) return;
                const arr = _getArr("surat").filter((x) => x.id != id);
                _setArr("surat", arr);
                render();
                return;
            }

            if (detail) {
                const id = detail.dataset.id;
                const arr = _getArr("surat");
                const it = arr.find((x) => x.id == id);
                if (!it) return;

                document.getElementById("asId").value = it.id;
                document.getElementById("asJenis").value =
                    it.jenis || it.jenisSurat || "";
                document.getElementById("asTanggal").value = _fmtDate(
                    it.tanggal || it.createdAt,
                );
                document.getElementById("asNama").value = it.nama || "";
                document.getElementById("asNik").value = it.nik || it.NIK || "";
                document.getElementById("asKeperluan").value =
                    it.keperluan || it.keterangan || "";
                document.getElementById("asStatus").value = (
                    it.status || "menunggu"
                ).toLowerCase();
                document.getElementById("asCatatan").value =
                    it.catatanAdmin || "";

                const sub = document.getElementById("adminSuratModalSub");
                if (sub) sub.textContent = `ID: ${it.id}`;

                _openModal("adminSuratModal");
                return;
            }

            if (save) {
                const id = document.getElementById("asId").value;
                const newStatus = document.getElementById("asStatus").value;
                const cat =
                    document.getElementById("asCatatan").value?.trim() || "";
                const arr = _getArr("surat");
                const it = arr.find((x) => x.id == id);
                if (!it) return;
                it.status = newStatus;
                it.catatanAdmin = cat;
                it.updatedAt = new Date().toISOString();
                _setArr("surat", arr);
                _closeModal("adminSuratModal");
                render();
            }
        });
    }

    // --------------------
    // Admin - Simple CRUD (UMKM / RT-RW / FAQ) via KelurahanStore.Data
    // --------------------
    function _initSimpleCrud(cfg) {
        const {
            type,
            searchId,
            tbodyId,
            emptyId,
            modalId,
            formId,
            titleId,
            createAction,
            closeAction,
            buildItem,
            fillForm,
            row,
            editAction,
            deleteAction,
        } = cfg;

        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;

        const empty = document.getElementById(emptyId);
        const q = document.getElementById(searchId);
        const modal = document.getElementById(modalId);
        const form = document.getElementById(formId);
        const title = document.getElementById(titleId);

        const render = () => {
            const keyword = (q?.value || "").trim().toLowerCase();
            let items = Data.list(type);
            if (keyword)
                items = items.filter((it) =>
                    JSON.stringify(it).toLowerCase().includes(keyword),
                );

            tbody.innerHTML = items.map(row).join("");
            if (empty) empty.style.display = items.length ? "none" : "block";
        };

        const open = () => {
            if (!modal) return;
            modal.classList.add("open");
            modal.setAttribute("aria-hidden", "false");
        };

        const close = () => {
            if (!modal) return;
            modal.classList.remove("open");
            modal.setAttribute("aria-hidden", "true");
        };

        const reset = () => {
            if (!form) return;
            form.reset?.();
            const hidden = form.querySelector('input[type="hidden"]');
            if (hidden) hidden.value = "";
        };

        // bind once per type
        const flag = `__admin_simple_${type}`;
        if (!window[flag]) {
            window[flag] = true;

            q?.addEventListener("input", render);

            document.addEventListener("click", (e) => {
                const create = e.target.closest(
                    `[data-action='${createAction}']`,
                );
                const closeBtn = e.target.closest(
                    `[data-action='${closeAction}']`,
                );
                const edit = e.target.closest(`[data-action='${editAction}']`);
                const del = e.target.closest(`[data-action='${deleteAction}']`);

                if (create) {
                    reset();
                    if (title)
                        title.textContent =
                            title.dataset.createTitle || "Tambah Data";
                    open();
                    return;
                }

                if (closeBtn) {
                    close();
                    return;
                }

                if (edit) {
                    const id = edit.dataset.id;
                    const it = Data.get(type, id);
                    if (!it) return;
                    fillForm(it);
                    if (title)
                        title.textContent =
                            title.dataset.editTitle || "Ubah Data";
                    open();
                    return;
                }

                if (del) {
                    const id = del.dataset.id;
                    if (!confirm("Hapus data ini?")) return;
                    Data.remove(type, id);
                    render();
                    return;
                }
            });

            form?.addEventListener("submit", (ev) => {
                ev.preventDefault();
                const item = buildItem();
                if (!item.id) item.id = KelurahanStore.uid();
                Data.upsert(type, item);
                close();
                render();
            });
        }

        render();
    }

    function initAdminUmkm() {
        _initSimpleCrud({
            type: "umkm",
            searchId: "adminUmkmSearch",
            tbodyId: "adminUmkmTbody",
            emptyId: "adminUmkmEmpty",
            modalId: "adminUmkmModal",
            formId: "adminUmkmForm",
            titleId: "adminUmkmModalTitle",
            createAction: "umkmCreate",
            closeAction: "umkmClose",
            editAction: "umkmEdit",
            deleteAction: "umkmDelete",
            buildItem: () => ({
                id: document.getElementById("umkmId")?.value || "",
                nama: document.getElementById("umkmNama")?.value?.trim() || "",
                pemilik:
                    document.getElementById("umkmPemilik")?.value?.trim() || "",
                kategori:
                    document.getElementById("umkmKategori")?.value?.trim() ||
                    "",
                kontak:
                    document.getElementById("umkmKontak")?.value?.trim() || "",
                status: document.getElementById("umkmStatus")?.value || "aktif",
                alamat:
                    document.getElementById("umkmAlamat")?.value?.trim() || "",
                updatedAt: new Date().toISOString(),
            }),
            fillForm: (it) => {
                document.getElementById("umkmId").value = it.id || "";
                document.getElementById("umkmNama").value = it.nama || "";
                document.getElementById("umkmPemilik").value = it.pemilik || "";
                document.getElementById("umkmKategori").value =
                    it.kategori || "";
                document.getElementById("umkmKontak").value = it.kontak || "";
                document.getElementById("umkmStatus").value =
                    it.status || "aktif";
                document.getElementById("umkmAlamat").value = it.alamat || "";
            },
            row: (it) => `
        <tr>
          <td>${it.nama || "-"}</td>
          <td>${it.pemilik || "-"}</td>
          <td>${it.kategori || "-"}</td>
          <td>${_badge(it.status || "aktif", "umkm")}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-ghost" data-action="umkmEdit" data-id="${it.id}"><i class="fa-regular fa-pen-to-square"></i> Edit</button>
              <button class="btn btn-ghost" data-action="umkmDelete" data-id="${it.id}"><i class="fa-regular fa-trash-can"></i> Hapus</button>
            </div>
          </td>
        </tr>
      `,
        });
    }

    function initAdminRtrw() {
        _initSimpleCrud({
            type: "rtrw",
            searchId: "adminRtrwSearch",
            tbodyId: "adminRtrwTbody",
            emptyId: "adminRtrwEmpty",
            modalId: "adminRtrwModal",
            formId: "adminRtrwForm",
            titleId: "adminRtrwModalTitle",
            createAction: "rtrwCreate",
            closeAction: "rtrwClose",
            editAction: "rtrwEdit",
            deleteAction: "rtrwDelete",
            buildItem: () => ({
                id: document.getElementById("rtrwId")?.value || "",
                rt: document.getElementById("rtrwRt")?.value?.trim() || "",
                rw: document.getElementById("rtrwRw")?.value?.trim() || "",
                ketua:
                    document.getElementById("rtrwKetua")?.value?.trim() || "",
                kontak:
                    document.getElementById("rtrwKontak")?.value?.trim() || "",
                updatedAt: new Date().toISOString(),
            }),
            fillForm: (it) => {
                document.getElementById("rtrwId").value = it.id || "";
                document.getElementById("rtrwRt").value = it.rt || "";
                document.getElementById("rtrwRw").value = it.rw || "";
                document.getElementById("rtrwKetua").value = it.ketua || "";
                document.getElementById("rtrwKontak").value = it.kontak || "";
            },
            row: (it) => `
        <tr>
          <td>RT ${it.rt || "-"} / RW ${it.rw || "-"}</td>
          <td>${it.ketua || "-"}</td>
          <td>${it.kontak || "-"}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-ghost" data-action="rtrwEdit" data-id="${it.id}"><i class="fa-regular fa-pen-to-square"></i> Edit</button>
              <button class="btn btn-ghost" data-action="rtrwDelete" data-id="${it.id}"><i class="fa-regular fa-trash-can"></i> Hapus</button>
            </div>
          </td>
        </tr>
      `,
        });
    }

    function initAdminFaq() {
        _initSimpleCrud({
            type: "faq",
            searchId: "adminFaqSearch",
            tbodyId: "adminFaqTbody",
            emptyId: "adminFaqEmpty",
            modalId: "adminFaqModal",
            formId: "adminFaqForm",
            titleId: "adminFaqModalTitle",
            createAction: "faqCreate",
            closeAction: "faqClose",
            editAction: "faqEdit",
            deleteAction: "faqDelete",
            buildItem: () => ({
                id: document.getElementById("faqId")?.value || "",
                q: document.getElementById("faqQ")?.value?.trim() || "",
                a: document.getElementById("faqA")?.value?.trim() || "",
                cat: document.getElementById("faqCat")?.value?.trim() || "",
                status:
                    document.getElementById("faqStatus")?.value || "published",
                updatedAt: new Date().toISOString(),
            }),
            fillForm: (it) => {
                document.getElementById("faqId").value = it.id || "";
                document.getElementById("faqQ").value = it.q || "";
                document.getElementById("faqA").value = it.a || "";
                document.getElementById("faqCat").value = it.cat || "";
                document.getElementById("faqStatus").value =
                    it.status || "published";
            },
            row: (it) => `
        <tr>
          <td>${it.q || "-"}</td>
          <td>${it.cat || "-"}</td>
          <td>${_badge(it.status || "draft", "faq")}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-ghost" data-action="faqEdit" data-id="${it.id}"><i class="fa-regular fa-pen-to-square"></i> Edit</button>
              <button class="btn btn-ghost" data-action="faqDelete" data-id="${it.id}"><i class="fa-regular fa-trash-can"></i> Hapus</button>
            </div>
          </td>
        </tr>
      `,
        });
    }
    async function initLaporan() {
        async function loadData() {
            const response = await fetch("/api/admin/laporan");

            const data = await response.json();

            document.getElementById("lapTotalBerita").textContent =
                data.berita ?? 0;

            document.getElementById("lapTotalAgenda").textContent =
                data.agenda ?? 0;

            document.getElementById("lapTotalPengumuman").textContent =
                data.pengumuman ?? 0;

            document.getElementById("lapTotalGaleri").textContent =
                data.galeri ?? 0;

            document.getElementById("lapTotalSurat").textContent =
                data.surat ?? 0;

            document.getElementById("lapTotalPengaduan").textContent =
                data.pengaduan ?? 0;

            document.getElementById("lapTotalRtrw").textContent =
                data.rtrw ?? 0;

            document.getElementById("lapTotalFaq").textContent = data.faq ?? 0;

            document.getElementById("lapTotalLembaga").textContent =
                data.lembaga ?? 0;

            document.getElementById("lapTotalUnitKerja").textContent =
                data.unit_kerja ?? 0;

            document.getElementById("lapTotalPelayanan").textContent =
                data.pelayanan ?? 0;

            document.getElementById("lapTotalUser").textContent =
                data.user ?? 0;

            const suratBody = document.getElementById("lapSuratTbody");

            suratBody.innerHTML = (data.surat_status || [])
                .map(
                    (item) => `
                    <tr>
                        <td>${item.status}</td>
                        <td>${item.total}</td>
                    </tr>
                `,
                )
                .join("");

            const pengaduanBody = document.getElementById("lapPengaduanTbody");

            pengaduanBody.innerHTML = (data.pengaduan_status || [])
                .map(
                    (item) => `
                    <tr>
                        <td>${item.status}</td>
                        <td>${item.total}</td>
                    </tr>
                `,
                )
                .join("");
        }

        await loadData();

        document
            .querySelector("[data-action='refreshLaporan']")
            ?.addEventListener("click", loadData);
    }
    let _laporanBound = false;
    async function initBeritaLaravel() {
        const tbody = document.getElementById("adminTbody");

        if (!tbody) return;

        async function loadData() {
            try {
                const response = await fetch("/api/admin/berita", {
                    credentials: "same-origin",
                    headers: {
                        Accept: "application/json",
                    },
                });

                const data = await response.json();
                tbody.innerHTML = data
                    .map(
                        (item) => `
                    <tr>
                        <td>${item.title}</td>
                        <td>${item.category}</td>
                        <td>${item.date}</td>
                        <td>${item.status}</td>
                        <td>
                            <button
                                class="btn btn-warning btn-sm"
                                data-action="editBerita"
                                data-id="${item.id}">
                                Edit
                            </button>
                            <button
                                class="btn btn-danger btn-sm"
                                data-action="deleteBerita"
                                data-id="${item.id}">
                                Hapus
                            </button>
                        </td>
                    </tr>
                `,
                    )
                    .join("");
            } catch (error) {
                console.error("Gagal memuat berita", error);
            }
        }

        await loadData();

        const createBtn = document.querySelector("[data-action='create']");
        if (createBtn) {
            createBtn.onclick = () => {
                document.getElementById("itemId").value = "";
                document.getElementById("adminForm")?.reset();
                setImagePreview("");
                if (document.getElementById("adminModalTitle")) {
                    document.getElementById("adminModalTitle").textContent = "Tambah Berita";
                }
                openModal("berita");
            };
        }

        const form = document.getElementById("adminForm");
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const id = document.getElementById("itemId").value;
                const payload = {
                    title: document.getElementById("fTitle").value,
                    category: document.getElementById("fCategory").value,
                    date: document.getElementById("fDate").value,
                    excerpt: document.getElementById("fExcerpt").value,
                    content: document.getElementById("fContent").value,
                    status: document.getElementById("fStatus").value,
                    image: document.getElementById("fImageExisting")?.value || "",
                };

                const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
                let response;
                if (id) {
                    response = await fetch(`/api/admin/berita/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": csrf,
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetch("/api/admin/berita", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": csrf,
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                }

                if (!response.ok) {
                    alert("Gagal menyimpan berita");
                    return;
                }

                closeModal();
                await loadData();
            };
        }
    }
    async function initAgendaLaravel() {
        const tbody = document.getElementById("adminTbody");
        if (!tbody) return;

        async function loadData() {
            try {
                const response = await fetch("/api/admin/agenda");
                const data = await response.json();
                tbody.innerHTML = data
                    .map(
                        (item) => `
                <tr>
                    <td>${item.title}</td>
                    <td>${item.date}</td>
                    <td>${item.time || ""}</td>
                    <td>${item.location || ""}</td>
                    <td>
                        <button
                            class="btn btn-warning btn-sm"
                            data-action="editAgenda"
                            data-id="${item.id}">
                            Edit
                        </button>
                        <button
                            class="btn btn-danger btn-sm"
                            data-action="deleteAgenda"
                            data-id="${item.id}">
                            Hapus
                        </button>
                    </td>
                </tr>
            `,
                    )
                    .join("");
            } catch (error) {
                console.error("Gagal memuat agenda", error);
            }
        }

        await loadData();

        const createBtn = document.querySelector("[data-action='create']");
        if (createBtn) {
            createBtn.onclick = () => {
                document.getElementById("itemId").value = "";
                document.getElementById("adminForm")?.reset();
                if (document.getElementById("adminModalTitle")) {
                    document.getElementById("adminModalTitle").textContent = "Tambah Agenda";
                }
                openModal("agenda");
            };
        }

        const form = document.getElementById("adminForm");
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const id = document.getElementById("itemId").value;
                const payload = {
                    title: document.getElementById("fTitle").value,
                    date: document.getElementById("fDate").value,
                    time: document.getElementById("fTime").value,
                    location: document.getElementById("fLocation").value,
                    content: document.getElementById("fContent").value,
                };

                const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
                let response;
                if (id) {
                    response = await fetch(`/api/admin/agenda/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": csrf,
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetch("/api/admin/agenda", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": csrf,
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                }

                if (!response.ok) {
                    alert("Gagal menyimpan agenda");
                    return;
                }

                closeModal();
                await loadData();
            };
        }
    }
    async function initPengumumanLaravel() {
        const tbody = document.getElementById("adminTbody");
        if (!tbody) return;

        async function loadData() {
            try {
                const response = await fetch("/api/admin/pengumuman");
                const data = await response.json();

                tbody.innerHTML = data
                    .map(
                        (item) => `
                    <tr>
                        <td>${item.title}</td>
                        <td>${item.date}</td>
                        <td>${item.status}</td>
                        <td>
                            <button
                                class="btn btn-warning btn-sm"
                                data-action="editPengumuman"
                                data-id="${item.id}">
                                Edit
                            </button>
                            <button
                                class="btn btn-danger btn-sm"
                                data-action="deletePengumuman"
                                data-id="${item.id}">
                                Hapus
                            </button>
                        </td>
                    </tr>
                `,
                    )
                    .join("");
            } catch (error) {
                console.error("Gagal memuat pengumuman", error);
            }
        }

        await loadData();

        const createBtn = document.querySelector("[data-action='create']");
        if (createBtn) {
            createBtn.onclick = () => {
                document.getElementById("itemId").value = "";
                document.getElementById("adminForm")?.reset();
                if (document.getElementById("adminModalTitle")) {
                    document.getElementById("adminModalTitle").textContent = "Tambah Pengumuman";
                }
                openModal("pengumuman");
            };
        }

        const form = document.getElementById("adminForm");
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const id = document.getElementById("itemId").value;
                const payload = {
                    title: document.getElementById("fTitle").value,
                    date: document.getElementById("fDate").value,
                    status: document.getElementById("fStatus").value,
                    content: document.getElementById("fContent").value,
                };

                const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
                let response;
                if (id) {
                    response = await fetch(`/api/admin/pengumuman/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": csrf,
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetch("/api/admin/pengumuman", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": csrf,
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                }

                if (!response.ok) {
                    alert("Gagal menyimpan pengumuman");
                    return;
                }

                closeModal();
                await loadData();
            };
        }
    }
    async function initGaleriLaravel() {
        console.log("INIT GALERI JALAN");
        const tbody = document.getElementById("adminTbody");

        if (!tbody) return;

        async function loadData() {
            try {
                const response = await fetch("/api/admin/galeri");

                const data = await response.json();
                console.log("BERITA RESPONSE =", data);
                console.log("BERITA ARRAY =", Array.isArray(data));
                tbody.innerHTML = data
                    .map(
                        (item) => `
                <tr>
                    <td>${item.title}</td>
                    <td>${item.category ?? "-"}</td>
                    <td>${item.date ?? "-"}</td>
                    <td>
                        <button
                            class="btn btn-warning btn-sm"
                            onclick="editGaleri(${item.id})">
                            Edit
                        </button>

                        <button
                            class="btn btn-danger btn-sm"
                            onclick="deleteGaleri(${item.id})">
                            Hapus
                        </button>
                    </td>
                </tr>
            `,
                    )
                    .join("");
            } catch (error) {
                console.error("Galeri Error:", error);
            }
        }

        await loadData();

        const createBtn = document.querySelector("[data-action='create']");

        if (createBtn && !createBtn.dataset.boundLaravel) {
            createBtn.dataset.boundLaravel = "true";

            createBtn.addEventListener("click", () => {
                document.getElementById("itemId").value = "";

                document.getElementById("adminForm")?.reset();

                openModal("galeri");
            });
        }

        const form = document.getElementById("adminForm");

        if (form && !form.dataset.boundLaravel) {
            form.dataset.boundLaravel = "true";

            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                const id = document.getElementById("itemId").value;

                const payload = {
                    title: document.getElementById("fTitle").value,
                    category: document.getElementById("fCategory").value,
                    date: document.getElementById("fDate").value,
                    image: "",
                    content: document.getElementById("fContent").value,
                };

                try {
                    let response;

                    if (id) {
                        console.log(payload);
                        response = await fetch(`/api/admin/galeri/${id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "application/json",
                            },
                            body: JSON.stringify(payload),
                        });
                    } else {
                        response = await fetch("/api/admin/galeri", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "application/json",
                            },
                            body: JSON.stringify(payload),
                        });
                    }

                    if (!response.ok) {
                        throw new Error("Gagal menyimpan galeri");
                    }

                    form.reset();

                    document.getElementById("itemId").value = "";

                    closeModal();

                    await loadData();
                } catch (error) {
                    console.error(error);
                    alert("Gagal menyimpan galeri");
                }
            });
        }

        window.editGaleri = async function (id) {
            try {
                const response = await fetch(`/api/admin/galeri/${id}`);

                const item = await response.json();

                document.getElementById("itemId").value = item.id;

                document.getElementById("fTitle").value = item.title ?? "";

                document.getElementById("fCategory").value =
                    item.category ?? "";

                document.getElementById("fDate").value = item.date ?? "";

                document.getElementById("fContent").value = item.content ?? "";

                openModal("galeri", item);
            } catch (error) {
                console.error(error);
            }
        };

        window.deleteGaleri = async function (id) {
            if (!confirm("Hapus galeri ini?")) return;

            try {
                const response = await fetch(`/api/admin/galeri/${id}`, {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                    },
                });

                const result = await response.json();

                if (result.success) {
                    await loadData();
                }
            } catch (error) {
                console.error(error);
            }
        };
    }
    async function initPengaduanLaravel() {
        const tbody = document.getElementById("adminPengaduanTbody");
        const empty = document.getElementById("adminPengaduanEmpty");
        const q = document.getElementById("adminPengaduanSearch") || document.getElementById("adminPengaduanSearchTop");
        const f = document.getElementById("adminPengaduanFilter");

        if (!tbody) return;

        let items = [];

        async function loadData() {
            try {
                const response = await fetch("/api/admin/pengaduan", {
                    credentials: "same-origin",
                    headers: {
                        Accept: "application/json",
                    },
                });
                items = await response.json();
                render();
            } catch (error) {
                console.error("Gagal memuat pengaduan", error);
            }
        }

        function render() {
            const keyword = (q?.value || "").trim().toLowerCase();
            const status = (f?.value || "").trim().toLowerCase();

            let filtered = items;
            if (keyword) {
                filtered = filtered.filter((it) =>
                    `${it.user?.name || ""} ${it.judul || ""} ${it.isi || ""}`
                        .toLowerCase()
                        .includes(keyword),
                );
            }
            if (status) {
                filtered = filtered.filter((it) => {
                    const s = (it.status || "").toLowerCase();
                    if (status === "baru") return s === "baru" || s === "menunggu";
                    return s === status;
                });
            }

            tbody.innerHTML = filtered
                .map(
                    (it) => `
            <tr>
                <td>${it.user?.name || "-"}</td>
                <td>${it.judul || "-"}</td>
                <td>${_fmtDate(it.created_at || it.tanggal)}</td>
                <td>${_badge(it.status, "pengaduan")}</td>
                <td>
                    <div class="row-actions">
                        <button class="btn btn-ghost" data-action="pengaduanDetailLaravel" data-id="${it.id}"><i class="fa-regular fa-eye"></i> Detail</button>
                        <button class="btn btn-ghost" data-action="pengaduanDeleteLaravel" data-id="${it.id}"><i class="fa-regular fa-trash-can"></i> Hapus</button>
                    </div>
                </td>
            </tr>
        `,
                )
                .join("");

            if (empty) empty.style.display = filtered.length ? "none" : "block";
        }

        await loadData();

        q?.addEventListener("input", render);
        f?.addEventListener("change", render);

        if (!window._pengaduanLaravelBound) {
            window._pengaduanLaravelBound = true;

            document.addEventListener("click", async (e) => {
                const detail = e.target.closest("[data-action='pengaduanDetailLaravel']");
                const del = e.target.closest("[data-action='pengaduanDeleteLaravel']");
                const close = e.target.closest("[data-action='closePengaduanModal']");
                const save = e.target.closest("[data-action='savePengaduanStatus']");

                if (close) {
                    _closeModal("adminPengaduanModal");
                    return;
                }

                if (del) {
                    const id = del.dataset.id;
                    if (!confirm("Hapus pengaduan ini secara permanen?")) return;
                    try {
                        const response = await fetch(`/api/admin/pengaduan/${id}`, {
                            method: "DELETE",
                            headers: {
                                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
                                Accept: "application/json",
                            },
                        });
                        if (response.ok) {
                            alert("Pengaduan berhasil dihapus");
                            loadData();
                        } else {
                            alert("Gagal menghapus pengaduan");
                        }
                    } catch (error) {
                        console.error(error);
                        alert("Gagal menghapus pengaduan");
                    }
                    return;
                }

                if (detail) {
                    const id = detail.dataset.id;
                    try {
                        const res = await fetch(`/api/admin/pengaduan/${id}`, {
                            headers: { Accept: "application/json" }
                        });
                        const it = await res.json();
                        if (!it) return;

                        document.getElementById("apdId").value = it.id;
                        document.getElementById("apdNama").value = it.user?.name || "";
                        document.getElementById("apdTanggal").value = _fmtDate(it.created_at || it.tanggal);
                        document.getElementById("apdJudul").value = it.judul || "";
                        document.getElementById("apdIsi").value = it.isi || "";
                        document.getElementById("apdStatus").value = (it.status || "menunggu").toLowerCase();
                        document.getElementById("apdCatatan").value = it.catatanAdmin || "";

                        const sub = document.getElementById("adminPengaduanModalSub");
                        if (sub) sub.textContent = `ID: ${it.id}`;

                        _openModal("adminPengaduanModal");
                    } catch (error) {
                        console.error(error);
                    }
                    return;
                }

                if (save) {
                    const id = document.getElementById("apdId").value;
                    const status = document.getElementById("apdStatus").value;

                    try {
                        const res = await fetch(`/api/admin/pengaduan/${id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
                                Accept: "application/json",
                            },
                            body: JSON.stringify({ status })
                        });
                        if (res.ok) {
                            alert("Status pengaduan berhasil disimpan");
                            _closeModal("adminPengaduanModal");
                            loadData();
                        } else {
                            alert("Gagal menyimpan status pengaduan");
                        }
                    } catch (error) {
                        console.error(error);
                        alert("Gagal menyimpan status pengaduan");
                    }
                }
            });
        }
    }

    async function initSuratLaravel() {
        const tbody = document.getElementById("adminSuratTbody");
        const empty = document.getElementById("adminSuratEmpty");
        const q = document.getElementById("adminSuratSearch");
        const f = document.getElementById("adminSuratFilter");

        if (!tbody) return;

        let items = [];

        async function loadData() {
            try {
                const response = await fetch("/api/admin/surat", {
                    credentials: "same-origin",
                    headers: {
                        Accept: "application/json",
                    },
                });
                items = await response.json();
                render();
            } catch (error) {
                console.error("Gagal memuat surat", error);
            }
        }

        function render() {
            const keyword = (q?.value || "").trim().toLowerCase();
            const status = (f?.value || "").trim().toLowerCase();

            let filtered = items;
            if (keyword) {
                filtered = filtered.filter((it) =>
                    `${it.user?.name || ""} ${it.jenis_surat || ""} ${it.keperluan || ""}`
                        .toLowerCase()
                        .includes(keyword),
                );
            }
            if (status) {
                filtered = filtered.filter(
                    (it) => (it.status || "").toLowerCase() == status,
                );
            }

            tbody.innerHTML = filtered
                .map(
                    (it) => `
            <tr>
                <td>${it.jenis_surat || "-"}</td>
                <td>${it.user?.name || "-"}</td>
                <td>${_fmtDate(it.created_at || it.tanggal)}</td>
                <td>${_badge(it.status, "surat")}</td>
                <td>
                    <div class="row-actions">
                        <button class="btn btn-ghost" data-action="suratDetailLaravel" data-id="${it.id}"><i class="fa-regular fa-eye"></i> Detail</button>
                        <button class="btn btn-ghost" data-action="suratDeleteLaravel" data-id="${it.id}"><i class="fa-regular fa-trash-can"></i> Hapus</button>
                    </div>
                </td>
            </tr>
        `,
                )
                .join("");

            if (empty) empty.style.display = filtered.length ? "none" : "block";
        }

        await loadData();

        q?.addEventListener("input", render);
        f?.addEventListener("change", render);

        if (!window._suratLaravelBound) {
            window._suratLaravelBound = true;

            document.addEventListener("click", async (e) => {
                const detail = e.target.closest("[data-action='suratDetailLaravel']");
                const del = e.target.closest("[data-action='suratDeleteLaravel']");
                const close = e.target.closest("[data-action='closeSuratModal']");
                const save = e.target.closest("[data-action='saveSuratStatus']");

                if (close) {
                    _closeModal("adminSuratModal");
                    return;
                }

                if (del) {
                    const id = del.dataset.id;
                    if (!confirm("Hapus pengajuan surat ini secara permanen?")) return;
                    try {
                        const response = await fetch(`/api/admin/surat/${id}`, {
                            method: "DELETE",
                            headers: {
                                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
                                Accept: "application/json",
                            },
                        });
                        if (response.ok) {
                            alert("Pengajuan surat berhasil dihapus");
                            loadData();
                        } else {
                            alert("Gagal menghapus pengajuan surat");
                        }
                    } catch (error) {
                        console.error(error);
                        alert("Gagal menghapus pengajuan surat");
                    }
                    return;
                }

                if (detail) {
                    const id = detail.dataset.id;
                    try {
                        const res = await fetch(`/api/admin/surat/${id}`, {
                            headers: { Accept: "application/json" }
                        });
                        const it = await res.json();
                        if (!it) return;

                        document.getElementById("asId").value = it.id;
                        document.getElementById("asJenis").value = it.jenis_surat || "";
                        document.getElementById("asTanggal").value = _fmtDate(it.created_at || it.tanggal);
                        document.getElementById("asNama").value = it.user?.name || "";
                        document.getElementById("asNik").value = it.user?.nik || "";
                        document.getElementById("asTelp").value = it.user?.telp || "";
                        document.getElementById("asAlamat").value = `${it.user?.alamat || ""} RT ${it.user?.rt || "-"}/RW ${it.user?.rw || "-"}`;
                        document.getElementById("asKeperluan").value = it.keperluan || "";
                        document.getElementById("asStatus").value = (it.status || "menunggu").toLowerCase();
                        document.getElementById("asCatatan").value = it.catatanAdmin || "";

                        const sub = document.getElementById("adminSuratModalSub");
                        if (sub) sub.textContent = `ID: ${it.id}`;

                        // Render Berkas
                        const berkasWrap = document.getElementById("asBerkasContainer");
                        if (berkasWrap) {
                            const files = Array.isArray(it.berkas) ? it.berkas : [];
                            if (!files.length) {
                                berkasWrap.innerHTML = `<div class="muted" style="grid-column: 1/-1;">Tidak ada berkas persyaratan yang diunggah.</div>`;
                            } else {
                                const helperFmtSize = (bytes) => {
                                    if (!bytes) return "0 B";
                                    const k = 1024;
                                    const sizes = ["B", "KB", "MB", "GB"];
                                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                                    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
                                };
                                const helperEsc = (str) => {
                                    return String(str || "")
                                        .replace(/&/g, "&amp;")
                                        .replace(/</g, "&lt;")
                                        .replace(/>/g, "&gt;")
                                        .replace(/"/g, "&quot;")
                                        .replace(/'/g, "&#039;");
                                };

                                berkasWrap.innerHTML = files.map((f) => {
                                    const isImg = (f.mime || '').startsWith('image/') || (f.fileName || '').match(/\.(jpg|jpeg|png|webp|gif)$/i);
                                    const thumbUrl = isImg && f.dataUrl ? f.dataUrl : '';
                                    
                                    let previewHtml = '';
                                    if (thumbUrl) {
                                        previewHtml = `<img src="${thumbUrl}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px 8px 0 0;" />`;
                                    } else {
                                        previewHtml = `
                                            <div style="width: 100%; height: 100px; background: rgba(148, 163, 184, 0.1); border-radius: 8px 8px 0 0; display: flex; align-items: center; justify-content: center;">
                                                <i class="fa-solid fa-file-pdf" style="font-size: 36px; color: #ef4444;"></i>
                                            </div>
                                        `;
                                    }

                                    const openAction = f.dataUrl ? `href="${f.dataUrl}" target="_blank"` : `href="#" onclick="alert('File tidak dapat dibuka karena ukuran melebihi batas demo.'); return false;"`;
                                    const downloadAction = f.dataUrl ? `href="${f.dataUrl}" download="${helperEsc(f.fileName)}"` : `href="#" onclick="alert('File tidak dapat didownload karena ukuran melebihi batas demo.'); return false;"`;

                                    return `
                                        <div class="card" style="border: 1px solid var(--border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; background: #fff; box-shadow: none;">
                                            ${previewHtml}
                                            <div style="padding: 8px; display: flex; flex-direction: column; flex: 1;">
                                                <div style="font-weight: 1000; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${helperEsc(f.fileName)}">${helperEsc(f.fileName || '-')}</div>
                                                <div style="font-size: 10px; color: var(--muted); margin-top: 2px; font-weight: 700;">${helperEsc(f.requirement || 'Berkas')}</div>
                                                <div style="font-size: 10px; color: var(--muted); margin-top: 1px;">${helperFmtSize(f.size)}</div>
                                                
                                                <div style="margin-top: auto; padding-top: 6px; display: flex; gap: 4px; justify-content: flex-end;">
                                                    <a class="btn btn-light btn-sm" ${openAction} style="padding: 2px 6px; border-radius: 4px; font-size: 10px; border: 1px solid var(--border); display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px;" title="Lihat">
                                                        <i class="fa-regular fa-eye"></i>
                                                    </a>
                                                    <a class="btn btn-light btn-sm" ${downloadAction} style="padding: 2px 6px; border-radius: 4px; font-size: 10px; border: 1px solid var(--border); display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px;" title="Unduh">
                                                        <i class="fa-solid fa-download"></i>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('');
                            }
                        }

                        _openModal("adminSuratModal");
                    } catch (error) {
                        console.error(error);
                    }
                    return;
                }

                if (save) {
                    const id = document.getElementById("asId").value;
                    const status = document.getElementById("asStatus").value;

                    try {
                        const res = await fetch(`/api/admin/surat/${id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
                                Accept: "application/json",
                            },
                            body: JSON.stringify({ status })
                        });
                        if (res.ok) {
                            alert("Status surat berhasil disimpan");
                            _closeModal("adminSuratModal");
                            loadData();
                        } else {
                            alert("Gagal menyimpan status surat");
                        }
                    } catch (error) {
                        console.error(error);
                        alert("Gagal menyimpan status surat");
                    }
                }
            });
        }
    }
    async function initSettingsLaravel() {
        console.log("SETTING LARAVEL LOADED");

        const btnSave = document.querySelector("[data-action='saveSettings']");

        if (!btnSave) return;

        async function loadData() {
            const response = await fetch("/api/admin/setting");

            if (!response.ok) return;

            const data = await response.json();

            if (!data) return;

            document.getElementById("sSiteName").value = data.site_name ?? "";

            document.getElementById("sEmail").value = data.email ?? "";

            document.getElementById("sPhone").value = data.phone ?? "";

            document.getElementById("sAddress").value = data.address ?? "";

            document.getElementById("sInstagram").value = data.instagram ?? "";

            document.getElementById("sNote").value = data.profil ?? "";
        }

        await loadData();

        if (!btnSave.dataset.laravelBound) {
            btnSave.dataset.laravelBound = "true";

            btnSave.addEventListener("click", async () => {
                const payload = {
                    site_name: document.getElementById("sSiteName").value,

                    email: document.getElementById("sEmail").value,

                    phone: document.getElementById("sPhone").value,

                    address: document.getElementById("sAddress").value,

                    instagram: document.getElementById("sInstagram").value,

                    profil: document.getElementById("sNote").value,
                };

                const current = await fetch("/api/admin/setting");

                const setting = await current.json();

                let response;

                if (setting?.id) {
                    response = await fetch(`/api/admin/setting/${setting.id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetch("/api/admin/setting", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                }

                if (!response.ok) {
                    alert("Gagal menyimpan pengaturan");

                    return;
                }

                alert("Pengaturan berhasil disimpan");

                await loadData();
            });
        }
    }
    document.addEventListener("click", async (e) => {
        // --- BERITA ---
        const btnDeleteBerita = e.target.closest("[data-action='deleteBerita']");
        if (btnDeleteBerita) {
            const id = btnDeleteBerita.dataset.id;
            if (!confirm("Hapus berita ini?")) return;
            try {
                await fetch(`/api/admin/berita/${id}`, {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
                    },
                });
                await initBeritaLaravel();
            } catch (err) {
                console.error(err);
            }
            return;
        }

        const btnEditBerita = e.target.closest("[data-action='editBerita']");
        if (btnEditBerita) {
            const id = btnEditBerita.dataset.id;
            try {
                const response = await fetch(`/api/admin/berita/${id}`);
                const item = await response.json();
                if (document.getElementById("adminModalTitle")) {
                    document.getElementById("adminModalTitle").textContent = "Edit Berita";
                }
                openModal("berita", item);
            } catch (err) {
                console.error(err);
            }
            return;
        }

        // --- AGENDA ---
        const btnDeleteAgenda = e.target.closest("[data-action='deleteAgenda']");
        if (btnDeleteAgenda) {
            const id = btnDeleteAgenda.dataset.id;
            if (!confirm("Hapus agenda ini?")) return;
            try {
                await fetch(`/api/admin/agenda/${id}`, {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
                    },
                });
                await initAgendaLaravel();
            } catch (err) {
                console.error(err);
            }
            return;
        }

        const btnEditAgenda = e.target.closest("[data-action='editAgenda']");
        if (btnEditAgenda) {
            const id = btnEditAgenda.dataset.id;
            try {
                const response = await fetch(`/api/admin/agenda/${id}`);
                const item = await response.json();
                if (document.getElementById("adminModalTitle")) {
                    document.getElementById("adminModalTitle").textContent = "Edit Agenda";
                }
                openModal("agenda", item);
            } catch (err) {
                console.error(err);
            }
            return;
        }

        // --- PENGUMUMAN ---
        const btnDeletePengumuman = e.target.closest("[data-action='deletePengumuman']");
        if (btnDeletePengumuman) {
            const id = btnDeletePengumuman.dataset.id;
            if (!confirm("Hapus pengumuman ini?")) return;
            try {
                await fetch(`/api/admin/pengumuman/${id}`, {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
                    },
                });
                await initPengumumanLaravel();
            } catch (err) {
                console.error(err);
            }
            return;
        }

        const btnEditPengumuman = e.target.closest("[data-action='editPengumuman']");
        if (btnEditPengumuman) {
            const id = btnEditPengumuman.dataset.id;
            try {
                const response = await fetch(`/api/admin/pengumuman/${id}`);
                const item = await response.json();
                if (document.getElementById("adminModalTitle")) {
                    document.getElementById("adminModalTitle").textContent = "Edit Pengumuman";
                }
                openModal("pengumuman", item);
            } catch (err) {
                console.error(err);
            }
            return;
        }
    });

    async function initRtrwLaravel() {
        const tbody = document.getElementById("adminRtrwTbody");

        if (!tbody) return;

        async function loadData() {
            const response = await fetch("/api/admin/rtrw");
            const data = await response.json();
            console.log("BERITA RESPONSE =", data);
            console.log("BERITA ARRAY =", Array.isArray(data));
            tbody.innerHTML = data
                .map(
                    (item) => `
            <tr>
                <td>${item.rt}</td>
                <td>${item.rw}</td>
                <td>${item.ketua ?? "-"}</td>
                <td>${item.telepon ?? "-"}</td>
                <td>
                    <button class="btn btn-warning btn-sm"
                        onclick="editRtrw(${item.id})">
                        Edit
                    </button>

                    <button class="btn btn-danger btn-sm"
                        onclick="deleteRtrw(${item.id})">
                        Hapus
                    </button>
                </td>
            </tr>
        `,
                )
                .join("");
        }

        await loadData();

        const createBtn = document.querySelector("[data-action='rtrwCreate']");

        createBtn?.addEventListener("click", () => {
            document.getElementById("rtrwId").value = "";
            document.getElementById("adminRtrwForm").reset();

            document.getElementById("adminRtrwModal")?.classList.add("open");
        });

        const form = document.getElementById("adminRtrwForm");

        if (form && !form.dataset.laravelBound) {
            form.dataset.laravelBound = "true";

            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                const id = document.getElementById("rtrwId").value;

                const payload = {
                    rt: document.getElementById("rtrwRt").value,
                    rw: document.getElementById("rtrwRw").value,
                    ketua: document.getElementById("rtrwKetua").value,
                    telepon: document.getElementById("rtrwKontak").value,
                };

                let response;

                if (id) {
                    response = await fetch(`/api/admin/rtrw/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetch("/api/admin/rtrw", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                }

                if (!response.ok) {
                    alert("Gagal menyimpan RT/RW");
                    return;
                }

                form.reset();

                document
                    .getElementById("adminRtrwModal")
                    ?.classList.remove("open");

                await loadData();
            });
        }

        window.editRtrw = async (id) => {
            const response = await fetch(`/api/admin/rtrw/${id}`);

            const item = await response.json();

            document.getElementById("rtrwId").value = item.id;

            document.getElementById("rtrwRt").value = item.rt ?? "";

            document.getElementById("rtrwRw").value = item.rw ?? "";

            document.getElementById("rtrwKetua").value = item.ketua ?? "";

            document.getElementById("rtrwKontak").value = item.telepon ?? "";

            document.getElementById("adminRtrwModal")?.classList.add("open");
        };

        window.deleteRtrw = async (id) => {
            if (!confirm("Hapus data ini?")) return;

            await fetch(`/api/admin/rtrw/${id}`, {
                method: "DELETE",
            });

            await loadData();
        };
    }

    async function initFaqLaravel() {
        console.log("FAQ LARAVEL LOADED");
        const tbody = document.getElementById("adminFaqTbody");

        if (!tbody) return;

        async function loadData() {
            const response = await fetch("/api/admin/faq");
            const data = await response.json();

            console.log("FAQ RESPONSE =", data);
            console.log("FAQ ARRAY =", Array.isArray(data));

            tbody.innerHTML = data
                .map(
                    (item) => `
            <tr>
                <td>${item.question}</td>
                <td>${item.category ?? "-"}</td>
                <td><span class="badge badge-done">Published</span></td>
                <td>
                    <button
                        class="btn btn-warning btn-sm"
                        onclick="editFaq(${item.id})">
                        Edit
                    </button>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="deleteFaq(${item.id})">
                        Hapus
                    </button>
                </td>
            </tr>
        `,
                )
                .join("");
        }

        await loadData();

        const form = document.getElementById("adminFaqForm");

        if (form && !form.dataset.laravelBound) {
            form.dataset.laravelBound = "true";

            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                const id = document.getElementById("faqId").value;

                const payload = {
                    question: document.getElementById("faqQ").value,

                    answer: document.getElementById("faqA").value,

                    category: document.getElementById("faqCat").value,
                };

                let response;

                if (id) {
                    response = await fetch(`/api/admin/faq/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetch("/api/admin/faq", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                }

                if (!response.ok) {
                    alert("Gagal menyimpan FAQ");
                    return;
                }

                form.reset();

                document
                    .getElementById("adminFaqModal")
                    ?.classList.remove("open");

                await loadData();
            });
        }

        window.editFaq = async (id) => {
            const response = await fetch(`/api/admin/faq/${id}`);

            const item = await response.json();

            document.getElementById("faqId").value = item.id;

            document.getElementById("faqQ").value = item.question ?? "";

            document.getElementById("faqA").value = item.answer ?? "";

            document.getElementById("faqCat").value = item.category ?? "";

            document.getElementById("adminFaqModal")?.classList.add("open");
        };

        window.deleteFaq = async (id) => {
            if (!confirm("Hapus FAQ ini?")) return;

            await fetch(`/api/admin/faq/${id}`, {
                method: "DELETE",
            });

            await loadData();
        };
        document.addEventListener("click", (e) => {
            if (e.target.closest("[data-action='faqCreate']")) {
                document.getElementById("faqId").value = "";
                document.getElementById("adminFaqForm").reset();

                document.getElementById("adminFaqModal")?.classList.add("open");
            }

            if (e.target.closest("[data-action='faqClose']")) {
                document
                    .getElementById("adminFaqModal")
                    ?.classList.remove("open");
            }
        });
    }

    async function initLembagaLaravel() {
        const tbody = document.getElementById("admLembagaTbody");

        if (!tbody) return;

        async function loadData() {
            try {
                const response = await fetch("/api/admin/lembaga");
                const data = await response.json();

                console.log("LEMBAGA RESPONSE =", data);
                console.log("LEMBAGA ARRAY =", Array.isArray(data));

                tbody.innerHTML = data
                    .map(
                        (item) => `
                <tr>
                    <td>${item.nama ?? "-"}</td>
                    <td>${item.jabatan ?? "-"}</td>
                    <td>${item.wilayah ?? "-"}</td>
                    <td>${item.kontak ?? "-"}</td>
                    <td class="text-right">
                        <button
                            class="btn btn-warning btn-sm"
                            onclick="editLembaga(${item.id})">
                            Edit
                        </button>

                        <button
                            class="btn btn-danger btn-sm"
                            onclick="deleteLembaga(${item.id})">
                            Hapus
                        </button>
                    </td>
                </tr>
            `,
                    )
                    .join("");
            } catch (error) {
                console.error("Lembaga Error:", error);
            }
        }

        await loadData();

        const form = document.getElementById("lembagaForm");

        if (form && !form.dataset.boundLaravel) {
            form.dataset.boundLaravel = "true";

            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                const id = document.getElementById("fLembagaId").value;

                const payload = {
                    jenis: document.getElementById("fLembagaJenis").value,
                    nama: document.getElementById("fLembagaNama").value,
                    jabatan: document.getElementById("fLembagaJabatan").value,
                    wilayah: document.getElementById("fLembagaWilayah").value,
                    kontak: document.getElementById("fLembagaKontak").value,
                    keterangan: document.getElementById("fLembagaKet").value,
                };

                let response;

                if (id) {
                    response = await fetch(`/api/admin/lembaga/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetch("/api/admin/lembaga", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                }

                if (!response.ok) {
                    alert("Gagal menyimpan data lembaga");
                    return;
                }

                form.reset();

                document
                    .getElementById("lembagaModal")
                    ?.classList.remove("open");

                await loadData();
            });
        }

        document
            .getElementById("btnAddLembaga")
            ?.addEventListener("click", () => {
                form.reset();

                document.getElementById("fLembagaId").value = "";

                document.getElementById("lembagaModal")?.classList.add("open");
            });

        document.addEventListener("click", (e) => {
            if (e.target.closest("[data-action='closeLembagaModal']")) {
                document
                    .getElementById("lembagaModal")
                    ?.classList.remove("open");
            }
        });

        window.editLembaga = async function (id) {
            const response = await fetch(`/api/admin/lembaga/${id}`);
            const item = await response.json();

            document.getElementById("fLembagaId").value = item.id;
            document.getElementById("fLembagaJenis").value = item.jenis ?? "";
            document.getElementById("fLembagaNama").value = item.nama ?? "";
            document.getElementById("fLembagaJabatan").value =
                item.jabatan ?? "";
            document.getElementById("fLembagaWilayah").value =
                item.wilayah ?? "";
            document.getElementById("fLembagaKontak").value = item.kontak ?? "";
            document.getElementById("fLembagaKet").value =
                item.keterangan ?? "";

            document.getElementById("lembagaModal")?.classList.add("open");
        };

        window.deleteLembaga = async function (id) {
            if (!confirm("Hapus data lembaga ini?")) return;

            await fetch(`/api/admin/lembaga/${id}`, {
                method: "DELETE",
            });

            await loadData();
        };
    }

    async function initUnitKerjaLaravel() {
        const tbody = document.getElementById("adminUnitKerjaTbody");

        if (!tbody) return;

        const form = document.getElementById("ukForm");
        const formCard = document.getElementById("ukFormCard");

        async function loadData() {
            const response = await fetch("/api/admin/unit-kerja");
            const data = await response.json();
            console.log("BERITA RESPONSE =", data);
            console.log("BERITA ARRAY =", Array.isArray(data));
            tbody.innerHTML = data
                .map(
                    (item) => `
            <tr>
                <td>${item.nama_unit ?? "-"}</td>
                <td>${item.nama_pimpinan ?? "-"}</td>
                <td>${item.kontak ?? "-"}</td>
                <td>${item.updated_at ?? "-"}</td>
                <td class="text-right">

                    <button
                        class="btn btn-warning btn-sm"
                        onclick="editUnitKerja(${item.id})">
                        Edit
                    </button>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="deleteUnitKerja(${item.id})">
                        Hapus
                    </button>

                </td>
            </tr>
        `,
                )
                .join("");
        }

        await loadData();

        document.getElementById("ukAddBtn")?.addEventListener("click", () => {
            form.reset();

            document.getElementById("ukId").value = "";

            formCard.hidden = false;
        });

        document
            .getElementById("ukFormClose")
            ?.addEventListener("click", () => {
                formCard.hidden = true;
            });

        document
            .getElementById("ukFormCancel")
            ?.addEventListener("click", () => {
                formCard.hidden = true;
            });

        document
            .getElementById("ukRefreshBtn")
            ?.addEventListener("click", loadData);

        if (form && !form.dataset.boundLaravel) {
            form.dataset.boundLaravel = "true";

            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                const id = document.getElementById("ukId").value;

                const payload = {
                    jenis: document.getElementById("ukJenis").value,

                    nama_unit: document.getElementById("ukNamaUnit").value,

                    nama_pimpinan:
                        document.getElementById("ukNamaPimpinan").value,

                    jabatan_pimpinan:
                        document.getElementById("ukJabatanPimpinan").value,

                    kontak: document.getElementById("ukKontak").value,

                    email: document.getElementById("ukEmail").value,

                    alamat: document.getElementById("ukAlamat").value,

                    tugas: document.getElementById("ukTugas").value,

                    kewenangan: document.getElementById("ukKewenangan").value,
                };

                let response;

                if (id) {
                    response = await fetch(`/api/admin/unit-kerja/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetch("/api/admin/unit-kerja", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                }

                if (!response.ok) {
                    alert("Gagal menyimpan Unit Kerja");
                    return;
                }

                form.reset();

                formCard.hidden = true;

                await loadData();
            });
        }

        window.editUnitKerja = async function (id) {
            const response = await fetch(`/api/admin/unit-kerja/${id}`);

            const item = await response.json();

            document.getElementById("ukId").value = item.id;

            document.getElementById("ukJenis").value = item.jenis ?? "";

            document.getElementById("ukNamaUnit").value = item.nama_unit ?? "";

            document.getElementById("ukNamaPimpinan").value =
                item.nama_pimpinan ?? "";

            document.getElementById("ukJabatanPimpinan").value =
                item.jabatan_pimpinan ?? "";

            document.getElementById("ukKontak").value = item.kontak ?? "";

            document.getElementById("ukEmail").value = item.email ?? "";

            document.getElementById("ukAlamat").value = item.alamat ?? "";

            document.getElementById("ukTugas").value = item.tugas ?? "";

            document.getElementById("ukKewenangan").value =
                item.kewenangan ?? "";

            formCard.hidden = false;
        };

        window.deleteUnitKerja = async function (id) {
            if (!confirm("Hapus Unit Kerja ini?")) return;

            await fetch(`/api/admin/unit-kerja/${id}`, {
                method: "DELETE",
            });

            await loadData();
        };
    }

    async function initPelayananLaravel() {
        const tbody = document.getElementById("srvAdmTbody");

        if (!tbody) return;

        const form = document.getElementById("srvForm");
        const modal = document.getElementById("srvModal");

        const openModal = () => {
            modal?.classList.add("open");
        };

        const closeModal = () => {
            modal?.classList.remove("open");
        };

        function renderArrayEditor(containerId, items = []) {
            const container = document.getElementById(containerId);

            if (!container) return;

            container.innerHTML = items
                .map(
                    (item) => `
                <div class="array-row" style="display:flex;gap:8px;margin-bottom:8px">
                    <input
                        class="input array-input"
                        value="${item ?? ""}">
                    <button
                        type="button"
                        class="btn btn-danger btn-sm remove-array-item">
                        Hapus
                    </button>
                </div>
            `,
                )
                .join("");

            container.querySelectorAll(".remove-array-item").forEach((btn) => {
                btn.addEventListener("click", () => {
                    btn.closest(".array-row")?.remove();
                });
            });
        }

        function getArrayValues(containerId) {
            const container = document.getElementById(containerId);

            if (!container) return [];

            return [...container.querySelectorAll(".array-input")]
                .map((el) => el.value.trim())
                .filter(Boolean);
        }

        function addArrayItem(containerId) {
            const container = document.getElementById(containerId);

            if (!container) return;

            const row = document.createElement("div");

            row.className = "array-row";
            row.style.cssText = "display:flex;gap:8px;margin-bottom:8px";

            row.innerHTML = `
            <input class="input array-input">
            <button
                type="button"
                class="btn btn-danger btn-sm remove-array-item">
                Hapus
            </button>
        `;

            container.appendChild(row);

            row.querySelector(".remove-array-item")?.addEventListener(
                "click",
                () => {
                    row.remove();
                },
            );
        }

        async function loadData() {
            try {
                const response = await fetch("/api/admin/pelayanan");

                const data = await response.json();
                console.log("BERITA RESPONSE =", data);
                console.log("BERITA ARRAY =", Array.isArray(data));
                tbody.innerHTML = data
                    .map(
                        (item) => `
                    <tr>
                        <td>${item.nama ?? "-"}</td>
                        <td>${item.slug ?? "-"}</td>
                        <td>
                            ${item.online ? "Online" : "Offline"}
                        </td>

                        <td class="text-right">

                            <button
                                class="btn btn-warning btn-sm"
                                onclick="editPelayanan(${item.id})">
                                Edit
                            </button>

                            <button
                                class="btn btn-danger btn-sm"
                                onclick="deletePelayanan(${item.id})">
                                Hapus
                            </button>

                        </td>
                    </tr>
                `,
                    )
                    .join("");
            } catch (error) {
                console.error("Pelayanan Load Error:", error);
            }
        }

        await loadData();

        document.getElementById("btnAddSrv")?.addEventListener("click", () => {
            form.reset();

            document.getElementById("fSrvId").value = "";

            renderArrayEditor("fSrvSyaratList", []);

            renderArrayEditor("fSrvStepList", []);

            renderArrayEditor("fSrvFormList", []);

            openModal();
        });

        document
            .getElementById("btnAddSyarat")
            ?.addEventListener("click", () => {
                addArrayItem("fSrvSyaratList");
            });

        document.getElementById("btnAddStep")?.addEventListener("click", () => {
            addArrayItem("fSrvStepList");
        });

        document
            .getElementById("btnAddField")
            ?.addEventListener("click", () => {
                addArrayItem("fSrvFormList");
            });

        document
            .getElementById("srvRefreshBtn")
            ?.addEventListener("click", loadData);

        document.addEventListener("click", (e) => {
            if (e.target.closest("[data-action='closeSrvModal']")) {
                closeModal();
            }
        });

        if (form && !form.dataset.boundLaravel) {
            form.dataset.boundLaravel = "true";

            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                const id = document.getElementById("fSrvId").value;

                const payload = {
                    nama: document.getElementById("fSrvNama").value,

                    slug: document.getElementById("fSrvPage").value,

                    estimasi: document.getElementById("fSrvEstimasi").value,

                    biaya: document.getElementById("fSrvBiaya").value,

                    online: document.getElementById("fSrvOnline").checked,

                    syarat: getArrayValues("fSrvSyaratList"),

                    langkah: getArrayValues("fSrvStepList"),

                    form_fields: getArrayValues("fSrvFormList"),

                    jam_pelayanan: document.getElementById("fSrvJam").value,

                    lokasi: document.getElementById("fSrvLokasi").value,

                    catatan: document.getElementById("fSrvCatatan").value,
                };

                let response;

                if (id) {
                    response = await fetch(`/api/admin/pelayanan/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetch("/api/admin/pelayanan", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                }

                if (!response.ok) {
                    alert("Gagal menyimpan pelayanan");

                    return;
                }

                closeModal();

                await loadData();
            });
        }

        window.editPelayanan = async function (id) {
            const response = await fetch(`/api/admin/pelayanan/${id}`);

            const item = await response.json();

            document.getElementById("fSrvId").value = item.id;

            document.getElementById("fSrvNama").value = item.nama ?? "";

            document.getElementById("fSrvPage").value = item.slug ?? "";

            document.getElementById("fSrvEstimasi").value = item.estimasi ?? "";

            document.getElementById("fSrvBiaya").value = item.biaya ?? "";

            document.getElementById("fSrvOnline").checked = !!item.online;

            document.getElementById("fSrvJam").value = item.jam_pelayanan ?? "";

            document.getElementById("fSrvLokasi").value = item.lokasi ?? "";

            document.getElementById("fSrvCatatan").value = item.catatan ?? "";

            renderArrayEditor("fSrvSyaratList", item.syarat ?? []);

            renderArrayEditor("fSrvStepList", item.langkah ?? []);

            renderArrayEditor("fSrvFormList", item.form_fields ?? []);

            openModal();
        };

        window.deletePelayanan = async function (id) {
            if (!confirm("Hapus pelayanan ini?")) return;

            await fetch(`/api/admin/pelayanan/${id}`, {
                method: "DELETE",
            });

            await loadData();
        };
    }

    async function initSettingsLaravel() {
        console.log("SETTING LARAVEL LOADED");

        const btnSave = document.querySelector("[data-action='saveSettings']");

        if (!btnSave) return;

        async function loadData() {
            const response = await fetch("/api/admin/setting");

            if (!response.ok) return;

            const data = await response.json();

            if (!data) return;

            document.getElementById("sSiteName").value = data.site_name ?? "";

            document.getElementById("sEmail").value = data.email ?? "";

            document.getElementById("sPhone").value = data.phone ?? "";

            document.getElementById("sAddress").value = data.address ?? "";

            document.getElementById("sInstagram").value = data.instagram ?? "";

            document.getElementById("sNote").value = data.profil ?? "";
        }

        await loadData();

        if (!btnSave.dataset.laravelBound) {
            btnSave.dataset.laravelBound = "true";

            btnSave.addEventListener("click", async () => {
                const payload = {
                    site_name: document.getElementById("sSiteName").value,

                    email: document.getElementById("sEmail").value,

                    phone: document.getElementById("sPhone").value,

                    address: document.getElementById("sAddress").value,

                    instagram: document.getElementById("sInstagram").value,

                    profil: document.getElementById("sNote").value,
                };

                const current = await fetch("/api/admin/setting");

                const setting = await current.json();

                let response;

                if (setting?.id) {
                    response = await fetch(`/api/admin/setting/${setting.id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetch("/api/admin/setting", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                }

                if (!response.ok) {
                    alert("Gagal menyimpan pengaturan");
                    return;
                }

                alert("Pengaturan berhasil disimpan");

                await loadData();
            });
        }
    }
    async function initUsersLaravel() {
        const tbody = document.getElementById("adminUsersTbody");

        if (!tbody) return;

        async function loadData() {
            try {
                const response = await fetch("/api/admin/users");

                const users = await response.json();

                document.getElementById("adminUsersEmpty").style.display =
                    users.length ? "none" : "block";

                tbody.innerHTML = users
                    .map(
                        (user) => `

                <tr>

                    <td>${user.name}</td>

                    <td>${user.email}</td>

                    <td>
                        <span class="badge">
                            ${user.role}
                        </span>
                    </td>

                    <td>
                        ${user.status ?? "aktif"}
                    </td>

                    <td>
                        ${user.telp ?? "-"}
                    </td>

                    <td>
                        ${user.rt ?? "-"}
                        /
                        ${user.rw ?? "-"}
                    </td>

                    <td>
                        ${
                            user.created_at
                                ? new Date(user.created_at).toLocaleDateString(
                                      "id-ID",
                                  )
                                : "-"
                        }
                    </td>

                    <td>

                        <button
                            class="btn btn-warning btn-sm"
                            onclick="editUser(${user.id})">

                            Edit

                        </button>

                        <button
                            class="btn btn-danger btn-sm"
                            onclick="deleteUser(${user.id})">

                            Hapus

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

        await loadData();

        const form = document.getElementById("adminUserForm");

        if (form && !form.dataset.bound) {
            form.dataset.bound = true;

            form.addEventListener("submit", async function (e) {
                e.preventDefault();

                const id = document.getElementById("userId").value;

                const payload = {
                    name: document.getElementById("userName").value,

                    email: document.getElementById("userEmail").value,

                    role: document.getElementById("userRole").value,

                    status: document.getElementById("userStatus").value,
                };

                const csrf = document.querySelector(
                    'meta[name="csrf-token"]',
                )?.content;

                const response = await fetch(`/api/admin/users/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrf,
                        Accept: "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    alert("Gagal menyimpan user");
                    return;
                }

                document
                    .getElementById("adminUserModal")
                    ?.classList.remove("open");

                await loadData();
            });
        }

        window.editUser = async function (id) {
            const response = await fetch(`/api/admin/users/${id}`);
            const user = await response.json();

            document.getElementById("userId").value = user.id;
            document.getElementById("userName").value = user.name ?? "";
            document.getElementById("userEmail").value = user.email ?? "";
            document.getElementById("userRole").value = user.role ?? "warga";
            document.getElementById("userStatus").value = user.status ?? "aktif";

            document.getElementById("adminUserModal")?.classList.add("open");
        };

        window.deleteUser = async function (id) {
            if (!confirm("Hapus user ini?")) return;

            const csrf = document.querySelector(
                'meta[name="csrf-token"]',
            )?.content;

            const response = await fetch(`/api/admin/users/${id}`, {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": csrf,
                    Accept: "application/json",
                },
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message ?? "Gagal menghapus user");
                return;
            }

            await loadData();
        };

        document
            .querySelectorAll('[data-action="userClose"]')
            .forEach((btn) => {
                btn.onclick = () => {
                    document
                        .getElementById("adminUserModal")
                        ?.classList.remove("open");
                };
            });
    }
    window.addEventListener("page:loaded", (e) => {
        const name = e.detail?.name || "";
        const isAdminRoute = name.startsWith("admin/");
        setAdminMode(isAdminRoute);

        if (!isAdminRoute) {
            document.body.classList.remove("admin-menu-open");
            return;
        }

        if (!Guard.requireAdmin()) return;

        fillAdminUserLabel();
        setSidebarActive("#" + name);

        // ensure sidebar collapsible groups works on every admin page
        ensureSidebarCollapse();
        syncSidebarGroups("#" + name);

        // mobile drawer
        ensureAdminMobileMenu();
        mountAdminMenuButton();

        if (name === "admin/dashboard") initDashboard();
        if (name === "admin/berita") initBeritaLaravel();
        if (name === "admin/agenda") initAgendaLaravel();
        if (name === "admin/galeri") initGaleriLaravel();
        if (name === "admin/pengumuman") initPengumumanLaravel();
        if (name === "admin/pengaturan") initSettingsLaravel();
        if (name === "admin/profil-kelurahan") initProfilKelurahan();
        if (name === "admin/pengaduan") initPengaduanLaravel();
        if (name === "admin/surat") initSuratLaravel();
        if (name === "admin/rt-rw") initRtrwLaravel();
        if (name === "admin/faq") initFaqLaravel();
        if (name === "admin/lembaga") initLembagaLaravel();
        if (name === "admin/unit-kerja") initUnitKerjaLaravel();
        if (name === "admin/pelayanan") initPelayananLaravel();
        if (name === "admin/users") initUsersLaravel();
    });
})();
