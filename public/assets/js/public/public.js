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
    // SETTINGS (masih dari localStorage untuk sementara)
    // ==========================
    function applySettings() {
        if (!window.KelurahanStore) return;
        const { Data } = window.KelurahanStore;
        const s = Data.settings();

        const h1 = document.querySelector(".logo-text h1");
        const p = document.querySelector(".logo-text p");
        if (h1)
            h1.innerHTML = `<i class="fa-solid fa-landmark"></i> ${s.siteName || "Kelurahan"}`;
        if (p)
            p.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${s.address || ""}`;

        const footer = document.querySelector(".footer");
        if (!footer) return;

        const footNews = document.getElementById("footerNews");
        if (footNews) {
            const berita = Data.list("berita")
                .filter((b) => b.status === "published")
                .slice(0, 3);
            footNews.innerHTML =
                berita.map((b) => `<li>${b.title}</li>`).join("") ||
                footNews.innerHTML;
        }
    }

    // ==========================
    // BERITA (dari API publik)
    // ==========================
    async function renderHome() {
        const newsGrid = document.getElementById("homeNewsGrid");
        const agendaList = document.getElementById("homeAgendaList");

        // Berita
        if (newsGrid) {
            try {
                const response = await fetch("/api/public/berita", {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const berita = await response.json();

                if (!berita.length) {
                    newsGrid.innerHTML = `<div class="empty-card">Belum ada berita.</div>`;
                } else {
                    newsGrid.innerHTML = berita
                        .filter((item) => item.status === "published")
                        .slice(0, 3)
                        .map(
                            (item) => `
                            <article class="news-card">
                                ${
                                    item.image
                                        ? `
                                    <a class="news-thumb">
                                        <img src="${item.image}" alt="${item.title}">
                                    </a>
                                `
                                        : ""
                                }
                                <div class="news-body">
                                    <div class="news-meta">${fmtDate(item.created_at)}</div>
                                    <div class="news-title">${item.title}</div>
                                    <div class="news-excerpt">${item.excerpt || ""}</div>
                                    <a class="link-more" href="#berita">Baca Selengkapnya ›</a>
                                </div>
                            </article>
                        `,
                        )
                        .join("");
                }
            } catch (error) {
                console.error("Gagal memuat berita:", error);
                newsGrid.innerHTML = `<div class="error-card">Gagal memuat berita.</div>`;
            }
        }

        // Agenda
        if (agendaList) {
            try {
                const response = await fetch("/api/public/agenda", {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const agenda = await response.json();

                if (!agenda.length) {
                    agendaList.innerHTML = `<div class="agenda-item">Belum ada agenda.</div>`;
                } else {
                    agendaList.innerHTML = agenda
                        .slice(0, 3)
                        .map(
                            (item) => `
                            <div class="agenda-item">
                                <strong>${item.title}</strong><br>
                                <span class="muted">
                                    ${fmtDate(item.date)}
                                    ${item.time ? " • " + item.time : ""}
                                    ${item.location ? " • " + item.location : ""}
                                </span>
                            </div>
                        `,
                        )
                        .join("");
                }
            } catch (error) {
                console.error("Gagal memuat agenda:", error);
                agendaList.innerHTML = `<div class="agenda-item">Gagal memuat agenda.</div>`;
            }
        }
    }

    // ==========================
    // HALAMAN BERITA PENUH
    // ==========================
    async function renderBerita() {
        const grid = document.getElementById("beritaContainer");
        if (!grid) return;

        try {
            const response = await fetch("/api/public/berita", {
                credentials: "include",
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const all = await response.json();

            grid.innerHTML = all
                .filter((b) => b.status === "published")
                .map(
                    (b) => `
                    <article class="berita-card">
                        <h3>${b.title}</h3>
                        <p>${b.excerpt || ""}</p>
                        <div class="berita-meta">
                            ${b.category || ""} • ${fmtDate(b.created_at)}
                        </div>
                    </article>
                `,
                )
                .join("");
        } catch (error) {
            console.error("Gagal memuat berita:", error);
            grid.innerHTML = `<p>Gagal memuat berita.</p>`;
        }
    }

    // ==========================
    // HALAMAN AGENDA PENUH
    // ==========================
    async function renderAgenda() {
        const listEl = document.getElementById("agendaPublic");
        if (!listEl) return;

        try {
            const response = await fetch("/api/public/agenda", {
                credentials: "include",
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const agenda = await response.json();

            if (!agenda.length) {
                listEl.innerHTML = `<li class="agenda-item">Belum ada agenda.</li>`;
                return;
            }

            listEl.innerHTML = agenda
                .map(
                    (item) => `
                    <li class="agenda-item">
                        <strong>${item.title}</strong><br>
                        <span class="muted">
                            ${fmtDate(item.date)}
                            ${item.time ? " • " + item.time : ""}
                            ${item.location ? " • " + item.location : ""}
                        </span>
                        <div style="margin-top:8px">${item.content || ""}</div>
                    </li>
                `,
                )
                .join("");
        } catch (error) {
            console.error("Gagal memuat agenda:", error);
            listEl.innerHTML = `<li class="agenda-item">Gagal memuat agenda.</li>`;
        }
    }

    // ==========================
    // GALERI (masih dari localStorage untuk sementara)
    // ==========================
    function renderGaleri() {
        if (!window.KelurahanStore) return;
        const { Data } = window.KelurahanStore;

        const grid = document.getElementById("galleryGrid");
        const filterWrap = document.getElementById("galleryFilter");
        if (!grid || !filterWrap) return;

        const items = Data.list("galeri");
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
                        <article class="gallery-card">
                            <img src="${g.image || ""}" alt="${g.title}" onerror="this.style.display='none'">
                            <div class="gallery-body">
                                <h3>${g.title}</h3>
                                <p>${g.content || ""}</p>
                                <div class="muted" style="font-size:12px;margin-top:8px">
                                    ${g.category || ""} • ${fmtDate(g.date)}
                                </div>
                            </div>
                        </article>
                    `,
                    )
                    .join("") || `<div class="muted">Belum ada foto.</div>`;

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

    // ==========================
    // PENGUMUMAN (dari API publik)
    // ==========================
    async function renderPengumuman() {
        const listEl = document.getElementById("pengumuman-list");
        const emptyEl = document.getElementById("pengumuman-empty");
        const filterKategori = document.getElementById(
            "filter-pengumuman-kategori",
        );
        const filterSearch = document.getElementById(
            "filter-pengumuman-search",
        );

        if (!listEl) return;

        let data = [];
        try {
            const response = await fetch("/api/public/pengumuman", {
                credentials: "include",
            });
            if (response.ok) {
                data = await response.json();
            } else {
                console.error("Gagal memuat pengumuman: status", response.status);
            }
        } catch (error) {
            console.error("Gagal memuat pengumuman:", error);
        }

        function render() {
            const kat = filterKategori ? filterKategori.value : "all";
            const q = (filterSearch ? filterSearch.value : "").toLowerCase();

            let items = [...data].filter((item) => {
                if (kat !== "all" && (item.kategori || "info") !== kat) return false;
                if (!q) return true;
                return (
                    (item.title || "").toLowerCase().includes(q) ||
                    (item.content || "").toLowerCase().includes(q)
                );
            });

            // Sort by date descending
            items.sort((a, b) =>
                (b.date || "").localeCompare(a.date || ""),
            );

            listEl.innerHTML = "";

            if (!items.length) {
                if (emptyEl) emptyEl.style.display = "block";
                return;
            }
            if (emptyEl) emptyEl.style.display = "none";

            items.forEach((item) => {
                const card = document.createElement("article");
                card.className = "announcement-card";
                card.innerHTML = `
                    <div class="announcement-meta">
                        <span class="badge badge-${item.kategori || "info"}">
                            ${(item.kategori || "Info").toUpperCase()}
                        </span>
                        <span class="announcement-date">${fmtDate(item.date) || "-"}</span>
                    </div>
                    <h3 class="announcement-title">${item.title || "(Tanpa judul)"}</h3>
                    <p class="announcement-summary">
                        ${(item.ringkasan || item.content || "").slice(0, 160)}${
                            (item.ringkasan || item.content || "").length > 160
                                ? "..."
                                : ""
                        }
                    </p>
                `;
                listEl.appendChild(card);
            });
        }

        if (filterKategori) filterKategori.addEventListener("change", render);
        if (filterSearch) filterSearch.addEventListener("input", render);

        render();
    }

    // ==========================
    // ROUTER HOOK
    // ==========================
    window.addEventListener("page:loaded", (e) => {
        applySettings();

        const name = e.detail?.name;

        if (name === "home") renderHome();
        if (name === "berita") renderBerita();
        if (name === "agenda") renderAgenda();
        if (name === "galeri") renderGaleri();
        if (name === "kontak") initFAQ();
        if (name === "pengumuman") renderPengumuman();
    });

    document.addEventListener("DOMContentLoaded", applySettings);
})();
