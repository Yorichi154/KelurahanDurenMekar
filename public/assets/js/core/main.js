// assets/js/core/main.js
const APP_BASE = (() => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (!parts.length) return "/";
    if (parts[0].includes(".html")) return "/";
    return `/${parts[0]}/`;
})();

// ==============================
// SESSION HELPERS (via Guard)
// ==============================
function getSessionUser() {
    if (
        window.KelurahanGuard &&
        typeof window.KelurahanGuard.getSession === "function"
    ) {
        return window.KelurahanGuard.getSession();
    }
    try {
        const raw = sessionStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function getRole() {
    if (
        window.KelurahanGuard &&
        typeof window.KelurahanGuard.getRole === "function"
    ) {
        return window.KelurahanGuard.getRole();
    }
    return getSessionUser()?.role || "";
}

function getUserName() {
    return getSessionUser()?.name || "";
}

function isAuthenticated() {
    if (
        window.KelurahanGuard &&
        typeof window.KelurahanGuard.isAuthenticated === "function"
    ) {
        return window.KelurahanGuard.isAuthenticated();
    }
    return !!getSessionUser();
}

// ==============================
// HEADER AUTH BUTTON
// ==============================
function formatUserLabel(name, role) {
    const n = String(name || "").trim();
    const r = String(role || "")
        .trim()
        .toLowerCase();
    if (!n || !r) return "";
    if (r === "warga") return n;
    if (r === "admin" || r === "staf") return `${n} (${r})`;
    return `${n} (${r})`;
}

function updateHeaderAuthButton() {
    const btn = document.querySelector("a.btn-login");
    if (!btn) return;
    const role = getRole();
    const name = getUserName();
    const span = btn.querySelector("span");
    const icon = btn.querySelector("i");

    if (role && name) {
        const label = formatUserLabel(name, role);
        if (span) span.textContent = label || name;
        if (icon) {
            icon.classList.remove("fa-right-to-bracket");
            icon.classList.add("fa-user");
        }
        const target = `${role}/dashboard`;
        btn.setAttribute("href", `#${target}`);
        btn.dataset.page = target;
        btn.setAttribute("aria-label", `Akun: ${label || name}`);
        btn.classList.add("is-auth");
    } else {
        if (span) span.textContent = "Login";
        if (icon) {
            icon.classList.remove("fa-user");
            icon.classList.add("fa-right-to-bracket");
        }
        btn.setAttribute("href", "#login");
        btn.dataset.page = "login";
        btn.setAttribute("aria-label", "Login");
        btn.classList.remove("is-auth");
    }
}

function updateGuestOnlySections(root = document) {
    const loggedIn = isAuthenticated();
    const selectors = [
        ".hero-actions",
        "#heroGuestActions",
        ".home-cta",
        ".home-cta .cta-actions",
    ];
    const seen = new Set();
    selectors.forEach((sel) => {
        root.querySelectorAll(sel).forEach((el) => seen.add(el));
    });

    seen.forEach((el) => {
        if (el.classList.contains("home-cta")) {
            el.style.display = loggedIn ? "none" : "";
            el.toggleAttribute("hidden", loggedIn);
            el.setAttribute("aria-hidden", loggedIn ? "true" : "false");
            return;
        }
        el.style.display = loggedIn ? "none" : "";
        el.toggleAttribute("hidden", loggedIn);
        el.setAttribute("aria-hidden", loggedIn ? "true" : "false");
    });
}

// ==============================
// FETCH HELPERS
// ==============================
async function fetchFirstOk(urls) {
    for (let url of urls) {
        if (!url.startsWith("http") && !url.startsWith("/")) {
            url = APP_BASE + url;
        }
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) return await res.text();
    }
    throw new Error("Semua path gagal: " + urls.join(" | "));
}

function normalizePage(raw) {
    return (
        (raw || "")
            .replace(/^#/, "")
            .replace(/^[?/]+/, "")
            .trim() || "home"
    );
}

function getPageFromHash() {
    return normalizePage(window.location.hash);
}

// ==============================
// UX HELPERS
// ==============================
function upgradeLoginHints(root = document) {
    const cells = root.querySelectorAll("td");
    cells.forEach((td) => {
        const t = (td.textContent || "").trim().toLowerCase();
        if (!t) return;
        const match =
            t === "login untuk lihat" ||
            t === "login untuk melihat" ||
            t === "login untuk melihat data kontak." ||
            t === "login untuk melihat data kontak";
        if (!match) return;
        if (td.querySelector("a[data-page='login']")) return;
        td.innerHTML = `<div class="muted" style="display:flex;align-items:center;gap:10px;justify-content:center;padding:10px 0"><span>Login untuk lihat</span><a class="btn btn-primary btn-sm nav-link" href="#login" data-page="login"><i class="fa-solid fa-right-to-bracket"></i> Login</a></div>`;
    });
}

function syncResponsiveTables(root = document) {
    const tables = root.querySelectorAll("table.table, table.warga-table");
    tables.forEach((table) => {
        const heads = Array.from(table.querySelectorAll("thead th")).map((th) =>
            (th.textContent || "").trim(),
        );
        if (!heads.length) return;
        table.querySelectorAll("tbody tr").forEach((tr) => {
            const cells = Array.from(tr.children).filter(
                (el) => el.tagName === "TD",
            );
            cells.forEach((td, i) => {
                const label = heads[i] || "";
                if (label) td.dataset.label = label;
            });
        });
    });
}

function installTableObserver(containerEl) {
    try {
        if (window.TABLE_OBSERVER) {
            window.TABLE_OBSERVER.disconnect();
            window.TABLE_OBSERVER = null;
        }
        syncResponsiveTables(containerEl);
        let raf = 0;
        const obs = new MutationObserver(() => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                syncResponsiveTables(containerEl);
            });
        });
        obs.observe(containerEl, { childList: true, subtree: true });
        window.__TABLE_OBSERVER__ = obs;
    } catch (e) {
        console.warn("Table observer failed:", e);
    }
}
window.syncResponsiveTables = syncResponsiveTables;

// ==============================
// LOAD COMPONENTS
// ==============================
async function loadComponents() {
    try {
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
        if (headerEl) headerEl.innerHTML = headerHTML;
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
    }
}

// ==============================
// PAGE RESOLVER
// ==============================
async function loadPageHtml(page) {
    const lembagaPages = ["rt", "rw", "pkk", "karang-taruna", "lpmk"];
    let candidates = [];

    if (page === "home") {
        candidates = [`pages/public/home.html`, `pages/home.html`];
    } else if (page === "login") {
        candidates = [
            `pages/auth/login.html`,
            `pages/public/login.html`,
            `pages/login.html`,
        ];
    } else if (page.startsWith("admin/")) {
        candidates = [`pages/${page}.html`];
    } else if (page.startsWith("staf/")) {
        candidates = [`pages/${page}.html`];
    } else if (page.startsWith("warga/")) {
        candidates = [`pages/${page}.html`];
    } else if (!page.includes("/") && lembagaPages.includes(page)) {
        candidates = [
            `pages/public/lembaga-kemasyarakatan/${page}.html`,
            `pages/public/${page}.html`,
        ];
    } else if (!page.includes("/") && page.startsWith("unit-")) {
        candidates = [
            `pages/public/unit-kerja/${page}.html`,
            `pages/public/${page}.html`,
        ];
    } else if (!page.includes("/") && page.startsWith("pelayanan-")) {
        candidates = [
            `pages/public/pelayanan/detail.html`,
            `pages/public/${page}.html`,
        ];
    } else if (page === "pengajuan-online") {
        candidates = [
            `pages/public/pelayanan/pengajuan-online.html`,
            `pages/auth/pengajuan-online.html`,
        ];
    } else if (
        [
            "kontak",
            "berita",
            "pengumuman",
            "agenda",
            "galeri",
            "pelayanan",
            "profil-kelurahan",
        ].includes(page)
    ) {
        candidates = [`pages/public/${page}.html`, `pages/${page}.html`];
    } else {
        candidates = [
            `pages/${page}.html`,
            `pages/public/${page}.html`,
            `pages/auth/${page}.html`,
        ];
    }

    return await fetchFirstOk(candidates);
}

// ==============================
// STRICT ROUTE PROTECTION
// ==============================
const routeRoles = {
    // Admin routes (STRICT: Hanya admin)
    "admin/dashboard": ["admin"],
    "admin/pengaduan": ["admin"],
    "admin/surat": ["admin"],
    "admin/pelayanan": ["admin"],
    "admin/galeri": ["admin"],
    "admin/agenda": ["admin"],
    "admin/pengumuman": ["admin"],
    "admin/rtrw": ["admin"],
    "admin/faq": ["admin"],
    "admin/lembaga": ["admin"],
    "admin/unit-kerja": ["admin"],
    "admin/laporan": ["admin"],
    "admin/profil": ["admin"],

    // Staf routes (STRICT: Hanya staf)
    "staf/dashboard": ["staf"],
    "staf/pengaduan": ["staf"],
    "staf/surat": ["staf"],
    "staf/laporan": ["staf"],
    "staf/profil": ["staf"],

    // Warga routes (STRICT: Hanya warga)
    "warga/dashboard": ["warga"],
    "warga/surat": ["warga"],
    "warga/pengaduan": ["warga"],
    "warga/profil": ["warga"],
    "warga/konfirmasi": ["warga"],
    "pengajuan-online": ["warga"],

    // Public routes
    home: null,
    login: null,
    kontak: null,
    galeri: null,
    pengumuman: null,
    agenda: null,
    pelayanan: null,
    unauthorized: null,
};

function checkPageAccess(page) {
    const allowedRoles = routeRoles[page];
    if (allowedRoles === null) return true;
    if (!allowedRoles) return true;
    if (!isAuthenticated()) return false;
    const userRole = getRole();
    return allowedRoles.includes(userRole);
}

// ==============================
// ROUTER + GUARD
// ==============================
async function navigateTo(page, opts = {}) {
    try {
        page = normalizePage(page) || "home";

        // CHECK ACCESS
        if (!checkPageAccess(page)) {
            const role = getRole();
            if (!role) {
                page = "login";
            } else if (role === "admin") {
                page = "admin/dashboard";
            } else if (role === "staf") {
                page = "staf/dashboard";
            } else if (role === "warga") {
                page = "warga/dashboard";
            } else {
                page = "login";
            }
        }

        if (page === "pengajuan-online" && getRole() !== "warga") {
            page = "login";
        }

        const html = await loadPageHtml(page);
        const content = document.getElementById("content");
        if (!content) throw new Error("#content tidak ditemukan");

        content.innerHTML = html;
        installTableObserver(content);

        window.dispatchEvent(
            new CustomEvent("page:loaded", { detail: { name: page } }),
        );

        upgradeLoginHints(content);

        // Close mobile menu if open
        const header =
            document.getElementById("site-header") ||
            document.querySelector(".header");
        if (header) {
            const nav = header.querySelector(".navbar");
            const toggle = header.querySelector(".menu-toggle");
            const icon = toggle ? toggle.querySelector("i") : null;
            if (nav) nav.classList.remove("show");
            if (toggle) toggle.setAttribute("aria-expanded", "false");
            document.body.classList.remove("nav-open");
            if (icon) {
                icon.classList.add("fa-bars");
                icon.classList.remove("fa-xmark");
            }
        }

        // Update URL hash
        const newHash = `#${page}`;
        if (opts.replace) {
            history.replaceState({}, "", newHash);
        } else {
            history.pushState({}, "", newHash);
        }

        // Update active nav
        document.querySelectorAll(".nav-link").forEach((link) => {
            if (link.dataset.page) {
                // If it's a direct page link, toggle based on page match
                link.classList.toggle("active", link.dataset.page === page);
            } else {
                // If it's a dropdown trigger, check if any of its dropdown menu items matches the current page
                const dropdown = link.closest(".dropdown");
                if (dropdown) {
                    const hasActiveChild = !!dropdown.querySelector(`[data-page="${page}"]`);
                    link.classList.toggle("active", hasActiveChild);
                }
            }
        });

        // Update active dropdown items
        document.querySelectorAll(".dropdown-item[data-page]").forEach((item) => {
            if (item.dataset.page === "layanan") {
                let activeLayanan = "surat";
                const selectEl = document.getElementById("layananSelect");
                if (selectEl && page === "layanan") {
                    activeLayanan = selectEl.value;
                } else {
                    const preset = sessionStorage.getItem("layananPreset");
                    if (preset) {
                        activeLayanan = preset;
                    }
                }
                const isActive = item.dataset.layanan === activeLayanan.toLowerCase();
                item.classList.toggle("active", page === "layanan" && isActive);
            } else {
                item.classList.toggle("active", item.dataset.page === page);
            }
        });

        // Update user name binding
        const nameEl = document.querySelector("[data-bind='userName']");
        if (nameEl) nameEl.textContent = getUserName();

        updateHeaderAuthButton();
        updateGuestOnlySections(content);

        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
        console.error("navigateTo error:", err);
        const content = document.getElementById("content");
        if (content) {
            content.innerHTML = `<div class="error" style="padding:24px;max-width:900px;margin:0 auto;">${err.message}<br><br><small>Cek Network/Console untuk path yang 404.</small></div>`;
        }
    }
}
window.navigateTo = navigateTo;

// ==============================
// NAVIGATION SETUP
// ==============================
function setupNavigation() {
    if (window.NAVIGATION_BOUND) return;
    window.NAVIGATION_BOUND = true;

    document.addEventListener("click", (e) => {
        const link = e.target.closest("a[data-page]");
        if (!link) return;

        e.preventDefault();

        const dd = link.closest(".dropdown");
        if (dd) dd.classList.remove("open");

        if (link.dataset.layanan) {
            sessionStorage.setItem("layananPreset", link.dataset.layanan);
        }

        navigateTo(link.dataset.page);
    });

    document.addEventListener("click", (e) => {
        const brand = e.target.closest("[data-go-home='true']");
        if (!brand) return;
        e.preventDefault();
        navigateTo("home");
    });
}

// ==============================
// DROPDOWN SETUP
// ==============================
function setupDropdowns() {
    if (window.DROPDOWNS_BOUND) return;
    window.DROPDOWNS_BOUND = true;

    document.addEventListener("click", (e) => {
        const trigger = e.target.closest(".dropdown > .nav-link");
        const insideDropdown = e.target.closest(".dropdown");

        if (trigger) {
            e.preventDefault();
            const dd = trigger.closest(".dropdown");

            document.querySelectorAll(".dropdown.open").forEach((x) => {
                if (x !== dd) {
                    x.classList.remove("open");
                    const t = x.querySelector(":scope > .nav-link");
                    if (t) t.setAttribute("aria-expanded", "false");
                }
            });

            dd.classList.toggle("open");
            trigger.setAttribute(
                "aria-expanded",
                dd.classList.contains("open") ? "true" : "false",
            );
            return;
        }

        if (!insideDropdown) {
            document.querySelectorAll(".dropdown.open").forEach((x) => {
                x.classList.remove("open");
                const t = x.querySelector(":scope > .nav-link");
                if (t) t.setAttribute("aria-expanded", "false");
            });
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            document.querySelectorAll(".dropdown.open").forEach((x) => {
                x.classList.remove("open");
                const t = x.querySelector(":scope > .nav-link");
                if (t) t.setAttribute("aria-expanded", "false");
            });
        }
    });
}

// ==============================
// STICKY HEADER
// ==============================
function setupStickyHeader() {
    if (window.STICKY_BOUND) return;
    window.STICKY_BOUND = true;

    window.addEventListener("scroll", () => {
        const header = document.querySelector("header");
        if (!header) return;
        header.classList.toggle("scrolled", window.scrollY > 20);
    });
}

// ==============================
// MOBILE MENU
// ==============================
function setupMobileMenu() {
    if (window.MOBILEMENU_BOUND) return;
    window.MOBILEMENU_BOUND = true;

    const header =
        document.getElementById("site-header") ||
        document.querySelector(".header");
    const toggle = header ? header.querySelector(".menu-toggle") : null;
    const nav = header ? header.querySelector(".navbar") : null;

    if (!header || !toggle || !nav) return;

    const icon = toggle.querySelector("i");

    const syncHeaderHeight = () => {
        document.documentElement.style.setProperty(
            "--header-h",
            `${header.offsetHeight}px`,
        );
    };
    syncHeaderHeight();

    function setOpen(open) {
        nav.classList.toggle("show", open);
        header.classList.toggle("menu-open", open);
        document.body.classList.toggle("nav-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");

        if (icon) {
            icon.classList.toggle("fa-bars", !open);
            icon.classList.toggle("fa-xmark", open);
        }
    }

    toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        setOpen(!nav.classList.contains("show"));
    });

    nav.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (!link) return;

        const isDropdownTrigger =
            link.classList.contains("nav-link") &&
            !!link.closest(".dropdown") &&
            (!link.dataset.page || link.getAttribute("href") === "#");

        if (isDropdownTrigger) return;

        if (window.innerWidth <= 900) setOpen(false);
    });

    document.addEventListener("click", (e) => {
        const insideNav = e.target.closest("#site-nav");
        const onToggle = e.target.closest(".menu-toggle");
        if (!insideNav && !onToggle && nav.classList.contains("show")) {
            setOpen(false);
        }
    });

    window.addEventListener("resize", () => {
        syncHeaderHeight();
        if (window.innerWidth > 900 && nav.classList.contains("show")) {
            setOpen(false);
        }
    });

    setOpen(false);
}

// ==============================
// LOGOUT HANDLER
// ==============================
document.addEventListener("click", async (e) => {
    const logoutBtn = e.target.closest('[data-action="logout"]');
    if (!logoutBtn) return;
    e.preventDefault();

    try {
        const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
        await fetch("/logout", {
            method: "POST",
            headers: {
                "X-CSRF-TOKEN": csrf,
                "X-Requested-With": "XMLHttpRequest",
                Accept: "application/json",
            },
            credentials: "include",
        });
    } catch (err) {
        console.error("Logout API error:", err);
    }

    if (
        window.KelurahanGuard &&
        typeof window.KelurahanGuard.clearSession === "function"
    ) {
        window.KelurahanGuard.clearSession();
    } else {
        sessionStorage.clear();
    }

    window.location.hash = "#login";
});

// ==============================
// SESSION CHANGE LISTENERS
// ==============================
window.addEventListener("session:changed", () => {
    updateHeaderAuthButton();
    updateGuestOnlySections(document);
    const currentPage = getPageFromHash();
    if (!checkPageAccess(currentPage)) {
        const role = getRole();
        if (role === "admin") navigateTo("admin/dashboard", { replace: true });
        else if (role === "staf")
            navigateTo("staf/dashboard", { replace: true });
        else if (role === "warga")
            navigateTo("warga/dashboard", { replace: true });
        else navigateTo("home", { replace: true });
    }
});

window.addEventListener("session:cleared", () => {
    updateHeaderAuthButton();
    updateGuestOnlySections(document);
    navigateTo("home", { replace: true });
});

// ==============================
// ROUTER EVENTS
// ==============================
if (!window.ROUTER_EVENTS_BOUND) {
    window.ROUTER_EVENTS_BOUND = true;
    window.addEventListener("popstate", () =>
        navigateTo(getPageFromHash(), { replace: true }),
    );
    window.addEventListener("hashchange", () =>
        navigateTo(getPageFromHash(), { replace: true }),
    );
}

// ==============================
// INIT
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    if (!window.LOGIN_HINT_OBS) {
        window.LOGIN_HINT_OBS = true;
        const root = document.getElementById("content");
        if (root && window.MutationObserver) {
            const mo = new MutationObserver(() => upgradeLoginHints(root));
            mo.observe(root, { childList: true, subtree: true });
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    if (window.COMPONENTS_LOADED) return;
    window.COMPONENTS_LOADED = true;
    loadComponents();
});
