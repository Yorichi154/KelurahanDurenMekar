const APP_BASE = (() => {
    const e = location.pathname.split("/").filter(Boolean);
    return !e.length || e[0].includes(".html") ? "/" : `/${e[0]}/`;
})();
function getSessionUser() {
    if (
        window.KelurahanGuard &&
        typeof window.KelurahanGuard.getSession == "function"
    )
        return window.KelurahanGuard.getSession();
    try {
        const e = sessionStorage.getItem("user");
        return e ? JSON.parse(e) : null;
    } catch (e) {
        return null;
    }
}
function getRole() {
    var e;
    return window.KelurahanGuard &&
        typeof window.KelurahanGuard.getRole == "function"
        ? window.KelurahanGuard.getRole()
        : ((e = getSessionUser()) == null ? void 0 : e.role) || "";
}
function getUserName() {
    var e;
    return ((e = getSessionUser()) == null ? void 0 : e.name) || "";
}
function isAuthenticated() {
    return window.KelurahanGuard &&
        typeof window.KelurahanGuard.isAuthenticated == "function"
        ? window.KelurahanGuard.isAuthenticated()
        : !!getSessionUser();
}
function formatUserLabel(e, a) {
    const t = String(e || "").trim(),
        n = String(a || "")
            .trim()
            .toLowerCase();
    return !t || !n
        ? ""
        : n === "warga"
          ? t
          : n === "admin" || n === "staf"
            ? `${t} (${n})`
            : `${t} (${n})`;
}
function updateHeaderAuthButton() {
    const e = document.querySelector("a.btn-login");
    if (!e) return;
    const a = getRole(),
        t = getUserName(),
        n = e.querySelector("span"),
        s = e.querySelector("i");
    if (a && t) {
        const l = formatUserLabel(t, a);
        (n && (n.textContent = l || t),
            s &&
                (s.classList.remove("fa-right-to-bracket"),
                s.classList.add("fa-user")));
        const i = `${a}/dashboard`;
        (e.setAttribute("href", `#${i}`),
            (e.dataset.page = i),
            e.setAttribute("aria-label", `Akun: ${l || t}`),
            e.classList.add("is-auth"));
    } else
        (n && (n.textContent = "Login"),
            s &&
                (s.classList.remove("fa-user"),
                s.classList.add("fa-right-to-bracket")),
            e.setAttribute("href", "#login"),
            (e.dataset.page = "login"),
            e.setAttribute("aria-label", "Login"),
            e.classList.remove("is-auth"));
}
function updateGuestOnlySections(e = document) {
    const a = isAuthenticated(),
        t = [
            ".hero-actions",
            "#heroGuestActions",
            ".home-cta",
            ".home-cta .cta-actions",
        ],
        n = new Set();
    (t.forEach((s) => {
        e.querySelectorAll(s).forEach((l) => n.add(l));
    }),
        n.forEach((s) => {
            if (s.classList.contains("home-cta")) {
                ((s.style.display = a ? "none" : ""),
                    s.toggleAttribute("hidden", a),
                    s.setAttribute("aria-hidden", a ? "true" : "false"));
                return;
            }
            ((s.style.display = a ? "none" : ""),
                s.toggleAttribute("hidden", a),
                s.setAttribute("aria-hidden", a ? "true" : "false"));
        }));
}
async function fetchFirstOk(e) {
    for (let a of e) {
        !a.startsWith("http") && !a.startsWith("/") && (a = APP_BASE + a);
        const t = await fetch(a, { cache: "no-store" });
        if (t.ok) return await t.text();
    }
    throw new Error("Semua path gagal: " + e.join(" | "));
}
function normalizePage(e) {
    let a = (e || "").split("?")[0];
    return (
        a.startsWith("#") && (a = a.substring(1)),
        (a = a.split("#")[0]),
        a.replace(/^[?/]+/, "").trim() || "home"
    );
}
function getPageFromHash() {
    return window.location.pathname.includes("/reset-password/")
        ? "reset-password"
        : normalizePage(window.location.hash);
}
function upgradeLoginHints(e = document) {
    e.querySelectorAll("td").forEach((t) => {
        const n = (t.textContent || "").trim().toLowerCase();
        !n ||
            !(
                n === "login untuk lihat" ||
                n === "login untuk melihat" ||
                n === "login untuk melihat data kontak." ||
                n === "login untuk melihat data kontak"
            ) ||
            t.querySelector("a[data-page='login']") ||
            (t.innerHTML =
                '<div class="muted" style="display:flex;align-items:center;gap:10px;justify-content:center;padding:10px 0"><span>Login untuk lihat</span><a class="btn btn-primary btn-sm nav-link" href="#login" data-page="login"><i class="fa-solid fa-right-to-bracket"></i> Login</a></div>');
    });
}
function syncResponsiveTables(e = document) {
    e.querySelectorAll("table.table, table.warga-table").forEach((t) => {
        const n = Array.from(t.querySelectorAll("thead th")).map((s) =>
            (s.textContent || "").trim(),
        );
        n.length &&
            t.querySelectorAll("tbody tr").forEach((s) => {
                Array.from(s.children)
                    .filter((i) => i.tagName === "TD")
                    .forEach((i, c) => {
                        const o = n[c] || "";
                        o && (i.dataset.label = o);
                    });
            });
    });
}
function installTableObserver(e) {
    try {
        (window.TABLE_OBSERVER &&
            (window.TABLE_OBSERVER.disconnect(),
            (window.TABLE_OBSERVER = null)),
            syncResponsiveTables(e));
        let a = 0;
        const t = new MutationObserver(() => {
            a ||
                (a = requestAnimationFrame(() => {
                    ((a = 0), syncResponsiveTables(e));
                }));
        });
        (t.observe(e, { childList: !0, subtree: !0 }),
            (window.__TABLE_OBSERVER__ = t));
    } catch (a) {
        console.warn("Table observer failed:", a);
    }
}
window.syncResponsiveTables = syncResponsiveTables;
async function loadComponents() {
    try {
<<<<<<< HEAD
        const e = await fetchFirstOk([
                "pages/partials/header.html",
                "pages/header.html",
            ]),
            a = await fetchFirstOk([
                "pages/partials/footer.html",
                "pages/footer.html",
            ]),
            t = document.getElementById("header"),
            n = document.getElementById("footer");
        (t && ((t.innerHTML = e), t.classList.add("header")),
            n && (n.innerHTML = a),
            setupNavigation(),
            setupDropdowns(),
            setupStickyHeader(),
            setupMobileMenu(),
            updateHeaderAuthButton(),
            updateGuestOnlySections(document),
            navigateTo(getPageFromHash(), { replace: !0 }));
    } catch (e) {
        console.error("Gagal memuat komponen:", e);
        const a = document.getElementById("content");
        a &&
            (a.innerHTML =
                '<div class="error" style="padding:24px;max-width:900px;margin:0 auto;">Gagal memuat komponen. Cek Console.</div>');
=======
        const headerHTML = await fetchFirstOk([
            "pages/partials/header.html",
            "pages/header.html",
        ]);
        const footerHTML = await fetchFirstOk([
            "pages/partials/footer.html",
            "pages/footer.html",
        ]);
        const headerEl = document.getElementById("header");
        const footerEl = document.getElementById("footer");
        if (headerEl) { headerEl.innerHTML = headerHTML; headerEl.classList.add("header"); }
        if (footerEl) footerEl.innerHTML = footerHTML;

        setupNavigation();
        setupDropdowns();
        setupStickyHeader();
        setupMobileMenu();
        updateHeaderAuthButton();
        updateGuestOnlySections(document);
        navigateTo(getPageFromHash(), { replace: true });
    } catch (err) {
        console.error("Gagal memuat komponen:", err);
        const content = document.getElementById("content");
        if (content) {
            content.innerHTML = `<div class="error" style="padding:24px;max-width:900px;margin:0 auto;">Gagal memuat komponen. Cek Console.</div>`;
        }
>>>>>>> f095065e321e32c52ed71452dd74841c27579e72
    }
}
async function loadPageHtml(e) {
    const a = ["rt", "rw", "pkk", "karang-taruna", "lpmk"];
    let t = [];
    return (
        e === "home"
            ? (t = ["pages/public/home.html", "pages/home.html"])
            : e === "login" ||
                e === "register" ||
                e === "forgot-password" ||
                e === "verify-otp" ||
                e === "reset-password"
              ? (t = [
                    `pages/auth/${e}.html`,
                    `pages/public/${e}.html`,
                    `pages/${e}.html`,
                ])
              : e.startsWith("admin/")
                ? (t = [`pages/${e}.html`])
                : e.startsWith("staf/")
                  ? (t = [`pages/${e}.html`])
                  : e.startsWith("warga/")
                    ? (t = [`pages/${e}.html`])
                    : !e.includes("/") && a.includes(e)
                      ? (t = [
                            `pages/public/lembaga-kemasyarakatan/${e}.html`,
                            `pages/public/${e}.html`,
                        ])
                      : e === "unit-kerja"
                        ? (t = [
                              "pages/public/unit-kerja.html",
                              "pages/unit-kerja.html",
                          ])
                        : !e.includes("/") && e.startsWith("unit-")
                          ? (t = [
                                `pages/public/unit-kerja/${e}.html`,
                                `pages/public/${e}.html`,
                            ])
                          : !e.includes("/") && e.startsWith("pelayanan-")
                            ? (t = [
                                  "pages/public/pelayanan/detail.html",
                                  `pages/public/${e}.html`,
                              ])
                            : e === "pengajuan-online"
                              ? (t = [
                                    "pages/public/pelayanan/pengajuan-online.html",
                                    "pages/auth/pengajuan-online.html",
                                ])
                              : [
                                      "kontak",
                                      "berita",
                                      "pengumuman",
                                      "agenda",
                                      "galeri",
                                      "pelayanan",
                                      "profil-kelurahan",
                                      "lembaga",
                                      "struktur-organisasi",
                                      "peta-wilayah",
                                      "profil",
                                      "about",
                                      "layanan",
                                  ].includes(e)
                                ? (t = [
                                      `pages/public/${e}.html`,
                                      `pages/${e}.html`,
                                  ])
                                : (t = [
                                      `pages/${e}.html`,
                                      `pages/public/${e}.html`,
                                      `pages/auth/${e}.html`,
                                  ]),
        await fetchFirstOk(t)
    );
}
const routeRoles = {
    "admin/dashboard": ["admin"],
    "admin/pengaduan": ["admin"],
    "admin/surat": ["admin"],
    "admin/pelayanan": ["admin"],
    "admin/master-penandatangan": ["admin"],
    "admin/galeri": ["admin"],
    "admin/agenda": ["admin"],
    "admin/pengumuman": ["admin"],
    "admin/rtrw": ["admin"],
    "admin/faq": ["admin"],
    "admin/lembaga": ["admin"],
    "admin/unit-kerja": ["admin"],
    "admin/laporan": ["admin"],
    "admin/profil": ["admin"],
    "staf/dashboard": ["staf"],
    "staf/pengaduan": ["staf"],
    "staf/surat": ["staf"],
    "staf/laporan": ["staf"],
    "staf/profil": ["staf"],
    "warga/dashboard": ["warga"],
    "warga/surat": ["warga"],
    "warga/pengaduan": ["warga"],
    "warga/profil": ["warga"],
    "warga/konfirmasi": ["warga"],
    "pengajuan-online": ["warga"],
    home: null,
    login: null,
    kontak: null,
    galeri: null,
    pengumuman: null,
    agenda: null,
    pelayanan: null,
    unauthorized: null,
};
function checkPageAccess(e) {
    const a = routeRoles[e];
    if (a === null || !a) return !0;
    if (!isAuthenticated()) return !1;
    const t = getRole();
    return a.includes(t);
}
async function navigateTo(e, a = {}) {
    try {
        if (((e = normalizePage(e) || "home"), !checkPageAccess(e))) {
            const o = getRole();
            o
                ? o === "admin"
                    ? (e = "admin/dashboard")
                    : o === "staf"
                      ? (e = "staf/dashboard")
                      : o === "warga"
                        ? (e = "warga/dashboard")
                        : (e = "login")
                : (e = "login");
        }
        e === "pengajuan-online" && getRole() !== "warga" && (e = "login");
        const t = await loadPageHtml(e),
            n = document.getElementById("content");
        if (!n) throw new Error("#content tidak ditemukan");
        ((n.innerHTML = t),
            installTableObserver(n),
            window.dispatchEvent(
                new CustomEvent("page:loaded", { detail: { name: e } }),
            ),
            upgradeLoginHints(n));
        const s =
            document.getElementById("site-header") ||
            document.querySelector(".header");
        if (s) {
            const o = s.querySelector(".navbar"),
                r = s.querySelector(".menu-toggle"),
                d = r ? r.querySelector("i") : null;
            (o && o.classList.remove("show"),
                r && r.setAttribute("aria-expanded", "false"),
                document.body.classList.remove("nav-open"),
                d &&
                    (d.classList.add("fa-bars"),
                    d.classList.remove("fa-xmark")));
        }
        let l = `#${e}`;
        const i = window.location.hash;
        if (i.includes("?")) {
            const o = i.split("?")[1];
            l = `#${e}?${o}`;
        }
        (a.replace
            ? history.replaceState({}, "", l)
            : history.pushState({}, "", l),
            document.querySelectorAll(".nav-link").forEach((o) => {
                if (o.dataset.page)
                    o.classList.toggle("active", o.dataset.page === e);
                else {
                    const r = o.closest(".dropdown");
                    if (r) {
                        const d = !!r.querySelector(`[data-page="${e}"]`);
                        o.classList.toggle("active", d);
                    }
                }
            }),
            document
                .querySelectorAll(".dropdown-item[data-page]")
                .forEach((o) => {
                    if (o.dataset.page === "layanan") {
                        let r = "surat";
                        const d = document.getElementById("layananSelect");
                        if (d && e === "layanan") r = d.value;
                        else {
                            const u = sessionStorage.getItem("layananPreset");
                            u && (r = u);
                        }
                        const f = o.dataset.layanan === r.toLowerCase();
                        o.classList.toggle("active", e === "layanan" && f);
                    } else o.classList.toggle("active", o.dataset.page === e);
                }));
        const c = document.querySelector("[data-bind='userName']");
        (c && (c.textContent = getUserName()),
            updateHeaderAuthButton(),
            updateGuestOnlySections(n),
            window.scrollTo({ top: 0, behavior: "smooth" }));
    } catch (t) {
        console.error("navigateTo error:", t);
        const n = document.getElementById("content");
        n &&
            (n.innerHTML = `<div class="error" style="padding:24px;max-width:900px;margin:0 auto;">${t.message}<br><br><small>Cek Network/Console untuk path yang 404.</small></div>`);
    }
}
window.navigateTo = navigateTo;
function setupNavigation() {
    window.NAVIGATION_BOUND ||
        ((window.NAVIGATION_BOUND = !0),
        document.addEventListener("click", (e) => {
            const a = e.target.closest("a[data-page]");
            if (!a) return;
            e.preventDefault();
            const t = a.closest(".dropdown");
            (t && t.classList.remove("open"),
                a.dataset.layanan &&
                    sessionStorage.setItem("layananPreset", a.dataset.layanan),
                navigateTo(a.dataset.page));
        }),
        document.addEventListener("click", (e) => {
            e.target.closest("[data-go-home='true']") &&
                (e.preventDefault(), navigateTo("home"));
        }));
}
function setupDropdowns() {
    window.DROPDOWNS_BOUND ||
        ((window.DROPDOWNS_BOUND = !0),
        document.addEventListener("click", (e) => {
            const a = e.target.closest(".dropdown > .nav-link"),
                t = e.target.closest(".dropdown");
            if (a) {
                e.preventDefault();
                const n = a.closest(".dropdown");
                (document.querySelectorAll(".dropdown.open").forEach((s) => {
                    if (s !== n) {
                        s.classList.remove("open");
                        const l = s.querySelector(":scope > .nav-link");
                        l && l.setAttribute("aria-expanded", "false");
                    }
                }),
                    n.classList.toggle("open"),
                    a.setAttribute(
                        "aria-expanded",
                        n.classList.contains("open") ? "true" : "false",
                    ));
                return;
            }
            t ||
                document.querySelectorAll(".dropdown.open").forEach((n) => {
                    n.classList.remove("open");
                    const s = n.querySelector(":scope > .nav-link");
                    s && s.setAttribute("aria-expanded", "false");
                });
        }),
        document.addEventListener("keydown", (e) => {
            e.key === "Escape" &&
                document.querySelectorAll(".dropdown.open").forEach((a) => {
                    a.classList.remove("open");
                    const t = a.querySelector(":scope > .nav-link");
                    t && t.setAttribute("aria-expanded", "false");
                });
        }));
}
function setupStickyHeader() {
    window.STICKY_BOUND ||
        ((window.STICKY_BOUND = !0),
        window.addEventListener("scroll", () => {
            const e = document.querySelector("header");
            e && e.classList.toggle("scrolled", window.scrollY > 20);
        }));
}
function setupMobileMenu() {
    if (window.MOBILEMENU_BOUND) return;
    window.MOBILEMENU_BOUND = !0;
    const e =
            document.getElementById("site-header") ||
            document.querySelector(".header"),
        a = e ? e.querySelector(".menu-toggle") : null,
        t = e ? e.querySelector(".navbar") : null;
    if (!e || !a || !t) return;
    const n = a.querySelector("i"),
        s = () => {
            document.documentElement.style.setProperty(
                "--header-h",
                `${e.offsetHeight}px`,
            );
        };
    s();
    function l(i) {
        (t.classList.toggle("show", i),
            e.classList.toggle("menu-open", i),
            document.body.classList.toggle("nav-open", i),
            a.setAttribute("aria-expanded", i ? "true" : "false"),
            n &&
                (n.classList.toggle("fa-bars", !i),
                n.classList.toggle("fa-xmark", i)));
    }
    (a.addEventListener("click", (i) => {
        (i.stopPropagation(), l(!t.classList.contains("show")));
    }),
        t.addEventListener("click", (i) => {
            const c = i.target.closest("a");
            !c ||
                (c.classList.contains("nav-link") &&
                    c.closest(".dropdown") &&
                    (!c.dataset.page || c.getAttribute("href") === "#")) ||
                (window.innerWidth <= 900 && l(!1));
        }),
        document.addEventListener("click", (i) => {
            const c = i.target.closest("#site-nav"),
                o = i.target.closest(".menu-toggle");
            !c && !o && t.classList.contains("show") && l(!1);
        }),
        window.addEventListener("resize", () => {
            (s(),
                window.innerWidth > 900 &&
                    t.classList.contains("show") &&
                    l(!1));
        }),
        l(!1));
}
(window.addEventListener("session:changed", () => {
    (updateHeaderAuthButton(), updateGuestOnlySections(document));
    const e = getPageFromHash();
    if (!checkPageAccess(e)) {
        const a = getRole();
        a === "admin"
            ? navigateTo("admin/dashboard", { replace: !0 })
            : a === "staf"
              ? navigateTo("staf/dashboard", { replace: !0 })
              : a === "warga"
                ? navigateTo("warga/dashboard", { replace: !0 })
                : navigateTo("home", { replace: !0 });
    }
}),
    window.addEventListener("session:cleared", () => {
        (updateHeaderAuthButton(),
            updateGuestOnlySections(document),
            (window.location.hash = ""),
            navigateTo("home", { replace: !0 }));
    }),
    window.ROUTER_EVENTS_BOUND ||
        ((window.ROUTER_EVENTS_BOUND = !0),
        window.addEventListener("popstate", () =>
            navigateTo(getPageFromHash(), { replace: !0 }),
        ),
        window.addEventListener("hashchange", () =>
            navigateTo(getPageFromHash(), { replace: !0 }),
        )),
    document.addEventListener("DOMContentLoaded", () => {
        if (!window.LOGIN_HINT_OBS) {
            window.LOGIN_HINT_OBS = !0;
            const e = document.getElementById("content");
            e &&
                window.MutationObserver &&
                new MutationObserver(() => upgradeLoginHints(e)).observe(e, {
                    childList: !0,
                    subtree: !0,
                });
        }
    }),
    document.addEventListener("DOMContentLoaded", () => {
        window.COMPONENTS_LOADED ||
            ((window.COMPONENTS_LOADED = !0), loadComponents());
    }),
    document.addEventListener("DOMContentLoaded", () => {
        if (window.BUTTONS_3D_OBS_BOUND) return;
        window.BUTTONS_3D_OBS_BOUND = !0;
        const e = (t) => {
            var c, o;
            if (
                t.dataset.enhanced3d ||
                t.classList.contains("hero-slider-dot") ||
                t.classList.contains("group-toggle") ||
                t.closest(".navbar") ||
                t.closest(".admin-side")
            )
                return;
            ((t.dataset.enhanced3d = "true"), t.classList.add("btn-3d"));
            let n = "";
            if (
                (Array.from(t.childNodes).forEach((r) => {
                    r.nodeType === Node.TEXT_NODE &&
                        ((n += r.textContent), r.remove());
                }),
                (n = n.trim()),
                n ||
                    (t.classList.contains("btn-warning") ||
                    ((c = t.getAttribute("data-action")) != null &&
                        c.toLowerCase().includes("edit"))
                        ? (n = "Edit")
                        : (t.classList.contains("btn-danger") ||
                              ((o = t.getAttribute("data-action")) != null &&
                                  o.toLowerCase().includes("delete"))) &&
                          (n = "Hapus")),
                !t.querySelector(".btn-text") && n)
            ) {
                const r = document.createElement("span");
                ((r.className = "btn-text"), (r.textContent = n), t.prepend(r));
            }
            if (t.classList.contains("btn-warning")) {
                if (
                    (t.classList.add("btn-edit"),
                    !t.querySelector("i") && !t.querySelector("svg"))
                ) {
                    const r = document.createElement("i");
                    ((r.className = "fa-solid fa-pen"), t.appendChild(r));
                }
            } else if (t.classList.contains("btn-danger")) {
                if (
                    (t.classList.add("btn-hapus"),
                    !t.querySelector("i") && !t.querySelector("svg"))
                ) {
                    const r = document.createElement("i");
                    ((r.className = "fa-solid fa-trash"), t.appendChild(r));
                }
            } else if (
                t.classList.contains("btn-primary") ||
                t.classList.contains("btn-solid")
            ) {
                if (
                    (t.classList.add("btn-tambah-data"),
                    !t.querySelector("i") && !t.querySelector("svg"))
                ) {
                    const r = document.createElement("i");
                    ((r.className = "fa-solid fa-plus"), t.appendChild(r));
                }
            } else if (
                t.classList.contains("btn-light") &&
                n.toLowerCase().includes("foto") &&
                (t.classList.add("btn-pilih-foto"),
                !t.querySelector("i") && !t.querySelector("svg"))
            ) {
                const r = document.createElement("i");
                ((r.className = "fa-solid fa-camera"), t.appendChild(r));
            }
            const i = t.querySelector("i, svg");
            i && t.lastChild !== i && t.appendChild(i);
        };
        (document
            .querySelectorAll(
                ".btn-warning, .btn-danger, .btn-primary, .btn-solid, .btn-light",
            )
            .forEach(e),
            new MutationObserver((t) => {
                t.forEach((n) => {
                    n.addedNodes &&
                        n.addedNodes.forEach((s) => {
                            if (s.nodeType !== Node.ELEMENT_NODE) return;
                            let l = [];
                            (s.matches &&
                                s.matches(
                                    ".btn-warning, .btn-danger, .btn-primary, .btn-solid, .btn-light",
                                ) &&
                                l.push(s),
                                s.querySelectorAll &&
                                    l.push(
                                        ...s.querySelectorAll(
                                            ".btn-warning, .btn-danger, .btn-primary, .btn-solid, .btn-light",
                                        ),
                                    ),
                                l.forEach(e));
                        });
                });
            }).observe(document.body, { childList: !0, subtree: !0 }));
    }));

/* === MERGED FINAL UI RESPONSIVE FIX JS === */
/* =====================================================================
   FINAL UI RESPONSIVE FIX JS
   - Menambahkan panel kiri auth jika belum ada.
   - Memastikan side menu role bisa ditutup/dibuka pada <=1024px.
===================================================================== */
(function () {
    "use strict";

    const ROLE_SIDE_SELECTOR = ".admin-side, .staf-side, .warga-side";
    const TOGGLE_SELECTOR =
        ".admin-toggle, .staf-toggle, .warga-toggle, .side-toggle, .mobile-side-toggle, .sidebar-toggle";

    function isAuthPage() {
        const key = `${location.pathname} ${location.hash}`.toLowerCase();
        return (
            key.includes("login") ||
            key.includes("register") ||
            key.includes("forgot") ||
            key.includes("reset") ||
            key.includes("otp")
        );
    }

    function enhanceAuthCard() {
        if (!isAuthPage()) return;
        const page = document.querySelector(".auth-page");
        const card = document.querySelector(".auth-page .auth-card");
        if (!page || !card || card.dataset.finalAuthEnhanced === "true") return;

        const hasSide = card.querySelector(
            ".auth-blue-side, .auth-side, .auth-brand-panel",
        );
        if (hasSide) {
            card.dataset.finalAuthEnhanced = "true";
            return;
        }

        const currentChildren = Array.from(card.childNodes);
        const side = document.createElement("aside");
        side.className = "auth-blue-side";
        side.innerHTML = `
            <div class="auth-blue-brand">
                <div class="auth-blue-logo">
                    <img src="/assets/images/Lambang_Kota_Depok.png" alt="Logo Kota Depok">
                </div>
                <div>
                    <strong class="auth-blue-name">Kelurahan Duren Mekar</strong>
                    <small class="auth-blue-address">Kecamatan Bojongsari, Kota Depok</small>
                </div>
            </div>
            <div class="auth-blue-copy">
                <span class="auth-blue-kicker">Portal Pelayanan</span>
                <h2 class="auth-blue-title">Selamat Datang di Portal Kelurahan</h2>
                <p class="auth-blue-desc">Akses layanan administrasi, pengajuan surat, pengaduan warga, dan informasi resmi secara aman dan terpadu.</p>
            </div>
            <div class="auth-blue-security">
                <div class="auth-blue-sec-item"><i class="fa-solid fa-shield-halved"></i><div><strong>Aman</strong><small>Data terlindungi</small></div></div>
                <div class="auth-blue-sec-item"><i class="fa-solid fa-clock"></i><div><strong>Cepat</strong><small>Layanan online</small></div></div>
            </div>
        `;

        const wrap = document.createElement("div");
        wrap.className = "auth-blue-form-wrap";
        const inner = document.createElement("div");
        inner.className = "auth-blue-form-inner";
        currentChildren.forEach((node) => inner.appendChild(node));
        wrap.appendChild(inner);

        card.appendChild(side);
        card.appendChild(wrap);
        card.dataset.finalAuthEnhanced = "true";
    }

    function closeSideMenu() {
        document.body.classList.remove("side-open");
        document.querySelectorAll(TOGGLE_SELECTOR).forEach((btn) => {
            if (btn.setAttribute) btn.setAttribute("aria-expanded", "false");
        });
    }

    function openSideMenu() {
        document.body.classList.add("side-open");
        document.querySelectorAll(TOGGLE_SELECTOR).forEach((btn) => {
            if (btn.setAttribute) btn.setAttribute("aria-expanded", "true");
        });
    }

    function toggleSideMenu() {
        if (document.body.classList.contains("side-open")) closeSideMenu();
        else openSideMenu();
    }

    function bindSideMenu() {
        if (window.__finalSideMenuBound) return;
        window.__finalSideMenuBound = true;

        document.addEventListener(
            "click",
            function (event) {
                const toggle = event.target.closest(TOGGLE_SELECTOR);
                const side = event.target.closest(ROLE_SIDE_SELECTOR);
                const linkInsideSide = event.target.closest(
                    `${ROLE_SIDE_SELECTOR} a`,
                );

                if (
                    toggle &&
                    document.querySelector(ROLE_SIDE_SELECTOR) &&
                    window.innerWidth <= 800
                ) {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleSideMenu();
                    return;
                }

                if (linkInsideSide && window.innerWidth <= 800) {
                    setTimeout(closeSideMenu, 80);
                    return;
                }

                if (
                    document.body.classList.contains("side-open") &&
                    !side &&
                    window.innerWidth <= 800
                ) {
                    closeSideMenu();
                }
            },
            true,
        );

        window.addEventListener("resize", function () {
            if (window.innerWidth > 800) closeSideMenu();
        });

        window.addEventListener("hashchange", closeSideMenu);
        window.addEventListener("popstate", closeSideMenu);
        document.addEventListener("page:loaded", closeSideMenu);
    }

    function ensureSideToggle() {
        if (!document.querySelector(ROLE_SIDE_SELECTOR)) return;
        const top = document.querySelector(".admin-top, .staf-top, .warga-top");
        if (!top) return;
        if (top.querySelector(".side-toggle")) return;
        let actions = top.querySelector(".top-actions");
        if (!actions) {
            actions = document.createElement("div");
            actions.className = "top-actions";
            top.appendChild(actions);
        }
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "side-toggle";
        btn.setAttribute("aria-label", "Buka menu samping");
        btn.setAttribute("aria-expanded", "false");
        btn.innerHTML =
            '<i class="fa-solid fa-bars" aria-hidden="true"></i><span>Menu</span>';
        actions.insertBefore(btn, actions.firstChild);

        /* Hide/show based on screen width - only visible at <=800px */
        function updateToggleVisibility() {
            btn.style.display = window.innerWidth > 800 ? "none" : "inline-flex";
        }
        updateToggleVisibility();
        window.addEventListener("resize", updateToggleVisibility);
    }

    function run() {
        enhanceAuthCard();
        ensureSideToggle();
        bindSideMenu();
    }

    document.addEventListener("DOMContentLoaded", run);
    document.addEventListener("page:loaded", function () {
        setTimeout(run, 60);
        setTimeout(enhanceAuthCard, 300);
    });
    window.addEventListener("hashchange", function () {
        setTimeout(run, 120);
    });
    window.addEventListener("load", run);
})();
