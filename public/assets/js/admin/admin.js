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

    async function fetchAPI(url, options = {}) {
        const headers = {
            "Accept": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            ...options.headers,
        };
        const method = (options.method || "GET").toUpperCase();
        if (method !== "GET" && !headers["X-CSRF-TOKEN"]) {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
            if (csrf) {
                headers["X-CSRF-TOKEN"] = csrf;
            }
        }
        return fetch(url, {
            ...options,
            credentials: "include",
            headers,
        });
    }

    // --------------------
    // Dashboard
    // --------------------
    async function initDashboard() {
        try {
            const response = await fetchAPI("/api/admin/stats", {
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
            if (s === "siap_diambil") cls = "badge-done";
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
        const labelText = s === "siap_diambil" ? "Siap Diambil" : (status || "-");
        return `<span class="badge ${cls}">${labelText}</span>`;
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
    async function initProfilKelurahan() {
        const setVal = (id, v) => {
            const el = document.getElementById(id);
            if (el) el.value = v || "";
        };

        async function loadProfilData() {
            try {
                const res = await fetchAPI("/api/admin/setting", { credentials: 'same-origin', headers: { Accept: 'application/json' } });
                if (!res.ok) return;
                const data = await res.json();
                if (!data) return;

                setVal("pkSiteName", data.site_name);
                setVal("pkLurahName", data.lurah_name);
                setVal("pkKecamatan", data.kecamatan);
                setVal("pkKota", data.kota);
                setVal("pkProvinsi", data.provinsi);
                setVal("pkKodepos", data.kodepos);
                setVal("pkDeskripsi", data.profil);

                setVal("pkVisi", data.visi);
                setVal("pkMisi", data.misi);
                setVal("pkLuas", data.luas_wilayah);
                setVal("pkPenduduk", data.jumlah_penduduk);
                setVal("pkRT", data.jumlah_rt);
                setVal("pkRW", data.jumlah_rw);

                setVal("pkEmail", data.email);
                setVal("pkPhone", data.phone);
                setVal("pkAddress", data.address);
                setVal("pkInstagram", data.instagram);
                setVal("pkMaps", data.maps);
                setVal("pkJam", data.jam_pelayanan);

                // Sync local storage fallback
                if (window.KelurahanStore?.Data) {
                    window.KelurahanStore.Data.saveSettings({
                        siteName: data.site_name || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        address: data.address || "",
                        instagram: data.instagram || "",
                        note: data.profil || "",
                        lurahName: data.lurah_name || "",
                        kecamatan: data.kecamatan || "",
                        kota: data.kota || "",
                        provinsi: data.provinsi || "",
                        kodepos: data.kodepos || "",
                        profil: data.profil || "",
                        maps: data.maps || "",
                        jamPelayanan: data.jam_pelayanan || "",
                        visi: data.visi || "",
                        misi: data.misi || "",
                        luas_wilayah: data.luas_wilayah || "",
                        jumlah_penduduk: data.jumlah_penduduk || "",
                        jumlah_rt: data.jumlah_rt || "",
                        jumlah_rw: data.jumlah_rw || "",
                    });
                }
            } catch (err) {
                console.error("Gagal load profil kelurahan:", err);
            }
        }

        await loadProfilData();

        if (_profilBound) return;
        _profilBound = true;

        document.addEventListener("click", async (e) => {
            const save = e.target.closest("[data-action='saveProfil']");
            const reset = e.target.closest("[data-action='resetProfil']");

            if (reset) {
                await loadProfilData();
                return;
            }

            if (!save) return;

            const get = (id) => document.getElementById(id)?.value?.trim() || "";

            const payload = {
                site_name: get("pkSiteName"),
                lurah_name: get("pkLurahName"),
                kecamatan: get("pkKecamatan"),
                kota: get("pkKota"),
                provinsi: get("pkProvinsi"),
                kodepos: get("pkKodepos"),
                profil: get("pkDeskripsi"),
                visi: get("pkVisi"),
                misi: get("pkMisi"),
                luas_wilayah: get("pkLuas"),
                jumlah_penduduk: get("pkPenduduk"),
                jumlah_rt: get("pkRT"),
                jumlah_rw: get("pkRW"),
                email: get("pkEmail"),
                phone: get("pkPhone"),
                address: get("pkAddress"),
                instagram: get("pkInstagram"),
                maps: get("pkMaps"),
                jam_pelayanan: get("pkJam"),
            };

            try {
                const checkRes = await fetchAPI("/api/admin/setting", { credentials: 'same-origin', headers: { Accept: 'application/json' } });
                const currentSetting = await checkRes.json().catch(() => null);

                const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
                let response;

                if (currentSetting?.id) {
                    response = await fetchAPI(`/api/admin/setting/${currentSetting.id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": csrf,
                            Accept: "application/json",
                        },
                        credentials: 'same-origin',
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetchAPI("/api/admin/setting", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": csrf,
                            Accept: "application/json",
                        },
                        credentials: 'same-origin',
                        body: JSON.stringify(payload),
                    });
                }

                if (!response.ok) {
                    throw new Error("Gagal menyimpan ke server");
                }

                alert("Profil kelurahan berhasil disimpan.");
                await loadProfilData();
                window.dispatchEvent(new CustomEvent("settings:changed"));
            } catch (err) {
                alert("Gagal menyimpan profil: " + err.message);
            }
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
            const response = await fetchAPI("/api/admin/laporan");

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
                const response = await fetchAPI("/api/admin/berita", {
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
        if (createBtn && !createBtn.dataset.bound) {
            createBtn.dataset.bound = "true";
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

        const fileInput = document.getElementById("fImage");
        if (fileInput && !fileInput.dataset.bound) {
            fileInput.dataset.bound = "true";
            fileInput.addEventListener("change", async (e) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        const base64 = await fileToDataURL(file);
                        document.getElementById("fImageExisting").value = base64;
                        setImagePreview(base64);
                    } catch (err) {
                        console.error(err);
                        alert("Gagal membaca file");
                    }
                }
            });
        }

        const form = document.getElementById("adminForm");
        if (form && !form.dataset.bound) {
            form.dataset.bound = "true";
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
                    response = await fetchAPI(`/api/admin/berita/${id}`, {
                        method: "PUT",
                        credentials: "same-origin",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": csrf,
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetchAPI("/api/admin/berita", {
                        method: "POST",
                        credentials: "same-origin",
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
                const response = await fetchAPI("/api/admin/agenda");
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
                    response = await fetchAPI(`/api/admin/agenda/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": csrf,
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetchAPI("/api/admin/agenda", {
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
                const response = await fetchAPI("/api/admin/pengumuman");
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
                    response = await fetchAPI(`/api/admin/pengumuman/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": csrf,
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetchAPI("/api/admin/pengumuman", {
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
                const response = await fetchAPI("/api/admin/galeri");

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
                setImagePreview("");

                openModal("galeri");
            });
        }

        const fileInput = document.getElementById("fImage");
        if (fileInput) {
            fileInput.addEventListener("change", async (e) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        const base64 = await fileToDataURL(file);
                        document.getElementById("fImageExisting").value = base64;
                        setImagePreview(base64);
                    } catch (err) {
                        console.error(err);
                        alert("Gagal membaca file");
                    }
                }
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
                    image: document.getElementById("fImageExisting")?.value || "",
                    content: document.getElementById("fContent").value,
                };

                try {
                    let response;

                    if (id) {
                        console.log(payload);
                        response = await fetchAPI(`/api/admin/galeri/${id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "application/json",
                            },
                            body: JSON.stringify(payload),
                        });
                    } else {
                        response = await fetchAPI("/api/admin/galeri", {
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
                const response = await fetchAPI(`/api/admin/galeri/${id}`);

                const item = await response.json();

                document.getElementById("itemId").value = item.id;

                document.getElementById("fTitle").value = item.title ?? "";

                document.getElementById("fCategory").value =
                    item.category ?? "";

                document.getElementById("fDate").value = item.date ?? "";

                document.getElementById("fContent").value = item.content ?? "";

                const existing = document.getElementById("fImageExisting");
                if (existing) existing.value = item.image || "";
                setImagePreview(item.image || "");

                openModal("galeri", item);
            } catch (error) {
                console.error(error);
            }
        };

        window.deleteGaleri = async function (id) {
            if (!confirm("Hapus galeri ini?")) return;

            try {
                const response = await fetchAPI(`/api/admin/galeri/${id}`, {
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
                const response = await fetchAPI("/api/admin/pengaduan", {
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
                        const response = await fetchAPI(`/api/admin/pengaduan/${id}`, {
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
                        const res = await fetchAPI(`/api/admin/pengaduan/${id}`, {
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
                        const res = await fetchAPI(`/api/admin/pengaduan/${id}`, {
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

    // ─────────────────────────────────────────────────────────────
    // STRUKTUR ORGANISASI
    // ─────────────────────────────────────────────────────────────
    async function initStrukturOrganisasi() {
        const SO_API = '/api/admin/struktur-organisasi';
        let soItems = [];
        let soEditId = null;

        const grid    = document.getElementById('soGrid');
        const empty   = document.getElementById('soEmpty');
        const search  = document.getElementById('soSearch');
        const modal   = document.getElementById('soModal');
        const form    = document.getElementById('soForm');

        if (!grid) return;   // guard: page not mounted

        async function soLoad() {
            try {
                const res = await fetchAPI(SO_API, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const data = await res.json();
                soItems = Array.isArray(data) ? data : (data?.data ?? []);
                soRender();
            } catch (e) {
                console.error('Gagal memuat struktur:', e);
                soItems = [];
                soRender();
            }
        }

        function soRender() {
            const q = (search?.value || '').toLowerCase();
            const filtered = q ? soItems.filter(i => (i.nama + ' ' + i.jabatan).toLowerCase().includes(q)) : soItems;

            if (!filtered.length) {
                grid.innerHTML = '';
                if (empty) empty.style.display = 'block';
                return;
            }
            if (empty) empty.style.display = 'none';

            grid.innerHTML = filtered.map(it => {
                const fotoEl = it.foto
                    ? `<img src="/storage/${it.foto}" alt="${it.nama}" />`
                    : `<i class="fa-solid fa-user so-avatar-icon"></i>`;
                const parentEl = it.parent_jabatan
                    ? `<div class="so-parent">Bawahan dari: ${it.parent_jabatan}</div>`
                    : `<div class="so-parent" style="color:var(--primary);font-weight:800">— Kepala —</div>`;
                return `
                <div class="so-card">
                    <span class="so-urutan-badge">#${it.urutan}</span>
                    <div class="so-photo">${fotoEl}</div>
                    <div class="so-nama">${it.nama}</div>
                    <div class="so-jabatan">${it.jabatan}</div>
                    ${parentEl}
                    <div class="so-actions">
                        <button class="btn btn-ghost btn-sm" data-so-edit="${it.id}"><i class="fa-solid fa-pen"></i> Edit</button>
                        <button class="btn btn-danger btn-sm" data-so-del="${it.id}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>`;
            }).join('');
        }

        function soOpenModal(item = null) {
            soEditId = item ? item.id : null;
            document.getElementById('soModalTitle').textContent = item ? 'Edit Anggota' : 'Tambah Anggota';
            document.getElementById('soId').value    = item?.id || '';
            document.getElementById('soNama').value  = item?.nama || '';
            document.getElementById('soJabatan').value = item?.jabatan || '';
            document.getElementById('soParent').value  = item?.parent_jabatan || '';
            document.getElementById('soUrutan').value  = item?.urutan ?? 0;
            document.getElementById('soFoto').value = '';
            const preview = document.getElementById('soPhotoPreview');
            const icon    = document.getElementById('soPhotoIcon');
            if (item?.foto) {
                preview.src = '/storage/' + item.foto;
                preview.style.display = 'block';
                icon.style.display = 'none';
            } else {
                preview.style.display = 'none';
                icon.style.display = 'block';
            }
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
        }

        function soCloseModal() {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            soEditId = null;
        }

        // Photo preview
        document.getElementById('soFoto')?.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                const preview = document.getElementById('soPhotoPreview');
                const icon    = document.getElementById('soPhotoIcon');
                if (preview) { preview.src = ev.target.result; preview.style.display = 'block'; }
                if (icon) icon.style.display = 'none';
            };
            reader.readAsDataURL(file);
        });

        // Form submit
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('soBtnSimpan');
            if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...'; }

            const fd = new FormData();
            fd.append('nama',           document.getElementById('soNama')?.value.trim() || '');
            fd.append('jabatan',        document.getElementById('soJabatan')?.value.trim() || '');
            fd.append('parent_jabatan', document.getElementById('soParent')?.value.trim() || '');
            fd.append('urutan',         document.getElementById('soUrutan')?.value || 0);
            const fotoFile = document.getElementById('soFoto')?.files?.[0];
            if (fotoFile) fd.append('foto', fotoFile);
            if (soEditId) fd.append('_method', 'PUT');

            const url = soEditId ? `${SO_API}/${soEditId}` : SO_API;
            try {
                const res = await fetchAPI(url, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content, Accept: 'application/json' },
                    body: fd,
                });
                if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err.message || 'Gagal'); }
                soCloseModal();
                await soLoad();
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan'; }
            }
        });

        // Clicks: Tambah, Close, Edit, Delete
        document.getElementById('soBtnTambah')?.addEventListener('click', () => soOpenModal());
        document.getElementById('soBtnClose')?.addEventListener('click',  soCloseModal);
        document.getElementById('soBtnBatal')?.addEventListener('click',  soCloseModal);
        modal?.addEventListener('click', (e) => { if (e.target === modal) soCloseModal(); });

        // Delegated: edit / delete buttons inside cards
        grid.addEventListener('click', async (e) => {
            const editBtn = e.target.closest('[data-so-edit]');
            if (editBtn) {
                const id = Number(editBtn.dataset.soEdit);
                soOpenModal(soItems.find(i => i.id === id));
                return;
            }
            const delBtn = e.target.closest('[data-so-del]');
            if (delBtn) {
                const id   = Number(delBtn.dataset.soDel);
                const item = soItems.find(i => i.id === id);
                if (!item || !confirm(`Hapus "${item.nama}"?`)) return;
                try {
                    const res = await fetchAPI(`${SO_API}/${id}`, {
                        method: 'DELETE',
                        credentials: 'same-origin',
                        headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content, Accept: 'application/json' },
                    });
                    if (!res.ok) throw new Error('Gagal menghapus');
                    await soLoad();
                } catch (err) { alert(err.message); }
            }
        });

        search?.addEventListener('input', soRender);

        await soLoad();
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
                const isTrashed = f?.value === 'trashed';
                const url = isTrashed ? "/api/admin/surat?trashed=true" : "/api/admin/surat";
                const response = await fetchAPI(url, {
                    credentials: "same-origin",
                    headers: {
                        Accept: "application/json",
                    },
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                items = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
                render();
            } catch (error) {
                console.error("Gagal memuat surat", error);
                items = [];
                render();
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
            if (status && status !== 'trashed') {
                filtered = filtered.filter(
                    (it) => (it.status || "").toLowerCase() == status,
                );
            }

            tbody.innerHTML = filtered
                .map(
                    (it) => {
                        const isTrashed = f?.value === 'trashed';
                        const actionButtons = isTrashed ? `
                            <button class="btn btn-warning btn-sm" data-action="suratRestoreLaravel" data-id="${it.id}"><i class="fa-solid fa-trash-arrow-up"></i> Pulihkan</button>
                            <button class="btn btn-danger btn-sm" data-action="suratForceDeleteLaravel" data-id="${it.id}"><i class="fa-regular fa-trash-can"></i> Hapus Permanen</button>
                        ` : `
                            <button class="btn btn-ghost" data-action="suratDetailLaravel" data-id="${it.id}"><i class="fa-regular fa-eye"></i> Detail</button>
                            <button class="btn btn-ghost" data-action="suratDeleteLaravel" data-id="${it.id}"><i class="fa-regular fa-trash-can"></i> Hapus</button>
                        `;

                        return `
                            <tr>
                                <td>${it.jenis_surat || "-"}</td>
                                <td>${it.user?.name || "-"}</td>
                                <td>${_fmtDate(it.created_at || it.tanggal)}</td>
                                <td>${_badge(it.status, "surat")}</td>
                                <td>
                                    <div class="row-actions">
                                        ${actionButtons}
                                    </div>
                                </td>
                            </tr>
                        `;
                    }
                )
                .join("");

            if (empty) empty.style.display = filtered.length ? "none" : "block";
        }

        await loadData();

        q?.addEventListener("input", render);
        f?.addEventListener("change", loadData);

        if (!window._suratLaravelBound) {
            window._suratLaravelBound = true;

            document.addEventListener("click", async (e) => {
                const detail = e.target.closest("[data-action='suratDetailLaravel']");
                const del = e.target.closest("[data-action='suratDeleteLaravel']");
                const restore = e.target.closest("[data-action='suratRestoreLaravel']");
                const force = e.target.closest("[data-action='suratForceDeleteLaravel']");
                const close = e.target.closest("[data-action='closeSuratModal']");
                const save = e.target.closest("[data-action='saveSuratStatus']");

                if (close) {
                    _closeModal("adminSuratModal");
                    return;
                }

                if (restore) {
                    const id = restore.dataset.id;
                    if (!confirm("Pulihkan pengajuan surat ini?")) return;
                    try {
                        const response = await fetchAPI(`/api/admin/surat/${id}/restore`, {
                            method: "POST",
                            headers: {
                                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
                                Accept: "application/json",
                            },
                        });
                        if (response.ok) {
                            alert("Pengajuan surat berhasil dipulihkan");
                            loadData();
                        } else {
                            alert("Gagal memulihkan pengajuan surat");
                        }
                    } catch (error) {
                        console.error(error);
                        alert("Gagal memulihkan pengajuan surat");
                    }
                    return;
                }

                if (force) {
                    const id = force.dataset.id;
                    if (!confirm("Hapus pengajuan surat ini secara PERMANEN beserta seluruh berkasnya? Tindakan ini tidak dapat dibatalkan!")) return;
                    try {
                        const response = await fetchAPI(`/api/admin/surat/${id}/force`, {
                            method: "DELETE",
                            headers: {
                                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
                                Accept: "application/json",
                            },
                        });
                        if (response.ok) {
                            alert("Pengajuan surat berhasil dihapus secara permanen");
                            loadData();
                        } else {
                            alert("Gagal menghapus permanen");
                        }
                    } catch (error) {
                        console.error(error);
                        alert("Gagal menghapus permanen");
                    }
                    return;
                }

                if (del) {
                    const id = del.dataset.id;
                    if (!confirm("Hapus pengajuan surat ini (Soft Delete)? Staf/warga tidak akan melihat surat ini, namun Admin dapat memulihkannya kembali."));
                    try {
                        const response = await fetchAPI(`/api/admin/surat/${id}`, {
                            method: "DELETE",
                            headers: {
                                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
                                Accept: "application/json",
                            },
                        });
                        if (response.ok) {
                            alert("Pengajuan surat berhasil dipindahkan ke tempat sampah");
                            loadData();
                        } else {
                            alert("Gagal memindahkan ke tempat sampah");
                        }
                    } catch (error) {
                        console.error(error);
                        alert("Gagal memindahkan ke tempat sampah");
                    }
                    return;
                }

                if (detail) {
                    const id = detail.dataset.id;
                    try {
                        const res = await fetchAPI(`/api/admin/surat/${id}`, {
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
                        document.getElementById("asCatatan").value = it.catatan_staf ?? it.catatanAdmin ?? "";

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
                    const catatan = document.getElementById("asCatatan").value?.trim() || "";

                    try {
                        const res = await fetchAPI(`/api/admin/surat/${id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
                                Accept: "application/json",
                            },
                            body: JSON.stringify({ status, catatan })
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
            const response = await fetchAPI("/api/admin/setting");

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

                const current = await fetchAPI("/api/admin/setting");

                const setting = await current.json();

                let response;

                if (setting?.id) {
                    response = await fetchAPI(`/api/admin/setting/${setting.id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetchAPI("/api/admin/setting", {
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
        // --- GLOBAL CLOSE MODAL ---
        const btnCloseModal = e.target.closest("[data-action='closeModal']");
        if (btnCloseModal) {
            closeModal();
            return;
        }

        // --- BERITA ---
        const btnDeleteBerita = e.target.closest("[data-action='deleteBerita']");
        if (btnDeleteBerita) {
            const id = btnDeleteBerita.dataset.id;
            if (!confirm("Hapus berita ini?")) return;
            try {
                await fetchAPI(`/api/admin/berita/${id}`, {
                    method: "DELETE",
                    credentials: "same-origin",
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
                const response = await fetchAPI(`/api/admin/berita/${id}`, {
                    credentials: "same-origin",
                    headers: {
                        Accept: "application/json",
                    }
                });
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
                await fetchAPI(`/api/admin/agenda/${id}`, {
                    method: "DELETE",
                    credentials: "same-origin",
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
                const response = await fetchAPI(`/api/admin/agenda/${id}`, {
                    credentials: "same-origin",
                    headers: {
                        Accept: "application/json",
                    }
                });
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
                await fetchAPI(`/api/admin/pengumuman/${id}`, {
                    method: "DELETE",
                    credentials: "same-origin",
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
                const response = await fetchAPI(`/api/admin/pengumuman/${id}`, {
                    credentials: "same-origin",
                    headers: {
                        Accept: "application/json",
                    }
                });
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
            const response = await fetchAPI("/api/admin/rtrw");
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
                    response = await fetchAPI(`/api/admin/rtrw/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetchAPI("/api/admin/rtrw", {
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
            const response = await fetchAPI(`/api/admin/rtrw/${id}`);

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

            await fetchAPI(`/api/admin/rtrw/${id}`, {
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
            const response = await fetchAPI("/api/admin/faq");
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
                    response = await fetchAPI(`/api/admin/faq/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetchAPI("/api/admin/faq", {
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
            const response = await fetchAPI(`/api/admin/faq/${id}`);

            const item = await response.json();

            document.getElementById("faqId").value = item.id;

            document.getElementById("faqQ").value = item.question ?? "";

            document.getElementById("faqA").value = item.answer ?? "";

            document.getElementById("faqCat").value = item.category ?? "";

            document.getElementById("adminFaqModal")?.classList.add("open");
        };

        window.deleteFaq = async (id) => {
            if (!confirm("Hapus FAQ ini?")) return;

            await fetchAPI(`/api/admin/faq/${id}`, {
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
                const response = await fetchAPI("/api/admin/lembaga");
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
                    response = await fetchAPI(`/api/admin/lembaga/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetchAPI("/api/admin/lembaga", {
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
            const response = await fetchAPI(`/api/admin/lembaga/${id}`);
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

            await fetchAPI(`/api/admin/lembaga/${id}`, {
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

        function toDateTime(iso) {
            const d = iso ? new Date(iso) : null;
            if (!d || isNaN(d.getTime())) return "-";
            return d.toLocaleString("id-ID", {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            });
        }

        async function loadData() {
            const response = await fetchAPI("/api/admin/unit-kerja");
            const data = await response.json();
            tbody.innerHTML = data
                .map(
                    (item) => `
            <tr>
                <td>
                    <div style="font-weight:bold">${item.nama_unit ?? "-"}</div>
                    <div class="muted" style="font-size:12px">${item.jenis ?? ""}</div>
                </td>
                <td>
                    <div style="display:flex;align-items:center;gap:10px">
                        <img src="${item.foto_pimpinan ? '/storage/' + item.foto_pimpinan : 'assets/images/avatar-placeholder.svg'}" style="width:30px;height:30px;border-radius:50%;object-fit:cover" />
                        <div>
                            <div style="font-weight:bold">${item.nama_pimpinan ?? "-"}</div>
                            <div class="muted" style="font-size:11px">${item.jabatan_pimpinan ?? "-"}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div>${item.kontak ?? "-"}</div>
                    <div class="muted" style="font-size:12px">${item.email ?? ""}</div>
                </td>
                <td>${toDateTime(item.updated_at)}</td>
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

        function addStaffRow(staff = {}) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><input type="text" class="input staff-nama" value="${staff.nama ?? ""}" placeholder="Nama..." required /></td>
                <td><input type="text" class="input staff-jabatan" value="${staff.jabatan ?? ""}" placeholder="Jabatan..." required /></td>
                <td><input type="text" class="input staff-nip" value="${staff.nip ?? ""}" placeholder="NIP..." /></td>
                <td class="text-right">
                    <button type="button" class="btn btn-danger btn-sm remove-staff-row"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            tr.querySelector(".remove-staff-row").onclick = () => tr.remove();
            document.getElementById("ukTimTbody").appendChild(tr);
        }

        function resetForm() {
            if (form) form.reset();
            document.getElementById("ukId").value = "";
            document.getElementById("ukFotoPreview").src = "assets/images/avatar-placeholder.svg";
            document.getElementById("ukTimTbody").innerHTML = "";
        }

        // Preview uploaded image
        document.getElementById("ukFotoPimpinan")?.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    document.getElementById("ukFotoPreview").src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById("ukAddStaffBtn")?.addEventListener("click", () => {
            addStaffRow();
        });

        await loadData();

        document.getElementById("ukAddBtn")?.addEventListener("click", () => {
            resetForm();
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
                const formData = new FormData();

                formData.append("jenis", document.getElementById("ukJenis").value);
                formData.append("nama_unit", document.getElementById("ukNamaUnit").value);
                formData.append("nama_pimpinan", document.getElementById("ukNamaPimpinan").value);
                formData.append("jabatan_pimpinan", document.getElementById("ukJabatanPimpinan").value);
                formData.append("nip_pimpinan", document.getElementById("ukNipPimpinan").value);
                formData.append("pendidikan_pimpinan", document.getElementById("ukPendidikanPimpinan").value);
                formData.append("kontak", document.getElementById("ukKontak").value);
                formData.append("email", document.getElementById("ukEmail").value);
                formData.append("alamat", document.getElementById("ukAlamat").value);
                formData.append("riwayat_jabatan", document.getElementById("ukRiwayatJabatan").value);
                formData.append("tugas", document.getElementById("ukTugas").value);
                formData.append("kewenangan", document.getElementById("ukKewenangan").value);

                // Collect dynamic staff rows
                const staff = [];
                document.querySelectorAll("#ukTimTbody tr").forEach((tr) => {
                    const nama = tr.querySelector(".staff-nama")?.value.trim();
                    const jabatan = tr.querySelector(".staff-jabatan")?.value.trim();
                    const nip = tr.querySelector(".staff-nip")?.value.trim();
                    if (nama || jabatan) {
                        staff.push({ nama, jabatan, nip });
                    }
                });
                formData.append("tim_pegawai", JSON.stringify(staff));

                const photoFile = document.getElementById("ukFotoPimpinan").files[0];
                if (photoFile) {
                    formData.append("foto_pimpinan", photoFile);
                }

                let url = "/api/admin/unit-kerja";
                if (id) {
                    url = `/api/admin/unit-kerja/${id}`;
                    formData.append("_method", "PUT"); // Laravel method spoofing
                }

                const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
                const response = await fetchAPI(url, {
                    method: "POST", // Always POST for FormData upload with spoofing
                    headers: {
                        "X-CSRF-TOKEN": csrf,
                        Accept: "application/json",
                    },
                    body: formData,
                });

                if (!response.ok) {
                    alert("Gagal menyimpan Unit Kerja");
                    return;
                }

                resetForm();
                formCard.hidden = true;
                await loadData();
            });
        }

        window.editUnitKerja = async function (id) {
            const response = await fetchAPI(`/api/admin/unit-kerja/${id}`);
            const item = await response.json();

            resetForm();

            document.getElementById("ukId").value = item.id;
            document.getElementById("ukJenis").value = item.jenis ?? "";
            document.getElementById("ukNamaUnit").value = item.nama_unit ?? "";
            document.getElementById("ukNamaPimpinan").value = item.nama_pimpinan ?? "";
            document.getElementById("ukJabatanPimpinan").value = item.jabatan_pimpinan ?? "";
            document.getElementById("ukNipPimpinan").value = item.nip_pimpinan ?? "";
            document.getElementById("ukPendidikanPimpinan").value = item.pendidikan_pimpinan ?? "";
            document.getElementById("ukKontak").value = item.kontak ?? "";
            document.getElementById("ukEmail").value = item.email ?? "";
            document.getElementById("ukAlamat").value = item.alamat ?? "";
            document.getElementById("ukRiwayatJabatan").value = item.riwayat_jabatan ?? "";
            document.getElementById("ukTugas").value = item.tugas ?? "";
            document.getElementById("ukKewenangan").value = item.kewenangan ?? "";

            if (item.foto_pimpinan) {
                document.getElementById("ukFotoPreview").src = `/storage/${item.foto_pimpinan}`;
            } else {
                document.getElementById("ukFotoPreview").src = "assets/images/avatar-placeholder.svg";
            }

            // Populate staff table
            const staffList = Array.isArray(item.tim_pegawai) ? item.tim_pegawai : [];
            staffList.forEach(st => addStaffRow(st));

            formCard.hidden = false;
            formCard.scrollIntoView({ behavior: "smooth", block: "start" });
        };

        window.deleteUnitKerja = async function (id) {
            if (!confirm("Hapus Unit Kerja ini?")) return;

            const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
            await fetchAPI(`/api/admin/unit-kerja/${id}`, {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": csrf,
                    Accept: "application/json",
                }
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

        let draftSyarat = [];
        let draftSteps = [];
        let draftFields = [];

        function renderSyarat() {
            const container = document.getElementById("fSrvSyaratList");
            if (!container) return;
            container.innerHTML = draftSyarat.map((item, idx) => `
                <div class="array-row" style="display:flex;gap:8px;margin-bottom:8px">
                    <input class="input syarat-input" value="${item ?? ""}" placeholder="Tulis persyaratan..." required>
                    <button type="button" class="btn btn-danger btn-sm" onclick="removeSyarat(${idx})">Hapus</button>
                </div>
            `).join("") || '<div class="muted" style="padding: 10px 0;">Belum ada persyaratan.</div>';
        }

        window.removeSyarat = (idx) => {
            syncDrafts();
            draftSyarat.splice(idx, 1);
            renderSyarat();
        };

        function renderSteps() {
            const container = document.getElementById("fSrvStepList");
            if (!container) return;
            container.innerHTML = draftSteps.map((item, idx) => `
                <div class="array-row" style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px;border:1px solid var(--border);padding:12px;border-radius:10px;background:#f8fafc;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <strong>Langkah ${idx + 1}</strong>
                        <button type="button" class="btn btn-danger btn-sm" onclick="removeStep(${idx})">Hapus</button>
                    </div>
                    <input class="input step-judul" value="${item.judul ?? ""}" placeholder="Judul langkah (contoh: Isi Form Online)..." required>
                    <textarea class="input step-desc" rows="2" placeholder="Deskripsi detail langkah..." required>${item.deskripsi ?? ""}</textarea>
                </div>
            `).join("") || '<div class="muted" style="padding: 10px 0;">Belum ada tahapan proses.</div>';
        }

        window.removeStep = (idx) => {
            syncDrafts();
            draftSteps.splice(idx, 1);
            renderSteps();
        };

        function renderFields() {
            const container = document.getElementById("fSrvFormList");
            if (!container) return;
            const typeOptions = [
                ["text", "Text Box (Teks Satu Baris)"],
                ["textarea", "Text Area (Teks Multi Baris)"],
                ["select", "Dropdown (Pilihan)"],
                ["date", "Date Picker (Tanggal)"],
                ["checkbox", "Checkbox (Centang)"],
                ["radio", "Radio Button (Pilihan Tunggal)"],
                ["number", "Number Input (Angka)"],
                ["file", "File Upload (Unggah File)"],
            ];
            container.innerHTML = draftFields.map((item, idx) => {
                const optionsStr = Array.isArray(item.options) ? item.options.join(", ") : (item.options || "");
                const typeOpts = typeOptions.map(([val, label]) => `
                    <option value="${val}" ${item.type === val ? "selected" : ""}>${label}</option>
                `).join("");
                return `
                <div class="array-row" style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px;border:1px solid var(--border);padding:12px;border-radius:10px;background:#f8fafc;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <strong>Field Input Dinamis ${idx + 1}</strong>
                        <button type="button" class="btn btn-danger btn-sm" onclick="removeField(${idx})">Hapus</button>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                        <div>
                            <label style="font-size:11px;font-weight:bold;margin-bottom:4px;display:block;">Label Field</label>
                            <input class="input field-label" value="${item.label ?? ""}" placeholder="Contoh: Nama Usaha" required>
                        </div>
                        <div>
                            <label style="font-size:11px;font-weight:bold;margin-bottom:4px;display:block;">Tipe Field</label>
                            <select class="input field-type">${typeOpts}</select>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 100px;gap:10px;align-items:center;margin-top:6px;">
                        <div>
                            <label style="font-size:11px;font-weight:bold;margin-bottom:4px;display:block;">Pilihan Opsi (pisahkan dengan koma)</label>
                            <input class="input field-options" value="${optionsStr}" placeholder="Pilihan 1, Pilihan 2 (khusus Dropdown/Radio)">
                        </div>
                        <label style="display:flex;align-items:center;gap:6px;margin-top:18px;font-weight:bold;cursor:pointer;">
                            <input type="checkbox" class="field-required" ${item.required ? "checked" : ""}> Wajib Diisi
                        </label>
                    </div>
                </div>
                `;
            }).join("") || '<div class="muted" style="padding: 10px 0;">Belum ada field tambahan.</div>';
        }

        window.removeField = (idx) => {
            syncDrafts();
            draftFields.splice(idx, 1);
            renderFields();
        };

        function syncDrafts() {
            // Syarat
            const syaratContainer = document.getElementById("fSrvSyaratList");
            if (syaratContainer) {
                draftSyarat = [...syaratContainer.querySelectorAll(".syarat-input")].map(el => el.value.trim());
            }
            // Langkah
            const stepContainer = document.getElementById("fSrvStepList");
            if (stepContainer) {
                draftSteps = [...stepContainer.querySelectorAll(".array-row")].map(row => {
                    return {
                        judul: row.querySelector(".step-judul")?.value.trim() || "",
                        deskripsi: row.querySelector(".step-desc")?.value.trim() || "",
                    };
                });
            }
            // Fields
            const fieldsContainer = document.getElementById("fSrvFormList");
            if (fieldsContainer) {
                draftFields = [...fieldsContainer.querySelectorAll(".array-row")].map(row => {
                    const label = row.querySelector(".field-label")?.value.trim() || "";
                    const type = row.querySelector(".field-type")?.value || "text";
                    const optionsRaw = row.querySelector(".field-options")?.value || "";
                    const options = optionsRaw.split(",").map(s => s.trim()).filter(Boolean);
                    const required = !!row.querySelector(".field-required")?.checked;
                    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "") || "field_" + Math.random().toString(36).slice(2, 6);
                    return { key, label, type, required, options };
                });
            }
        }

        async function loadData() {
            try {
                const response = await fetchAPI("/api/admin/pelayanan");
                const data = await response.json();
                tbody.innerHTML = data
                    .map(
                        (item) => `
                    <tr>
                        <td><b>${item.nama ?? "-"}</b></td>
                        <td><code>${item.slug ?? "-"}</code></td>
                        <td>
                            <span class="badge ${item.online ? "badge-done" : "badge-wait"}">
                                ${item.online ? "Online" : "Offline"}
                            </span>
                        </td>
                        <td>
                            <span class="badge ${item.status === 'aktif' ? 'badge-done' : 'badge-wait'}" style="cursor: pointer" onclick="togglePelayananStatus(${item.id}, '${item.status}')">
                                ${item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                            </span>
                        </td>
                        <td class="text-right">
                            <button
                                type="button"
                                class="btn btn-warning btn-sm"
                                onclick="editPelayanan(${item.id})">
                                Edit
                            </button>
                            <button
                                type="button"
                                class="btn btn-danger btn-sm"
                                onclick="deletePelayanan(${item.id})">
                                Hapus
                            </button>
                        </td>
                    </tr>
                `,
                    )
                    .join("") || `<tr><td colspan="5" class="muted" style="text-align:center;padding:24px;">Belum ada pelayanan dikonfigurasi.</td></tr>`;
            } catch (error) {
                console.error("Pelayanan Load Error:", error);
            }
        }

        // VISUAL WORD EDITOR INITIALIZATION
        const editorCanvas = document.getElementById("fSrvTemplateEditor");
        const varDropdownMenu = document.getElementById("varDropdownMenu");
        const btnInsertVar = document.getElementById("btnInsertVar");

        // 1. Setup formatting commands
        document.querySelectorAll(".word-editor-toolbar .toolbar-btn").forEach(btn => {
            btn.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                const cmd = this.dataset.cmd;
                document.execCommand(cmd, false, null);
                editorCanvas.focus();
            });
        });

        // 2. Formatting dropdown listeners
        document.getElementById("editorStyle")?.addEventListener("change", function(e) {
            document.execCommand("formatBlock", false, this.value);
            editorCanvas.focus();
        });

        document.getElementById("editorFont")?.addEventListener("change", function(e) {
            document.execCommand("fontName", false, this.value);
            editorCanvas.focus();
        });

        document.getElementById("editorSize")?.addEventListener("change", function(e) {
            document.execCommand("fontSize", false, this.value);
            editorCanvas.focus();
        });

        // 3. Toggle variables dropdown
        btnInsertVar?.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            const isVisible = varDropdownMenu.style.display === "block";
            varDropdownMenu.style.display = isVisible ? "none" : "block";
        });

        document.addEventListener("click", function() {
            if (varDropdownMenu) {
                varDropdownMenu.style.display = "none";
            }
        });

        // 4. Cursor/selection visual placeholder insertion
        function insertPlaceholderAtCursor(placeholder) {
            editorCanvas.focus();
            const sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                let range = sel.getRangeAt(0);
                
                // Ensure selection range falls inside the editor canvas
                let node = range.commonAncestorContainer;
                let isInside = false;
                while (node) {
                    if (node === editorCanvas) {
                        isInside = true;
                        break;
                    }
                    node = node.parentNode;
                }
                
                if (!isInside) {
                    // Force caret at the end of the canvas
                    range = document.createRange();
                    range.selectNodeContents(editorCanvas);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
                
                range.deleteContents();
                const textNode = document.createTextNode(placeholder);
                range.insertNode(textNode);
                
                // Set caret after the inserted tag
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                sel.removeAllRanges();
                sel.addRange(range);
            } else {
                editorCanvas.innerHTML += placeholder;
            }
        }

        // 5. Build dynamic variables dropdown
        function updateVariableDropdown() {
            if (!varDropdownMenu) return;
            let html = `
                <div class="dropdown-header">Profil Warga (Pemohon)</div>
                <a class="dropdown-item btn-insert-var-item" href="#" data-var="nama">Nama Lengkap ({{nama}})</a>
                <a class="dropdown-item btn-insert-var-item" href="#" data-var="nik">NIK ({{nik}})</a>
                <a class="dropdown-item btn-insert-var-item" href="#" data-var="no_kk">Nomor KK ({{no_kk}})</a>
                <a class="dropdown-item btn-insert-var-item" href="#" data-var="tempat_lahir">Tempat Lahir ({{tempat_lahir}})</a>
                <a class="dropdown-item btn-insert-var-item" href="#" data-var="tgl_lahir">Tanggal Lahir ({{tgl_lahir}})</a>
                <a class="dropdown-item btn-insert-var-item" href="#" data-var="jenis_kelamin">Jenis Kelamin ({{jenis_kelamin}})</a>
                <a class="dropdown-item btn-insert-var-item" href="#" data-var="agama">Agama ({{agama}})</a>
                <a class="dropdown-item btn-insert-var-item" href="#" data-var="status_nikah">Status Pernikahan ({{status_nikah}})</a>
                <a class="dropdown-item btn-insert-var-item" href="#" data-var="pekerjaan">Pekerjaan ({{pekerjaan}})</a>
                <a class="dropdown-item btn-insert-var-item" href="#" data-var="alamat">Alamat Lengkap ({{alamat}})</a>
                <a class="dropdown-item btn-insert-var-item" href="#" data-var="rt">RT ({{rt}})</a>
                <a class="dropdown-item btn-insert-var-item" href="#" data-var="rw">RW ({{rw}})</a>
                <a class="dropdown-item btn-insert-var-item" href="#" data-var="telp">No. Telepon ({{telp}})</a>
                
                <div class="dropdown-header">Sistem & Pejabat</div>
                <a class="dropdown-item btn-insert-var-item" href="#" data-var="nomor_surat">Nomor Surat ({{nomor_surat}})</a>
                <a class="dropdown-item btn-insert-var-item" href="#" data-var="tanggal">Tanggal Hari Ini ({{tanggal}})</a>
                <a class="dropdown-item btn-insert-var-item" href="#" data-var="lurah_name">Nama Lurah ({{lurah_name}})</a>
                <a class="dropdown-item btn-insert-var-item" href="#" data-var="lurah_nip">NIP Lurah ({{lurah_nip}})</a>
            `;

            const validFields = draftFields.filter(f => f.label && f.key);
            if (validFields.length > 0) {
                html += `<div class="dropdown-header">Variabel Form Pengajuan</div>`;
                validFields.forEach(f => {
                    html += `<a class="dropdown-item btn-insert-var-item" href="#" data-var="${f.key}">${f.label} ({{${f.key}}})</a>`;
                });
            }

            varDropdownMenu.innerHTML = html;

            varDropdownMenu.querySelectorAll(".btn-insert-var-item").forEach(item => {
                item.addEventListener("click", function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    insertPlaceholderAtCursor(`{{${this.dataset.var}}}`);
                    varDropdownMenu.style.display = "none";
                });
            });
        }

        // Hook renderFields to update dropdown list in real-time
        const originalRenderFields = renderFields;
        renderFields = function() {
            originalRenderFields();
            const container = document.getElementById("fSrvFormList");
            if (container) {
                setTimeout(() => {
                    const labelInputs = container.querySelectorAll(".field-label");
                    labelInputs.forEach(input => {
                        input.addEventListener("input", () => {
                            syncDrafts();
                            updateVariableDropdown();
                        });
                    });
                }, 0);
            }
            updateVariableDropdown();
        };

        await loadData();

        document.getElementById("btnAddSrv")?.addEventListener("click", () => {
            form.reset();
            document.getElementById("fSrvId").value = "";
            document.getElementById("fSrvTemplate").value = "";
            if (editorCanvas) editorCanvas.innerHTML = "";
            document.getElementById("fSrvStatus").checked = true;
            draftSyarat = [];
            draftSteps = [];
            draftFields = [];
            renderSyarat();
            renderSteps();
            renderFields();
            openModal();
        });

        document.getElementById("btnAddSyarat")?.addEventListener("click", () => {
            syncDrafts();
            draftSyarat.push("");
            renderSyarat();
        });

        document.getElementById("btnAddStep")?.addEventListener("click", () => {
            syncDrafts();
            draftSteps.push({ judul: "", deskripsi: "" });
            renderSteps();
        });

        document.getElementById("btnAddField")?.addEventListener("click", () => {
            syncDrafts();
            draftFields.push({ key: "", label: "", type: "text", required: false, options: [] });
            renderFields();
        });

        document.getElementById("srvRefreshBtn")?.addEventListener("click", loadData);

        document.addEventListener("click", (e) => {
            if (e.target.closest("[data-action='closeSrvModal']")) {
                closeModal();
            }
        });

        if (form && !form.dataset.boundLaravel) {
            form.dataset.boundLaravel = "true";

            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                syncDrafts();

                if (editorCanvas) {
                    document.getElementById("fSrvTemplate").value = editorCanvas.innerHTML;
                }

                const id = document.getElementById("fSrvId").value;
                const payload = {
                    nama: document.getElementById("fSrvNama").value,
                    slug: document.getElementById("fSrvPage").value,
                    estimasi: document.getElementById("fSrvEstimasi").value,
                    biaya: document.getElementById("fSrvBiaya").value,
                    online: document.getElementById("fSrvOnline").checked,
                    syarat: draftSyarat.filter(Boolean),
                    langkah: draftSteps.filter(s => s.judul || s.deskripsi),
                    form_fields: draftFields.filter(f => f.label),
                    jam_pelayanan: document.getElementById("fSrvJam").value,
                    lokasi: document.getElementById("fSrvLokasi").value,
                    catatan: document.getElementById("fSrvCatatan").value,
                    template_html: document.getElementById("fSrvTemplate").value,
                    teks_tombol: document.getElementById("fSrvTombol").value,
                    status: document.getElementById("fSrvStatus").checked ? 'aktif' : 'nonaktif',
                };

                let response;
                const csrf = document.querySelector('meta[name="csrf-token"]')?.content;

                if (id) {
                    response = await fetchAPI(`/api/admin/pelayanan/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": csrf,
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetchAPI("/api/admin/pelayanan", {
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
                    alert("Gagal menyimpan pelayanan");
                    return;
                }

                closeModal();
                await loadData();
            });
        }

        window.editPelayanan = async function (id) {
            const response = await fetchAPI(`/api/admin/pelayanan/${id}`);
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
            document.getElementById("fSrvTemplate").value = item.template?.konten_html ?? "";
            if (editorCanvas) {
                editorCanvas.innerHTML = item.template?.konten_html ?? "";
            }
            document.getElementById("fSrvTombol").value = item.teks_tombol ?? "";
            document.getElementById("fSrvStatus").checked = (item.status === 'aktif');

            draftSyarat = item.syarat ?? [];
            draftSteps = item.langkah ?? [];
            draftFields = item.form_fields ?? [];

            renderSyarat();
            renderSteps();
            renderFields();

            openModal();
        };

        window.togglePelayananStatus = async function (id, currentStatus) {
            const nextStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif';
            const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
            try {
                const getRes = await fetchAPI(`/api/admin/pelayanan/${id}`);
                const item = await getRes.json();
                
                const payload = {
                    nama: item.nama,
                    slug: item.slug,
                    estimasi: item.estimasi,
                    biaya: item.biaya,
                    online: item.online,
                    syarat: item.syarat,
                    langkah: item.langkah,
                    form_fields: item.form_fields,
                    jam_pelayanan: item.jam_pelayanan,
                    lokasi: item.lokasi,
                    catatan: item.catatan,
                    template_html: item.template?.konten_html || '',
                    teks_tombol: item.teks_tombol,
                    status: nextStatus,
                };

                const response = await fetchAPI(`/api/admin/pelayanan/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrf,
                        Accept: "application/json",
                    },
                    body: JSON.stringify(payload),
                });
                
                if (response.ok) {
                    await loadData();
                } else {
                    alert("Gagal mengubah status pelayanan");
                }
            } catch (error) {
                console.error("Error toggling status:", error);
            }
        };

        window.deletePelayanan = async function (id) {
            if (!confirm("Hapus pelayanan ini?")) return;
            const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
            await fetchAPI(`/api/admin/pelayanan/${id}`, {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": csrf,
                    Accept: "application/json",
                }
            });

            await loadData();
        };
    }

    async function initSettingsLaravel() {
        console.log("SETTING LARAVEL LOADED");

        const btnSave = document.querySelector("[data-action='saveSettings']");

        if (!btnSave) return;

        async function loadData() {
            const response = await fetchAPI("/api/admin/setting");

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

                const current = await fetchAPI("/api/admin/setting");

                const setting = await current.json();

                let response;

                if (setting?.id) {
                    response = await fetchAPI(`/api/admin/setting/${setting.id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(payload),
                    });
                } else {
                    response = await fetchAPI("/api/admin/setting", {
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
                const response = await fetchAPI("/api/admin/users");

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

                const response = await fetchAPI(`/api/admin/users/${id}`, {
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
            const response = await fetchAPI(`/api/admin/users/${id}`);
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

            const response = await fetchAPI(`/api/admin/users/${id}`, {
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
        if (name === "admin/struktur-organisasi") initStrukturOrganisasi();
        if (name === "admin/laporan") initLaporan();

    });
})();
