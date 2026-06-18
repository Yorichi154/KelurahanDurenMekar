// assets/js/public/public.js
/* =========================================================
public.js
Render public pages dari API Laravel (BUKAN localStorage)
========================================================= */
(function () {
    "use strict";

    const fmtDate = (iso) => {
        try {
            const d = new Date(iso);
            return d.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
        } catch (_) {
            return iso || "";
        }
    };

    // ==========================
    // SETTINGS (diambil dari API database dengan fallback)
    // ==========================
    let _activeSettings = null;

    async function fetchSettings() {
        if (_activeSettings) return _activeSettings;
        try {
            const res = await fetch("/api/public/setting", {
                Accept: "application/json",
            });
            if (res.ok) {
                const data = await res.json();
                if (data && data.id) {
                    _activeSettings = data;
                    return _activeSettings;
                }
            }
        } catch (e) {
            console.error("Gagal fetch settings dari API:", e);
        }

        if (window.KelurahanStore) {
            const ls = window.KelurahanStore.Data.settings();
            _activeSettings = {
                site_name: ls.siteName,
                address: ls.address,
                phone: ls.phone,
                email: ls.email,
                instagram: ls.instagram,
                facebook: ls.facebook,
                youtube: ls.youtube,
                profil: ls.note,
                lurah_name: ls.lurahName,
                kecamatan: ls.kecamatan,
                kota: ls.kota,
                provinsi: ls.provinsi,
                kodepos: ls.kodepos,
                maps: ls.maps,
                jam_pelayanan: ls.jamPelayanan,
                visi: ls.visi,
                misi: ls.misi,
                luas_wilayah: ls.luas_wilayah,
                jumlah_penduduk: ls.jumlah_penduduk,
                jumlah_rt: ls.jumlah_rt,
                jumlah_rw: ls.jumlah_rw,
            };
        }
        return _activeSettings;
    }

    async function applySettings() {
        const s = await fetchSettings();
        if (!s) return;

        const h1 = document.querySelector(".logo-text h1");
        const p = document.querySelector(".logo-text p");
        if (h1)
            h1.innerHTML = `<i class="fa-solid fa-landmark"></i> ${s.site_name || "Kelurahan"}`;
        if (p)
            p.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${s.address || ""}`;

        const footer = document.querySelector(".footer");
        if (!footer) return;

        // Dynamic footer about section
        const footerAbout = document.getElementById("footerAbout");
        if (footerAbout) {
            footerAbout.textContent =
                s.profil ||
                `Website resmi ${s.site_name || "Kelurahan Duren Mekar"} untuk menyediakan informasi dan layanan kepada masyarakat secara online.`;
        }

        // Dynamic footer social section
        const fbLink = document.querySelector(
            ".footer-social a[aria-label='Facebook']",
        );
        const xLink = document.querySelector(
            ".footer-social a[aria-label='X']",
        );
        const instagramLink = document.querySelector(
            ".footer-social a[aria-label='Instagram']",
        );
        if (fbLink) fbLink.style.display = "none";
        if (xLink) xLink.style.display = "none";
        if (instagramLink) {
            if (s.instagram) {
                instagramLink.href = s.instagram.startsWith("http")
                    ? s.instagram
                    : `https://instagram.com/${s.instagram.replace("@", "")}`;
                instagramLink.style.display = "inline-flex";
            } else {
                instagramLink.style.display = "none";
            }
        }

        // Dynamic footer contact info
        const footerAddress = document.getElementById("footerAddress");
        if (footerAddress) {
            footerAddress.querySelector("span").textContent = s.address || "-";
        }
        const footerPhone = document.getElementById("footerPhone");
        if (footerPhone) {
            footerPhone.querySelector("span").textContent = s.phone || "-";
        }
        const footerEmail = document.getElementById("footerEmail");
        if (footerEmail) {
            footerEmail.querySelector("span").textContent = s.email || "-";
        }

        // Dynamic footer copyright
        const footerCopyright = document.getElementById("footerCopyright");
        if (footerCopyright) {
            footerCopyright.textContent = `© 2026 ${s.site_name || "Kelurahan Duren Mekar"}. Hak Cipta Dilindungi.`;
        }

        // Dynamic footer recent news list
        const footNewsList = document.getElementById("footerNewsList");
        if (footNewsList) {
            try {
                const response = await fetch("/api/public/berita");
                if (response.ok) {
                    const all = await response.json();
                    const published = all
                        .filter((b) => b.status === "published")
                        .slice(0, 3);
                    if (published.length > 0) {
                        footNewsList.innerHTML = published
                            .map(
                                (b) => `
                            <li>
                                <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                                <a href="#berita" data-news-id="${b.id}">${b.title}</a>
                            </li>
                        `,
                            )
                            .join("");

                        footNewsList.querySelectorAll("a").forEach((a) => {
                            a.addEventListener("click", () => {
                                const newsId = a.getAttribute("data-news-id");
                                sessionStorage.setItem(
                                    "autoOpenNewsId",
                                    newsId,
                                );
                            });
                        });
                    } else {
                        footNewsList.innerHTML = `<li class="muted">Belum ada berita.</li>`;
                    }
                }
            } catch (err) {
                console.error("Gagal memuat berita untuk footer:", err);
            }
        }
    }

    // ==========================
    // BERITA (dari API publik)
    // ==========================
    async function renderHome() {
        const newsGrid = document.getElementById("homeNewsGrid");
        const agendaList = document.getElementById("homeAgendaList");

        // Statistics
        const statTotalWarga = document.getElementById("stat-total-warga");
        const statTotalRtrw = document.getElementById("stat-total-rtrw");
        const statLayananAktif = document.getElementById("stat-layanan-aktif");
        const statSuratDiproses = document.getElementById(
            "stat-surat-diproses",
        );

        if (
            statTotalWarga ||
            statTotalRtrw ||
            statLayananAktif ||
            statSuratDiproses
        ) {
            try {
                const response = await fetch("/api/public/stats", {
                    credentials: "include",
                });
                if (response.ok) {
                    const stats = await response.json();
                    if (statTotalWarga && stats.total_warga !== undefined) {
                        statTotalWarga.textContent = Number(
                            stats.total_warga,
                        ).toLocaleString("id-ID");
                    }
                    if (statTotalRtrw && stats.total_rtrw !== undefined) {
                        statTotalRtrw.textContent = stats.total_rtrw;
                    }
                    if (statLayananAktif && stats.layanan_aktif !== undefined) {
                        statLayananAktif.textContent = Number(
                            stats.layanan_aktif,
                        ).toLocaleString("id-ID");
                    }
                    if (
                        statSuratDiproses &&
                        stats.surat_diproses !== undefined
                    ) {
                        statSuratDiproses.textContent = Number(
                            stats.surat_diproses,
                        ).toLocaleString("id-ID");
                    }
                }
            } catch (error) {
                console.error("Gagal memuat statistik:", error);
            }
        }

        // ── BERITA: Featured (slide) + list kanan ──
        if (newsGrid) {
            try {
                const response = await fetch("/api/public/berita", {
                    credentials: "include",
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const all = await response.json();
                const berita = all
                    .filter((b) => b.status === "published")
                    .sort(
                        (a, b) =>
                            new Date(b.created_at) - new Date(a.created_at),
                    )
                    .slice(0, 6);

                if (!berita.length) {
                    newsGrid.innerHTML = `<div class="empty-card" style="grid-column:1/-1">Belum ada berita.</div>`;
                } else {
                    // Bangun layout: featured kiri + list kanan
                    newsGrid.className = "home-news-wrap";
                    newsGrid.innerHTML = `
                        <div class="home-news-featured" id="homeFeaturedWrap">
                            <div class="home-news-featured-track" id="homeFeaturedTrack"></div>
                            <button class="featured-nav featured-prev" id="featPrev">&#8249;</button>
                            <button class="featured-nav featured-next" id="featNext">&#8250;</button>
                            <div class="featured-dots" id="featDots"></div>
                        </div>
                        <div class="home-news-list" id="homeNewsList"></div>
                    `;

                    // Featured slides
                    const featTrack =
                        document.getElementById("homeFeaturedTrack");
                    const featDots = document.getElementById("featDots");
                    const featPrev = document.getElementById("featPrev");
                    const featNext = document.getElementById("featNext");

                    const featItems = berita.slice(
                        0,
                        Math.min(berita.length, 4),
                    );

                    featTrack.innerHTML = featItems
                        .map((b, i) => {
                            const cat = b.category || "Berita";
                            return `
                        <div class="featured-slide${i === 0 ? " active" : ""}" data-idx="${i}">
                            ${b.image ? `<img src="${b.image}" alt="${b.title}" onerror="this.style.display='none'">` : `<div class="featured-no-img"><i class="fa-regular fa-newspaper"></i></div>`}
                            <div class="featured-overlay">
                                <span class="featured-cat">${cat}</span>
                                <h3 class="featured-title">${b.title}</h3>
                                <div class="featured-meta">${fmtDate(b.created_at)} &bull; ${b.author || "Kelurahan Duren Mekar"}</div>
                                <a class="featured-read nav-link" href="#berita" data-page="berita">Baca Selengkapnya &rsaquo;</a>
                            </div>
                        </div>`;
                        })
                        .join("");

                    // Dots
                    featDots.innerHTML = featItems
                        .map(
                            (_, i) =>
                                `<button class="feat-dot${i === 0 ? " active" : ""}" data-i="${i}"></button>`,
                        )
                        .join("");

                    let featCur = 0;
                    const slides =
                        featTrack.querySelectorAll(".featured-slide");
                    const dots = featDots.querySelectorAll(".feat-dot");

                    function goFeat(idx) {
                        slides[featCur]?.classList.remove("active");
                        dots[featCur]?.classList.remove("active");
                        featCur = (idx + slides.length) % slides.length;
                        slides[featCur]?.classList.add("active");
                        dots[featCur]?.classList.add("active");
                    }

                    featPrev?.addEventListener("click", () =>
                        goFeat(featCur - 1),
                    );
                    featNext?.addEventListener("click", () =>
                        goFeat(featCur + 1),
                    );
                    dots.forEach((d) =>
                        d.addEventListener("click", () => goFeat(+d.dataset.i)),
                    );

                    if (slides.length > 1) {
                        if (window._featTimer) clearInterval(window._featTimer);
                        window._featTimer = setInterval(() => {
                            if (!document.getElementById("homeFeaturedTrack")) {
                                clearInterval(window._featTimer);
                                return;
                            }
                            goFeat(featCur + 1);
                        }, 7000);
                    }

                    // List kanan: berita berikutnya
                    const listEl = document.getElementById("homeNewsList");
                    const listItems = berita.slice(0, 4);
                    listEl.innerHTML = listItems
                        .map(
                            (b, i) => `
                        <article class="home-news-item${i === 0 ? " active" : ""}" data-idx="${i}">
                            ${b.image ? `<div class="hni-thumb"><img src="${b.image}" alt="${b.title}" onerror="this.style.display='none'"></div>` : `<div class="hni-thumb hni-thumb-empty"><i class="fa-regular fa-newspaper"></i></div>`}
                            <div class="hni-body">
                                <span class="hni-cat">${b.category || "Berita"}</span>
                                <div class="hni-title">${b.title}</div>
                                <div class="hni-date">${fmtDate(b.created_at)}</div>
                            </div>
                        </article>
                    `,
                        )
                        .join("");

                    // Klik item list → pindah ke featured
                    listEl.querySelectorAll(".home-news-item").forEach((el) => {
                        el.style.cursor = "pointer";
                        el.addEventListener("click", () => {
                            const idx = +el.dataset.idx;
                            goFeat(idx);
                            listEl
                                .querySelectorAll(".home-news-item")
                                .forEach((x) => x.classList.remove("active"));
                            el.classList.add("active");
                        });
                    });

                    // Sync list highlight saat featured berubah
                    const origGoFeat = goFeat;
                    function goFeatSync(idx) {
                        origGoFeat(idx);
                        listEl
                            .querySelectorAll(".home-news-item")
                            .forEach((x, i) =>
                                x.classList.toggle("active", i === featCur),
                            );
                    }
                    featPrev?.addEventListener(
                        "click",
                        () => goFeatSync(featCur - 1),
                        { once: false },
                    );
                    featNext?.addEventListener(
                        "click",
                        () => goFeatSync(featCur + 1),
                        { once: false },
                    );
                }
            } catch (error) {
                console.error("Gagal memuat berita:", error);
                if (newsGrid)
                    newsGrid.innerHTML = `<div class="error-card">Gagal memuat berita.</div>`;
            }
        }

        // ── AGENDA ──
        if (agendaList) {
            try {
                const response = await fetch("/api/public/agenda", {
                    credentials: "include",
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const agenda = await response.json();

                const upcoming = agenda
                    .filter(
                        (a) =>
                            a.date >= new Date().toISOString().slice(0, 10) ||
                            true,
                    )
                    .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
                    .slice(0, 4);

                if (!upcoming.length) {
                    agendaList.innerHTML = `<div class="agenda-empty"><i class="fa-regular fa-calendar-xmark"></i><p>Belum ada agenda mendatang</p></div>`;
                } else {
                    agendaList.innerHTML = upcoming
                        .map(
                            (item) => `
                        <div class="agenda-row">
                            <div class="agenda-date-box">
                                <span class="adb-day">${new Date(item.date || Date.now()).getDate()}</span>
                                <span class="adb-mon">${new Date(item.date || Date.now()).toLocaleDateString("id-ID", { month: "short" })}</span>
                            </div>
                            <div class="agenda-content">
                                <div class="agenda-title">${item.title}</div>
                                <div class="agenda-detail">
                                    ${item.time ? `<span><i class="fa-regular fa-clock"></i> ${item.time}</span>` : ""}
                                    ${item.location ? `<span><i class="fa-solid fa-location-dot"></i> ${item.location}</span>` : ""}
                                </div>
                            </div>
                        </div>
                    `,
                        )
                        .join("");
                }
            } catch (error) {
                console.error("Gagal memuat agenda:", error);
                if (agendaList)
                    agendaList.innerHTML = `<div class="agenda-empty">Gagal memuat agenda.</div>`;
            }
        }

        // Hero Slider Integration
        const heroSlider = document.getElementById("heroSlider");
        const track = document.getElementById("heroSlidesTrack");
        if (heroSlider && track) {
            try {
                const response = await fetch("/api/public/galeri", {
                    credentials: "include",
                });
                if (response.ok) {
                    const galeri = await response.json();
                    if (galeri && galeri.length > 0) {
                        // Build slides
                        track.innerHTML = galeri
                            .map(
                                (g) => `
                            <div class="hero-slide">
                                <img src="${g.image}" alt="${g.title}" loading="lazy">
                                <div class="hero-slide-caption">${g.title}</div>
                            </div>
                        `,
                            )
                            .join("");

                        // Build pagination dots
                        let dotsContainer =
                            document.getElementById("heroSliderDots");
                        if (!dotsContainer) {
                            dotsContainer = document.createElement("div");
                            dotsContainer.className = "hero-slider-dots";
                            dotsContainer.id = "heroSliderDots";
                            heroSlider.appendChild(dotsContainer);
                        }
                        dotsContainer.innerHTML = galeri
                            .map(
                                (_, idx) => `
                            <button class="hero-slider-dot ${idx === 0 ? "active" : ""}" data-index="${idx}"></button>
                        `,
                            )
                            .join("");

                        let currentSlide = 0;
                        const slides = track.querySelectorAll(".hero-slide");
                        const dots =
                            dotsContainer.querySelectorAll(".hero-slider-dot");

                        const goToSlide = (idx) => {
                            currentSlide = idx;
                            track.style.transform = `translateX(-${currentSlide * 100}%)`;
                            dots.forEach((dot, dIdx) => {
                                dot.classList.toggle(
                                    "active",
                                    dIdx === currentSlide,
                                );
                            });
                        };

                        // Dot click listeners
                        dots.forEach((dot) => {
                            dot.addEventListener("click", () => {
                                const idx = parseInt(dot.dataset.index);
                                goToSlide(idx);
                            });
                        });

                        // Auto rotation timer (e.g. 7 seconds)
                        if (slides.length > 1) {
                            if (window.heroSliderInterval) {
                                clearInterval(window.heroSliderInterval);
                            }
                            window.heroSliderInterval = setInterval(() => {
                                const sliderEl =
                                    document.getElementById("heroSlider");
                                if (!sliderEl) {
                                    clearInterval(window.heroSliderInterval);
                                    window.heroSliderInterval = null;
                                    return;
                                }
                                const nextSlide =
                                    (currentSlide + 1) % slides.length;
                                goToSlide(nextSlide);
                            }, 7000);
                        }
                    }
                }
            } catch (error) {
                console.error("Gagal memuat galeri untuk slider hero:", error);
            }
        }
    }

    // ==========================
    // HALAMAN BERITA PENUH
    // ==========================
    async function renderBerita() {
        const grid = document.getElementById("beritaContainer");
        const tabsWrap = document.getElementById("beritaTabs");
        const searchInput = document.getElementById("beritaSearch");
        if (!grid) return;

        try {
            const response = await fetch("/api/public/berita", {
                credentials: "include",
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const all = await response.json();
            const published = all.filter((b) => b.status === "published");

            // Extract dynamic categories
            const categories = Array.from(
                new Set(published.map((x) => x.category).filter(Boolean)),
            );
            const tabs = ["Semua", ...categories];

            let activeCategory = "Semua";
            let searchQuery = "";

            const draw = () => {
                const query = searchQuery.toLowerCase().trim();
                const filtered = published.filter((b) => {
                    const matchCategory =
                        activeCategory === "Semua" ||
                        b.category === activeCategory;

                    const matchSearch =
                        !query ||
                        (b.title && b.title.toLowerCase().includes(query)) ||
                        (b.content &&
                            b.content.toLowerCase().includes(query)) ||
                        (b.excerpt && b.excerpt.toLowerCase().includes(query));

                    return matchCategory && matchSearch;
                });

                grid.innerHTML =
                    filtered
                        .map(
                            (b) => `
                        <article class="berita-card" style="cursor: pointer; display: flex; flex-direction: column; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); transition: transform 0.2s, box-shadow 0.2s;" data-id="${b.id}">
                            ${b.image ? `<img src="${b.image}" alt="${b.title}" class="berita-thumb" style="width:100%; aspect-ratio:16/10; object-fit:cover; border-bottom:1px solid var(--border);" onerror="this.style.display='none';">` : ""}
                            <div class="berita-content" style="padding: 16px; display: flex; flex-direction: column; gap: 8px; flex-grow: 1;">
                                <span class="berita-category" style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--primary);">${b.category || "Umum"}</span>
                                <h3 style="font-size: 16px; font-weight: 900; margin: 0; line-height: 1.3; color: var(--text);">${b.title}</h3>
                                <small class="muted">${fmtDate(b.date || b.created_at)}</small>
                                <p style="font-size: 13px; color: var(--muted); margin: 4px 0 12px; line-height: 1.5;">${b.excerpt || ""}</p>
                                <button class="btn-read-more" style="align-self: flex-start; margin-top: auto; font-weight: 700; color: var(--primary); background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 0;">Baca Selengkapnya <i class="fa-solid fa-arrow-right"></i></button>
                            </div>
                        </article>
                    `,
                        )
                        .join("") ||
                    `<div class="muted" style="grid-column: span 3; text-align: center; padding: 24px;">Tidak ada berita yang cocok.</div>`;

                // Click listener for details modal
                grid.querySelectorAll(".berita-card").forEach((card) => {
                    card.addEventListener("click", () => {
                        const id = card.getAttribute("data-id");
                        const b = published.find(
                            (x) => String(x.id) === String(id),
                        );
                        if (b) {
                            document.getElementById(
                                "publicBeritaTitle",
                            ).textContent = b.title;
                            document.getElementById(
                                "publicBeritaHeadline",
                            ).textContent = b.title;
                            document.getElementById(
                                "publicBeritaCategory",
                            ).textContent = b.category || "Berita";
                            document.getElementById(
                                "publicBeritaDate",
                            ).textContent = fmtDate(b.date || b.created_at);
                            document.getElementById(
                                "publicBeritaContent",
                            ).textContent = b.content || "";

                            const img =
                                document.getElementById("publicBeritaImage");
                            if (b.image) {
                                img.src = b.image;
                                img.style.display = "block";
                            } else {
                                img.removeAttribute("src");
                                img.style.display = "none";
                            }

                            document
                                .getElementById("publicBeritaModal")
                                .classList.add("open");
                        }
                    });
                });

                // Toggle active class on buttons
                if (tabsWrap) {
                    tabsWrap.querySelectorAll(".tab").forEach((btn) => {
                        btn.classList.toggle(
                            "active",
                            btn.dataset.filter === activeCategory,
                        );
                    });
                }
            };

            // Dynamically render filter tabs
            if (tabsWrap) {
                tabsWrap.innerHTML = tabs
                    .map(
                        (tab) => `
                        <button class="tab ${tab === activeCategory ? "active" : ""}" data-filter="${tab}">
                            ${tab}
                        </button>
                    `,
                    )
                    .join("");

                tabsWrap.addEventListener("click", (e) => {
                    const btn = e.target.closest(".tab");
                    if (!btn) return;
                    activeCategory = btn.dataset.filter;
                    draw();
                });
            }

            // Bind search query listener
            if (searchInput) {
                searchInput.value = "";
                searchInput.addEventListener("input", (e) => {
                    searchQuery = e.target.value;
                    draw();
                });
            }

            draw();

            // Auto open news item if requested from footer
            const autoOpenId = sessionStorage.getItem("autoOpenNewsId");
            if (autoOpenId) {
                sessionStorage.removeItem("autoOpenNewsId");
                const card = grid.querySelector(
                    `.berita-card[data-id="${autoOpenId}"]`,
                );
                if (card) {
                    card.click();
                } else {
                    const b = published.find(
                        (x) => String(x.id) === String(autoOpenId),
                    );
                    if (b) {
                        document.getElementById(
                            "publicBeritaTitle",
                        ).textContent = b.title;
                        document.getElementById(
                            "publicBeritaHeadline",
                        ).textContent = b.title;
                        document.getElementById(
                            "publicBeritaCategory",
                        ).textContent = b.category || "Berita";
                        document.getElementById(
                            "publicBeritaDate",
                        ).textContent = fmtDate(b.date || b.created_at);
                        document.getElementById(
                            "publicBeritaContent",
                        ).textContent = b.content || "";

                        const img =
                            document.getElementById("publicBeritaImage");
                        if (b.image) {
                            img.src = b.image;
                            img.style.display = "block";
                        } else {
                            img.removeAttribute("src");
                            img.style.display = "none";
                        }

                        document
                            .getElementById("publicBeritaModal")
                            .classList.add("open");
                    }
                }
            }
        } catch (error) {
            console.error("Gagal memuat berita:", error);
            grid.innerHTML = `<p>Gagal memuat berita.</p>`;
        }
    }

    // Modal close listener
    document.addEventListener("click", (e) => {
        if (
            e.target.closest("#closePublicBeritaModalBtn") ||
            e.target.matches("#publicBeritaModal")
        ) {
            document
                .getElementById("publicBeritaModal")
                ?.classList.remove("open");
        }
    });

    // ==========================
    // HALAMAN AGENDA PENUH
    // ==========================
    async function renderAgenda() {
        const listEl = document.getElementById("agendaPublic");
        if (!listEl) return;

        listEl.innerHTML =
            '<div class="agenda-loading"><i class="fa-solid fa-spinner fa-spin"></i> Memuat agenda...</div>';

        try {
            const response = await fetch("/api/public/agenda", {
                credentials: "include",
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const agenda = await response.json();

            if (!agenda.length) {
                listEl.innerHTML = `
                <div class="agenda-empty-full">
                    <i class="fa-regular fa-calendar-xmark"></i>
                    <p>Belum ada agenda kegiatan.</p>
                </div>`;
                return;
            }

            const sorted = [...agenda].sort((a, b) =>
                (a.date || "").localeCompare(b.date || ""),
            );

            listEl.innerHTML = sorted
                .map((item) => {
                    const d = item.date ? new Date(item.date) : null;
                    const day = d ? d.getDate() : "-";
                    const mon = d
                        ? d.toLocaleDateString("id-ID", { month: "short" })
                        : "-";
                    const yr = d ? d.getFullYear() : "";
                    const dayName = d
                        ? d.toLocaleDateString("id-ID", { weekday: "long" })
                        : "";

                    // Tentukan warna badge berdasarkan waktu (masa depan vs lalu)
                    const isPast = d && d < new Date();
                    const badgeClass = isPast
                        ? "agenda-badge-past"
                        : "agenda-badge-upcoming";

                    const contentLines = (item.content || "")
                        .split("\n")
                        .filter(Boolean);

                    return `
                <div class="agenda-card-full">
                    <!-- Tanggal Box -->
                    <div class="acf-date-box ${badgeClass}">
                        <span class="acf-day">${day}</span>
                        <span class="acf-mon">${mon}</span>
                        <span class="acf-yr">${yr}</span>
                    </div>

                    <!-- Konten -->
                    <div class="acf-body">
                        <div class="acf-status">${isPast ? '<span class="acf-tag acf-tag-past">Selesai</span>' : '<span class="acf-tag acf-tag-upcoming">Akan Datang</span>'}</div>
                        <h3 class="acf-title">${item.title || "(Tanpa Judul)"}</h3>
                        <div class="acf-meta">
                            ${dayName ? `<span><i class="fa-regular fa-calendar"></i> ${dayName}, ${fmtDate(item.date)}</span>` : ""}
                            ${item.time ? `<span><i class="fa-regular fa-clock"></i> ${item.time}</span>` : ""}
                            ${item.location ? `<span><i class="fa-solid fa-location-dot"></i> ${item.location}</span>` : ""}
                        </div>
                        ${contentLines.length ? `<div class="acf-content">${contentLines.map((l) => `<p>${l}</p>`).join("")}</div>` : ""}
                    </div>
                </div>`;
                })
                .join("");
        } catch (error) {
            console.error("Gagal memuat agenda:", error);
            listEl.innerHTML =
                '<div class="agenda-empty-full"><i class="fa-solid fa-circle-exclamation"></i><p>Gagal memuat agenda.</p></div>';
        }
    }

    // ==========================
    // GALERI (masih dari localStorage untuk sementara)
    // ==========================
    async function renderGaleri() {
        const grid = document.getElementById("galeriGrid");
        const filterWrap = document.getElementById("galeriFilter");
        if (!grid || !filterWrap) return;

        try {
            const response = await fetch("/api/public/galeri", {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Gagal memuat galeri");
            const items = await response.json();

            const categories = Array.from(
                new Set(items.map((x) => x.category).filter(Boolean)),
            );
            const filters = ["Semua", ...categories];

            let active = "Semua";

            const draw = () => {
                const filtered =
                    active === "Semua"
                        ? items
                        : items.filter((x) => x.category === active);

                grid.innerHTML =
                    filtered
                        .map(
                            (g) => `
                            <article class="gallery-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s;">
                                ${g.image ? `<img src="${g.image}" alt="${g.title}" style="width:100%; aspect-ratio:4/3; object-fit:cover; border-bottom:1px solid var(--border);" onerror="this.style.display='none'">` : ""}
                                <div class="gallery-body" style="padding:16px; display:flex; flex-direction:column; gap:6px; flex-grow:1;">
                                    <h3 style="font-size: 15px; font-weight: 800; color: var(--text); margin:0;">${g.title}</h3>
                                    <p style="font-size: 13px; color: var(--muted); margin:0;">${g.content || ""}</p>
                                    <div class="muted" style="font-size:11px; margin-top:auto; font-weight:700;">
                                        ${g.category || "Umum"} • ${fmtDate(g.date || g.created_at)}
                                    </div>
                                </div>
                            </article>
                        `,
                        )
                        .join("") ||
                    `<div class="muted" style="grid-column: span 3; text-align: center; padding: 24px;">Belum ada foto galeri.</div>`;

                filterWrap.querySelectorAll(".filter-btn").forEach((b) => {
                    b.classList.toggle("active", b.dataset.filter === active);
                });
            };

            filterWrap.innerHTML = filters
                .map(
                    (f) => `
                    <button class="filter-btn ${f === active ? "active" : ""}" data-filter="${f}">
                        ${f}
                    </button>
                `,
                )
                .join("");

            filterWrap.addEventListener("click", (e) => {
                const btn = e.target.closest(".filter-btn");
                if (!btn) return;
                active = btn.dataset.filter;
                draw();
            });

            draw();
        } catch (error) {
            console.error("Gagal memuat galeri:", error);
            grid.innerHTML = `<div class="error-card" style="grid-column: span 3; text-align: center; padding: 24px;">Gagal memuat galeri.</div>`;
        }
    }

    // ==========================
    // FAQ / KONTAK
    // ==========================
    function initFAQ() {
        document.querySelectorAll(".faq-question").forEach((btn) => {
            btn.addEventListener("click", () => {
                const ans = btn.nextElementSibling;
                if (!ans) return;
                ans.classList.toggle("show");
            });
        });
    }
    async function renderKontakPublic() {
        try {
            // Load Settings
            const setting = await fetchSettings();
            if (setting) {
                const kPhone = document.getElementById("kPhone");
                const kEmail = document.getElementById("kEmail");
                const kAddress = document.getElementById("kAddress");
                const kAddress2 = document.getElementById("kAddress2");
                const kProfil = document.getElementById("kProfil");
                const kIgRow = document.getElementById("kIgRow");
                const kInstagram = document.getElementById("kInstagram");
                const kFbRow = document.getElementById("kFbRow");
                const kFacebook = document.getElementById("kFacebook");
                const kYtRow = document.getElementById("kYtRow");
                const kYoutube = document.getElementById("kYoutube");

                if (kPhone) kPhone.textContent = setting.phone || "-";
                if (kEmail) kEmail.textContent = setting.email || "-";
                if (kAddress) kAddress.textContent = setting.address || "-";
                if (kAddress2)
                    kAddress2.textContent = `Kec. ${setting.kecamatan || "-"}, ${setting.kota || "-"}`;
                if (kProfil)
                    kProfil.textContent =
                        setting.jam_pelayanan || setting.profil || "-";

                if (setting.instagram) {
                    if (kIgRow) kIgRow.style.display = "block";
                    if (kInstagram) kInstagram.textContent = setting.instagram;
                } else {
                    if (kIgRow) kIgRow.style.display = "none";
                }
                if (setting.facebook) {
                    if (kFbRow) kFbRow.style.display = "block";
                    if (kFacebook) kFacebook.textContent = setting.facebook;
                } else {
                    if (kFbRow) kFbRow.style.display = "none";
                }
                if (setting.youtube) {
                    if (kYtRow) kYtRow.style.display = "block";
                    if (kYoutube) kYoutube.textContent = setting.youtube;
                } else {
                    if (kYtRow) kYtRow.style.display = "none";
                }
            }

            // Load RT/RW
            const rtrwRes = await fetch("/api/public/rtrw");
            if (rtrwRes.ok) {
                const rtrw = await rtrwRes.json();
                const grid = document.getElementById("kRtGrid");
                if (grid) {
                    if (rtrw && rtrw.length > 0) {
                        grid.innerHTML = rtrw
                            .map(
                                (it) => `
                            <div class="rt-card">
                                <strong>${it.rt_rw || "-"}</strong>
                                <p>${it.ketua || "-"}</p>
                                <small>${it.no_hp || "-"}</small>
                            </div>
                        `,
                            )
                            .join("");
                    } else {
                        grid.innerHTML =
                            '<div style="font-size: 13px; color: var(--muted);">Belum ada kontak RT/RW</div>';
                    }
                }
            }

            // Load FAQ
            const faqRes = await fetch("/api/public/faq");
            if (faqRes.ok) {
                const faqs = await faqRes.json();
                const box = document.getElementById("kFaqBox");
                if (box) {
                    if (faqs && faqs.length > 0) {
                        box.innerHTML = faqs
                            .map(
                                (f) => `
                            <div class="faq-item">
                                <button class="faq-question">${f.question}</button>
                                <div class="faq-answer">${f.answer}</div>
                            </div>
                        `,
                            )
                            .join("");

                        // Re-bind click events
                        box.querySelectorAll(".faq-question").forEach((btn) => {
                            btn.addEventListener("click", () => {
                                btn.classList.toggle("active");
                                btn.nextElementSibling.classList.toggle("show");
                            });
                        });
                    } else {
                        box.innerHTML =
                            '<div style="font-size: 13px; color: var(--muted);">Belum ada FAQ</div>';
                    }
                }
            }
        } catch (e) {
            console.error("Error loading kontak data:", e);
        }
    }

    // ==========================
    // PENGUMUMAN (dari API publik)
    // ==========================
    async function renderPengumuman() {
        const listEl = document.getElementById("pengumumanList");
        const filterKategori = document.getElementById("filterKategori");
        const filterSearch = document.getElementById("filterCari");

        if (!listEl) return;

        let data = [];
        try {
            const response = await fetch("/api/public/pengumuman", {
                credentials: "include",
            });
            if (response.ok) {
                data = await response.json();
            } else {
                console.error(
                    "Gagal memuat pengumuman: status",
                    response.status,
                );
            }
        } catch (error) {
            console.error("Gagal memuat pengumuman:", error);
        }

        // Dynamically populate categories dropdown if empty
        if (filterKategori && filterKategori.options.length <= 1) {
            const uniqueKats = Array.from(
                new Set(data.map((item) => item.kategori).filter(Boolean)),
            );
            uniqueKats.forEach((kat) => {
                const opt = document.createElement("option");
                opt.value = kat;
                opt.textContent = kat.charAt(0).toUpperCase() + kat.slice(1);
                filterKategori.appendChild(opt);
            });
        }

        function render() {
            const kat = filterKategori ? filterKategori.value : "";
            const q = (filterSearch ? filterSearch.value : "").toLowerCase();

            let items = [...data].filter((item) => {
                if (kat && (item.kategori || "") !== kat) return false;
                if (!q) return true;
                return (
                    (item.title || "").toLowerCase().includes(q) ||
                    (item.content || "").toLowerCase().includes(q)
                );
            });

            // Sort by date descending
            items.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

            listEl.innerHTML = "";

            if (!items.length) {
                listEl.innerHTML = `<div class="empty-card" style="padding: 24px; text-align: center; color: var(--muted); border: 1px dashed var(--border); border-radius: var(--radius); width: 100%;">Belum ada pengumuman...</div>`;
                return;
            }

            items.forEach((item) => {
                const card = document.createElement("article");
                card.className = "announcement-card";

                let fileHtml = "";
                if (item.file_path) {
                    const fileUrl =
                        item.file_path.startsWith("data:") ||
                        item.file_path.startsWith("http")
                            ? item.file_path
                            : "/storage/" + item.file_path;

                    if (item.file_path.toLowerCase().endsWith(".pdf")) {
                        fileHtml = `
                            <div style="margin-top: 12px;">
                                <a href="${fileUrl}" target="_blank" class="btn btn-ghost btn-sm" style="font-weight: 800; font-size: 12px; color: var(--primary); display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 6px; background: transparent; cursor: pointer; text-decoration: none;">
                                    <i class="fa-solid fa-file-pdf" style="color: #ef4444; font-size: 14px;"></i> Lihat PDF Lampiran
                                </a>
                            </div>
                        `;
                    } else {
                        fileHtml = `
                            <div style="margin-top: 12px;">
                                <img src="${fileUrl}" alt="Lampiran" style="max-width: 100%; max-height: 320px; border-radius: 8px; border: 1px solid var(--border); display: block; object-fit: contain; cursor: zoom-in;" onclick="window.open(this.src, '_blank')" />
                            </div>
                        `;
                    }
                }

                const katColor = {
                    info: { bg: "#dbeafe", color: "#1d4ed8" },
                    penting: { bg: "#fef9c3", color: "#b45309" },
                    darurat: { bg: "#fee2e2", color: "#dc2626" },
                    kegiatan: { bg: "#d1fae5", color: "#059669" },
                };
                const kat = (item.kategori || "info").toLowerCase();
                const kStyle = katColor[kat] || katColor.info;

                const contentLines = (item.content || "")
                    .split("\n")
                    .filter(Boolean);
                const contentHtml = contentLines
                    .map((l) => `<p class="peng-content-line">${l}</p>`)
                    .join("");

                card.innerHTML = `
                    <div class="peng-card-head">
                        <span class="peng-badge" style="background:${kStyle.bg};color:${kStyle.color}">
                            <i class="fa-solid fa-tag" style="font-size:9px"></i> ${(item.kategori || "Info").toUpperCase()}
                        </span>
                        <span class="peng-date">
                            <i class="fa-regular fa-calendar" style="color:var(--primary)"></i>
                            ${fmtDate(item.date || item.created_at) || "-"}
                        </span>
                    </div>
                    <h3 class="peng-title">${item.title || "(Tanpa judul)"}</h3>
                    <div class="peng-body">${contentHtml || '<p class="peng-content-line muted">—</p>'}</div>
                    ${fileHtml}
                `;
                listEl.appendChild(card);
            });
        }

        if (filterKategori && !filterKategori.dataset.listenerBound) {
            filterKategori.dataset.listenerBound = "true";
            filterKategori.addEventListener("change", render);
        }
        if (filterSearch && !filterSearch.dataset.listenerBound) {
            filterSearch.dataset.listenerBound = "true";
            filterSearch.addEventListener("input", render);
        }

        render();
    }

    async function initStrukturOrganisasiPublic() {
        // Support HTML baru (soOrgChart) DAN HTML lama (soTopLevel+soOthers)
        let container = document.getElementById("soOrgChart");
        const emptyEl = document.getElementById("soEmpty");

        if (!container) {
            // HTML lama masih terpasang - ganti dgn wrapper baru secara dinamis
            const oldTop = document.getElementById("soTopLevel");
            const oldOthers = document.getElementById("soOthers");
            if (!oldTop && !oldOthers) return;
            const anchor = oldTop || oldOthers;
            container = document.createElement("div");
            container.id = "soOrgChart";
            container.className = "org-chart-wrap";
            anchor.parentNode.insertBefore(container, anchor);
            if (oldTop && oldTop.parentNode) oldTop.remove();
            if (oldOthers && oldOthers.parentNode) oldOthers.remove();
        }

        container.innerHTML =
            '<div class="so-loading"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data...</div>';
        if (emptyEl) emptyEl.style.display = "none";

        try {
            const res = await fetch("/api/public/struktur-organisasi", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            if (!res.ok) throw new Error("HTTP " + res.status);
            const data = await res.json();
            const items = (Array.isArray(data) ? data : (data?.data ?? []))
                .filter((i) => i.aktif !== false)
                .sort((a, b) => {
                    const ua = a.urutan ?? 999,
                        ub = b.urutan ?? 999;
                    return ua !== ub ? ua - ub : (a.id ?? 0) - (b.id ?? 0);
                });

            if (!items.length) {
                container.innerHTML = "";
                if (emptyEl) emptyEl.style.display = "flex";
                return;
            }

            // Bangun pohon hierarki dari parent_jabatan -> jabatan
            function buildTree(parentJabatan) {
                return items
                    .filter(
                        (i) =>
                            (i.parent_jabatan || null) ===
                            (parentJabatan || null),
                    )
                    .map((i) => ({ ...i, children: buildTree(i.jabatan) }));
            }
            const tree = buildTree(null);

            // Render kartu foto+nama+jabatan
            function cardHtml(node) {
                const src = node.foto
                    ? node.foto.startsWith("/storage/") ||
                      node.foto.startsWith("http")
                        ? node.foto
                        : "/storage/" + node.foto
                    : "";
                const photo = src
                    ? `<img src="${src}" alt="${node.nama}" onerror="this.onerror=null;this.parentNode.innerHTML='<i class=\'fa-solid fa-user so-ph-icon\'></i>'">`
                    : `<i class="fa-solid fa-user so-ph-icon"></i>`;
                return `<div class="org-card">
                    <div class="org-photo">${photo}</div>
                    <div class="org-name">${node.nama}</div>
                    <div class="org-jabatan">${node.jabatan}</div>
                </div>`;
            }

            // Render node rekursif (kartu + garis + anak)
            function renderNode(node, isRoot) {
                const hasKids = node.children && node.children.length > 0;
                const childrenHtml = hasKids
                    ? `
                    <div class="org-vline"></div>
                    <div class="org-children">${node.children
                        .map(
                            (child) =>
                                `<div class="org-node-wrap"><div class="org-vline"></div>${renderNode(child, false)}</div>`,
                        )
                        .join("")}</div>`
                    : "";
                return `<div class="org-node${isRoot ? " org-root" : ""}">${cardHtml(node)}${childrenHtml}</div>`;
            }

            const chartHtml =
                tree.length === 1
                    ? renderNode(tree[0], true)
                    : `<div class="org-root-row">${tree
                          .map(
                              (n) =>
                                  `<div class="org-node-wrap"><div class="org-vline" style="visibility:hidden"></div>${renderNode(n, true)}</div>`,
                          )
                          .join("")}</div>`;

            container.innerHTML = `<div class="org-chart">${chartHtml}</div>`;
        } catch (e) {
            console.error("Struktur organisasi error:", e);
            container.innerHTML = `<div class="so-loading" style="color:#ef4444">
                <i class="fa-solid fa-circle-exclamation"></i>
                Gagal memuat data. (${e.message})
            </div>`;
        }
    }

    async function initProfilPublic() {
        const s = await fetchSettings();
        if (!s) return;

        const pVisi = document.getElementById("pVisi");
        const pMisi = document.getElementById("pMisi");
        const pWilayah = document.getElementById("pWilayah");
        const pPenduduk = document.getElementById("pPenduduk");
        const pRtrw = document.getElementById("pRtrw");

        if (pVisi)
            pVisi.textContent =
                s.visi ||
                "Terwujudnya kelurahan yang maju, sejahtera, dan berbudaya dengan pelayanan prima kepada masyarakat.";

        if (pMisi) {
            if (s.misi) {
                const lines = s.misi
                    .split("\n")
                    .map((l) => l.trim())
                    .filter(Boolean);
                if (lines.length > 0) {
                    pMisi.innerHTML = lines
                        .map(
                            (line) => `
                        <li>
                            <i class="fa-solid fa-check" aria-hidden="true"></i>
                            <span>${line}</span>
                        </li>
                    `,
                        )
                        .join("");
                }
            } else {
                pMisi.innerHTML = `
                    <li>
                        <i class="fa-solid fa-check" aria-hidden="true"></i>
                        <span>Meningkatkan kualitas pelayanan publik yang cepat dan transparan.</span>
                    </li>
                    <li>
                        <i class="fa-solid fa-check" aria-hidden="true"></i>
                        <span>Memberdayakan masyarakat secara ekonomi dan sosial.</span>
                    </li>
                    <li>
                        <i class="fa-solid fa-check" aria-hidden="true"></i>
                        <span>Mewujudkan tata kelola pemerintahan yang baik dan bersih.</span>
                    </li>
                    <li>
                        <i class="fa-solid fa-check" aria-hidden="true"></i>
                        <span>Meningkatkan partisipasi masyarakat dalam pembangunan.</span>
                    </li>
                `;
            }
        }

        if (pWilayah) pWilayah.textContent = s.luas_wilayah || "24,5 km²";
        if (pPenduduk) pPenduduk.textContent = s.jumlah_penduduk || "8.542";
        if (pRtrw) {
            const rt = s.jumlah_rt || "45";
            const rw = s.jumlah_rw || "9";
            pRtrw.textContent = `${rt} / ${rw}`;
        }
    }

    async function initPetaWilayahPublic() {
        const s = await fetchSettings();
        if (!s) return;
        const mWilayah = document.getElementById("mWilayah");
        const mPenduduk = document.getElementById("mPenduduk");
        const mRtrw = document.getElementById("mRtrw");

        if (mWilayah) mWilayah.textContent = s.luas_wilayah || "24,5 km²";
        if (mPenduduk) mPenduduk.textContent = s.jumlah_penduduk || "8.542";
        if (mRtrw) {
            const rt = s.jumlah_rt || "45";
            const rw = s.jumlah_rw || "9";
            mRtrw.textContent = `${rt} / ${rw}`;
        }
    }

    // ==========================
    // ROUTER HOOK
    // ==========================
    window.addEventListener("page:loaded", (e) => {
        if (window.heroSliderInterval) {
            clearInterval(window.heroSliderInterval);
            window.heroSliderInterval = null;
        }

        applySettings();

        const name = e.detail?.name;

        if (name === "home") {
            renderHome();
            // Panggil home sections setelah renderHome selesai inject konten
            setTimeout(() => {
                if (typeof window.initHomeSections === "function") {
                    window.initHomeSections();
                }
            }, 300);
        }
        if (name === "berita") renderBerita();
        if (name === "agenda") renderAgenda();
        if (name === "galeri") renderGaleri();
        if (name === "kontak") {
            initFAQ();
            renderKontakPublic();
        }
        if (name === "pengumuman") renderPengumuman();
        if (name === "struktur-organisasi") initStrukturOrganisasiPublic();
        if (name === "peta-wilayah") initPetaWilayahPublic();
        if (name === "profil") initProfilPublic();
    });

    window.addEventListener("settings:changed", () => {
        _activeSettings = null;
        applySettings();
    });

    document.addEventListener("DOMContentLoaded", applySettings);
})();
