<<<<<<< HEAD
(function(){"use strict";function y(e){if(!e)return"";try{return new Date(e).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}catch(s){return e}}async function w(){var t;const e=document.getElementById("homeStafTrack"),s=document.getElementById("homeStafDots"),i=document.getElementById("homeStafPrev"),l=document.getElementById("homeStafNext");if(!e)return;const c=["/api/public/struktur-organisasi","/api/admin/struktur-organisasi"];let d=null;for(const a of c)try{const n=await fetch(a,{headers:{Accept:"application/json"},credentials:"include"});if(!n.ok)continue;d=await n.json();break}catch(n){console.warn("Staf endpoint gagal:",a,n)}if(!d){e.innerHTML=`
=======
/* =================================================================
   HOME SECTIONS JS
   Tambahan seksi untuk halaman home:
   - Staf Kelurahan (slideshow)
   - Visi & Misi (dari settings API)
   - Galeri Home (thumbnail grid)
   - Pengumuman Home (list)
   
   Cara pasang: tambahkan di public.blade.php setelah public.js
   <script src="/assets/js/public/home_sections.js" defer></script>
================================================================= */

(function () {
    "use strict";

    /* ----------------------------------------------------------------
       HELPER: format tanggal
    ---------------------------------------------------------------- */
    function fmtDate(str) {
        if (!str) return "";
        try {
            return new Date(str).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        } catch (e) {
            return str;
        }
    }

    /* ----------------------------------------------------------------
       STAF KELURAHAN — slideshow horizontal
    ---------------------------------------------------------------- */
    async function loadHomeStaf() {
        const track = document.getElementById("homeStafTrack");
        const dotsWrap = document.getElementById("homeStafDots");
        const prevBtn = document.getElementById("homeStafPrev");
        const nextBtn = document.getElementById("homeStafNext");
        if (!track) return;

        // Coba beberapa endpoint
        const ENDPOINTS = [
            "/api/public/struktur-organisasi",
            "/api/admin/struktur-organisasi",
        ];

        let raw = null;
        for (const url of ENDPOINTS) {
            try {
                const res = await fetch(url, {
                    headers: { Accept: "application/json" },
                    credentials: "include",
                });
                if (!res.ok) continue;
                raw = await res.json();
                break;
            } catch (e) {
                console.warn("Staf endpoint gagal:", url, e);
            }
        }

        // Jika semua endpoint gagal, tampilkan placeholder
        if (!raw) {
            track.innerHTML = `
>>>>>>> f095065e321e32c52ed71452dd74841c27579e72
                <div class="staf-card">
                    <div class="staf-photo"><i class="fa-solid fa-user staf-avatar-icon"></i></div>
                    <div class="staf-info">
                        <div class="staf-nama">Data belum tersedia</div>
                        <div class="staf-jabatan">Tambahkan staf di halaman admin</div>
                    </div>
<<<<<<< HEAD
                </div>`;return}try{let h=function(o){var g;m=Math.max(0,Math.min(o,r));const u=((g=e.querySelector(".staf-card"))==null?void 0:g.offsetWidth)||180,f=16;if(e.style.transform=`translateX(-${m*(u+f)}px)`,s){const k=Math.floor(m/n);s.querySelectorAll(".staf-dot").forEach((E,L)=>E.classList.toggle("active",L===k))}};const a=(Array.isArray(d)?d:(t=d==null?void 0:d.data)!=null?t:[]).filter(o=>o.aktif!==!1).sort((o,u)=>{var f,g;return((f=o.urutan)!=null?f:999)-((g=u.urutan)!=null?g:999)});if(!a.length){e.innerHTML='<div class="staf-empty"><i class="fa-solid fa-users-slash"></i><p>Belum ada data staf</p></div>';return}e.innerHTML=a.map(o=>{const u=o.foto?o.foto.startsWith("/storage/")||o.foto.startsWith("http")?o.foto:"/storage/"+o.foto:"";return`
                <div class="staf-card">
                    <div class="staf-photo">${u?`<img src="${u}" alt="${o.nama}" onerror="this.onerror=null;this.src='';this.parentNode.innerHTML='<i class='fa-solid fa-user staf-avatar-icon'></i>'">`:'<i class="fa-solid fa-user staf-avatar-icon"></i>'}</div>
                    <div class="staf-info">
                        <div class="staf-nama">${o.nama}</div>
                        <div class="staf-jabatan">${o.jabatan}</div>
                    </div>
                </div>`}).join("");const n=3,r=Math.max(0,a.length-n);let m=0;if(s){const o=Math.ceil(a.length/n);s.innerHTML=Array.from({length:o},(u,f)=>`<button class="staf-dot${f===0?" active":""}" data-idx="${f}"></button>`).join(""),s.querySelectorAll(".staf-dot").forEach(u=>{u.addEventListener("click",()=>{const f=parseInt(u.dataset.idx)*n;h(Math.min(f,r))})})}i&&i.addEventListener("click",()=>h(m-1)),l&&l.addEventListener("click",()=>h(m+1));let v=setInterval(()=>{if(!document.getElementById("homeStafTrack")){clearInterval(v);return}const o=m>=r?0:m+1;h(o)},5e3)}catch(a){console.error("Gagal memuat staf:",a),e&&(e.innerHTML='<div class="staf-empty"><i class="fa-solid fa-exclamation-triangle"></i><p>Gagal memuat data staf</p></div>')}}async function I(){var t;const e=document.getElementById("homeVisiText"),s=document.getElementById("homeMisiList");if(!e&&!s)return;const i="Terwujudnya Kelurahan Duren Mekar yang maju, berdaya, dan berbudaya.",l=["Meningkatkan kualitas pelayanan publik yang cepat dan transparan.","Memberdayakan masyarakat dalam pembangunan kelurahan.","Mewujudkan lingkungan yang bersih, aman, dan tertib."];function c(a,n){if(e&&(e.textContent=a||i),s){const r=n.length?n:l;s.innerHTML=r.map(m=>`<li><i class="fa-solid fa-check" aria-hidden="true"></i><span>${m}</span></li>`).join("")}}c(i,l);const d=["/api/public/setting","/api/admin/setting"];for(const a of d)try{const n=await fetch(a,{headers:{Accept:"application/json"},credentials:"include"});if(!n.ok)continue;const r=await n.json(),m=Array.isArray(r)?r[0]:r!=null&&r.data?(t=r.data[0])!=null?t:r.data:r;if(!m)continue;const h=m.visi||"",o=(m.misi||"").split(`
`).map(u=>u.replace(/^[-*\d.]+\s*/,"").trim()).filter(Boolean);c(h||i,o);break}catch(n){console.warn("Visi misi endpoint gagal:",a,n)}}async function S(){const e=document.getElementById("homeGaleriGrid");if(!e)return;const s=6;try{const i=await fetch("/api/public/galeri",{credentials:"include",headers:{Accept:"application/json"}});if(!i.ok)throw new Error("HTTP "+i.status);const l=await i.json(),c=Array.isArray(l)?l:[];if(!c.length){e.innerHTML='<div class="empty-card" style="grid-column:1/-1">Belum ada foto galeri.</div>';return}const d=c.slice(0,s);if(e.innerHTML=d.map(t=>`
                <div class="home-galeri-item" onclick="window.navigateTo('galeri')" style="cursor:pointer;">
                    <img src="${t.image||(t.foto?"/storage/"+t.foto:"")}" alt="${t.title||""}" loading="lazy">
                    <div class="home-galeri-caption">${t.title||""}</div>
                </div>`).join(""),c.length>s){const t=document.createElement("div");t.className="galeri-more-btn",t.innerHTML=`<a class="btn btn-ghost nav-link" href="#galeri" data-page="galeri"><i class="fa-regular fa-images"></i> Lihat Semua ${c.length} Foto</a>`,e.parentElement.appendChild(t)}}catch(i){console.error("Gagal memuat galeri home:",i),e.innerHTML='<div class="empty-card" style="grid-column:1/-1">Gagal memuat galeri.</div>'}}async function T(){const e=document.getElementById("homePengumumanList");if(!e)return;const s=4;try{const i=await fetch("/api/public/pengumuman",{credentials:"include",headers:{Accept:"application/json"}});if(!i.ok)throw new Error("HTTP "+i.status);const l=await i.json(),c=(Array.isArray(l)?l:[]).sort((t,a)=>(a.date||"").localeCompare(t.date||""));if(!c.length){e.innerHTML='<div class="empty-card">Belum ada pengumuman.</div>';return}const d=c.slice(0,s);if(e.innerHTML=d.map(t=>{const a=t.kategori||"Info",r={info:"#3b82f6",penting:"#ef4444",kegiatan:"#10b981",pengumuman:"#f59e0b"}[a.toLowerCase()]||"#6366f1";return`
                <div class="home-peng-item">
                    <div class="home-peng-left">
                        <span class="home-peng-badge" style="background:${r}20;color:${r}">${a.toUpperCase()}</span>
                        <div class="home-peng-title">${t.title||"(Tanpa judul)"}</div>
                        <div class="home-peng-date"><i class="fa-regular fa-calendar"></i> ${y(t.date||t.created_at)}</div>
                    </div>
                    <i class="fa-solid fa-chevron-right home-peng-arrow"></i>
                </div>`}).join(""),c.length>s){const t=document.createElement("div");t.className="peng-more-btn",t.innerHTML=`<a class="btn btn-ghost nav-link" href="#pengumuman" data-page="pengumuman"><i class="fa-solid fa-bullhorn"></i> Lihat Semua ${c.length} Pengumuman</a>`,e.parentElement.appendChild(t)}e.querySelectorAll(".home-peng-item").forEach(t=>{t.style.cursor="pointer",t.addEventListener("click",()=>window.navigateTo("pengumuman"))})}catch(i){console.error("Gagal memuat pengumuman home:",i),e.innerHTML='<div class="empty-card">Gagal memuat pengumuman.</div>'}}function b(){const e=window.setInterval,s=new MutationObserver(()=>{const l=document.getElementById("heroSlidesTrack");if(l&&l.querySelectorAll(".hero-slide").length>1){let a=function(n){t=n,l.style.transform=`translateX(-${t*100}%)`,d&&d.querySelectorAll(".hero-slider-dot").forEach((r,m)=>r.classList.toggle("active",m===n))};s.disconnect(),window.heroSliderInterval&&(clearInterval(window.heroSliderInterval),window.heroSliderInterval=null);const c=l.querySelectorAll(".hero-slide"),d=document.getElementById("heroSliderDots");let t=0;window.heroSliderInterval=setInterval(()=>{if(!document.getElementById("heroSlidesTrack")){clearInterval(window.heroSliderInterval);return}a((t+1)%c.length)},5e3)}}),i=document.getElementById("heroSlider");i&&s.observe(i,{childList:!0,subtree:!0})}function p(){!document.getElementById("homeStafTrack")&&!document.getElementById("homeGaleriGrid")||(w(),I(),S(),T(),b())}window.addEventListener("hashchange",()=>{const e=location.hash.replace("#","")||"home";(e==="home"||e==="")&&setTimeout(p,200)}),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>setTimeout(p,400)):setTimeout(p,400),window.initHomeSections=p})();

=======
                </div>`;
            return;
        }

        try {
            // raw is already loaded above
            const items = (Array.isArray(raw) ? raw : (raw?.data ?? []))
                .filter((i) => i.aktif !== false)
                .sort((a, b) => (a.urutan ?? 999) - (b.urutan ?? 999));

            if (!items.length) {
                track.innerHTML =
                    '<div class="staf-empty"><i class="fa-solid fa-users-slash"></i><p>Belum ada data staf</p></div>';
                return;
            }

            /* Render kartu staf */
            track.innerHTML = items
                .map((it) => {
                    const imgSrc = it.foto
                        ? it.foto.startsWith("/storage/") ||
                          it.foto.startsWith("http")
                            ? it.foto
                            : "/storage/" + it.foto
                        : "";
                    const photoHtml = imgSrc
                        ? `<img src="${imgSrc}" alt="${it.nama}" onerror="this.onerror=null;this.src='';this.parentNode.innerHTML='<i class=\'fa-solid fa-user staf-avatar-icon\'></i>'">`
                        : `<i class="fa-solid fa-user staf-avatar-icon"></i>`;
                    return `
                <div class="staf-card">
                    <div class="staf-photo">${photoHtml}</div>
                    <div class="staf-info">
                        <div class="staf-nama">${it.nama}</div>
                        <div class="staf-jabatan">${it.jabatan}</div>
                    </div>
                </div>`;
                })
                .join("");

            /* Dots */
            const VISIBLE = 3; // kartu terlihat sekaligus
            const maxSlide = Math.max(0, items.length - VISIBLE);
            let current = 0;

            if (dotsWrap) {
                const dotCount = Math.ceil(items.length / VISIBLE);
                dotsWrap.innerHTML = Array.from(
                    { length: dotCount },
                    (_, i) =>
                        `<button class="staf-dot${i === 0 ? " active" : ""}" data-idx="${i}"></button>`,
                ).join("");

                dotsWrap.querySelectorAll(".staf-dot").forEach((d) => {
                    d.addEventListener("click", () => {
                        const idx = parseInt(d.dataset.idx) * VISIBLE;
                        goTo(Math.min(idx, maxSlide));
                    });
                });
            }

            function goTo(idx) {
                current = Math.max(0, Math.min(idx, maxSlide));
                const cardWidth =
                    track.querySelector(".staf-card")?.offsetWidth || 180;
                const gap = 16;
                track.style.transform = `translateX(-${current * (cardWidth + gap)}px)`;

                if (dotsWrap) {
                    const dotIdx = Math.floor(current / VISIBLE);
                    dotsWrap
                        .querySelectorAll(".staf-dot")
                        .forEach((d, i) =>
                            d.classList.toggle("active", i === dotIdx),
                        );
                }
            }

            if (prevBtn)
                prevBtn.addEventListener("click", () => goTo(current - 1));
            if (nextBtn)
                nextBtn.addEventListener("click", () => goTo(current + 1));

            /* Auto-slide setiap 5 detik */
            let stafTimer = setInterval(() => {
                if (!document.getElementById("homeStafTrack")) {
                    clearInterval(stafTimer);
                    return;
                }
                const next = current >= maxSlide ? 0 : current + 1;
                goTo(next);
            }, 5000);
        } catch (e) {
            console.error("Gagal memuat staf:", e);
            if (track)
                track.innerHTML =
                    '<div class="staf-empty"><i class="fa-solid fa-exclamation-triangle"></i><p>Gagal memuat data staf</p></div>';
        }
    }

    /* ----------------------------------------------------------------
       VISI MISI — dari API setting publik
    ---------------------------------------------------------------- */
    async function loadHomeVisiMisi() {
        const visiEl = document.getElementById("homeVisiText");
        const misiEl = document.getElementById("homeMisiList");
        if (!visiEl && !misiEl) return;

        // Default fallback
        const DEFAULT_VISI =
            "Terwujudnya Kelurahan Duren Mekar yang maju, berdaya, dan berbudaya.";
        const DEFAULT_MISI = [
            "Meningkatkan kualitas pelayanan publik yang cepat dan transparan.",
            "Memberdayakan masyarakat dalam pembangunan kelurahan.",
            "Mewujudkan lingkungan yang bersih, aman, dan tertib.",
        ];

        function renderVisiMisi(visi, misiLines) {
            if (visiEl) visiEl.textContent = visi || DEFAULT_VISI;
            if (misiEl) {
                const lines = misiLines.length ? misiLines : DEFAULT_MISI;
                misiEl.innerHTML = lines
                    .map(
                        (l) =>
                            `<li><i class="fa-solid fa-check" aria-hidden="true"></i><span>${l}</span></li>`,
                    )
                    .join("");
            }
        }

        // Tampil default dulu agar tidak blank
        renderVisiMisi(DEFAULT_VISI, DEFAULT_MISI);

        // Coba beberapa kemungkinan URL (admin vs public)
        const ENDPOINTS = ["/api/public/setting", "/api/admin/setting"];

        for (const url of ENDPOINTS) {
            try {
                const res = await fetch(url, {
                    headers: { Accept: "application/json" },
                    credentials: "include",
                });
                if (!res.ok) continue;
                const data = await res.json();

                // Handle both array (paginated) and object response
                const s = Array.isArray(data)
                    ? data[0]
                    : data?.data
                      ? (data.data[0] ?? data.data)
                      : data;
                if (!s) continue;

                const visi = s.visi || "";
                const misiRaw = s.misi || "";
                const lines = misiRaw
                    .split("\n")
                    .map((l) => l.replace(/^[-*\d.]+\s*/, "").trim())
                    .filter(Boolean);
                renderVisiMisi(visi || DEFAULT_VISI, lines);
                break; // berhasil, stop
            } catch (e) {
                console.warn("Visi misi endpoint gagal:", url, e);
            }
        }
    }

    /* ----------------------------------------------------------------
       GALERI HOME — thumbnail grid, max 6
    ---------------------------------------------------------------- */
    async function loadHomeGaleri() {
        const grid = document.getElementById("homeGaleriGrid");
        if (!grid) return;

        const MAX = 6;
        try {
            const res = await fetch("/api/public/galeri", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            if (!res.ok) throw new Error("HTTP " + res.status);
            const data = await res.json();
            const items = Array.isArray(data) ? data : [];

            if (!items.length) {
                grid.innerHTML =
                    '<div class="empty-card" style="grid-column:1/-1">Belum ada foto galeri.</div>';
                return;
            }

            const shown = items.slice(0, MAX);
            grid.innerHTML = shown
                .map((g) => {
                    const imgSrc =
                        g.image || (g.foto ? "/storage/" + g.foto : "");
                    return `
                <div class="home-galeri-item" onclick="window.navigateTo('galeri')" style="cursor:pointer;">
                    <img src="${imgSrc}" alt="${g.title || ""}" loading="lazy">
                    <div class="home-galeri-caption">${g.title || ""}</div>
                </div>`;
                })
                .join("");

            /* Tombol lihat semua kalau data > MAX */
            if (items.length > MAX) {
                const btn = document.createElement("div");
                btn.className = "galeri-more-btn";
                btn.innerHTML = `<a class="btn btn-ghost nav-link" href="#galeri" data-page="galeri"><i class="fa-regular fa-images"></i> Lihat Semua ${items.length} Foto</a>`;
                grid.parentElement.appendChild(btn);
            }
        } catch (e) {
            console.error("Gagal memuat galeri home:", e);
            grid.innerHTML =
                '<div class="empty-card" style="grid-column:1/-1">Gagal memuat galeri.</div>';
        }
    }

    /* ----------------------------------------------------------------
       PENGUMUMAN HOME — list, max 4
    ---------------------------------------------------------------- */
    async function loadHomePengumuman() {
        const listEl = document.getElementById("homePengumumanList");
        if (!listEl) return;

        const MAX = 4;
        try {
            const res = await fetch("/api/public/pengumuman", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            if (!res.ok) throw new Error("HTTP " + res.status);
            const data = await res.json();
            const items = (Array.isArray(data) ? data : []).sort((a, b) =>
                (b.date || "").localeCompare(a.date || ""),
            );

            if (!items.length) {
                listEl.innerHTML =
                    '<div class="empty-card">Belum ada pengumuman.</div>';
                return;
            }

            const shown = items.slice(0, MAX);
            listEl.innerHTML = shown
                .map((item) => {
                    const kat = item.kategori || "Info";
                    const colors = {
                        info: "#3b82f6",
                        penting: "#ef4444",
                        kegiatan: "#10b981",
                        pengumuman: "#f59e0b",
                    };
                    const color = colors[kat.toLowerCase()] || "#6366f1";
                    return `
                <div class="home-peng-item">
                    <div class="home-peng-left">
                        <span class="home-peng-badge" style="background:${color}20;color:${color}">${kat.toUpperCase()}</span>
                        <div class="home-peng-title">${item.title || "(Tanpa judul)"}</div>
                        <div class="home-peng-date"><i class="fa-regular fa-calendar"></i> ${fmtDate(item.date || item.created_at)}</div>
                    </div>
                    <i class="fa-solid fa-chevron-right home-peng-arrow"></i>
                </div>`;
                })
                .join("");

            /* Tambah tombol lihat semua jika lebih dari MAX */
            if (items.length > MAX) {
                const btn = document.createElement("div");
                btn.className = "peng-more-btn";
                btn.innerHTML = `<a class="btn btn-ghost nav-link" href="#pengumuman" data-page="pengumuman"><i class="fa-solid fa-bullhorn"></i> Lihat Semua ${items.length} Pengumuman</a>`;
                listEl.parentElement.appendChild(btn);
            }

            /* Klik item -> ke halaman pengumuman */
            listEl.querySelectorAll(".home-peng-item").forEach((el) => {
                el.style.cursor = "pointer";
                el.addEventListener("click", () =>
                    window.navigateTo("pengumuman"),
                );
            });
        } catch (e) {
            console.error("Gagal memuat pengumuman home:", e);
            listEl.innerHTML =
                '<div class="empty-card">Gagal memuat pengumuman.</div>';
        }
    }

    /* ----------------------------------------------------------------
       HERO SLIDESHOW — ganti interval jadi 5 detik
       (Override interval setelah public.js selesai)
    ---------------------------------------------------------------- */
    function fixHeroInterval() {
        /* Patch: ubah auto-rotate hero dari 7s ke 5s
           Dilakukan dengan override setelah DOM siap */
        const origSetInterval = window.setInterval;
        // Cara bersih: cukup restart dengan interval baru setelah slider terbentuk
        const observer = new MutationObserver(() => {
            const track = document.getElementById("heroSlidesTrack");
            if (track && track.querySelectorAll(".hero-slide").length > 1) {
                observer.disconnect();
                /* Clear timer lama yang 7000ms */
                if (window.heroSliderInterval) {
                    clearInterval(window.heroSliderInterval);
                    window.heroSliderInterval = null;
                }
                /* Buat timer baru 5000ms */
                const slides = track.querySelectorAll(".hero-slide");
                const dotsContainer = document.getElementById("heroSliderDots");
                let current = 0;

                function goTo(idx) {
                    current = idx;
                    track.style.transform = `translateX(-${current * 100}%)`;
                    if (dotsContainer) {
                        dotsContainer
                            .querySelectorAll(".hero-slider-dot")
                            .forEach((d, i) =>
                                d.classList.toggle("active", i === idx),
                            );
                    }
                }

                window.heroSliderInterval = setInterval(() => {
                    const t = document.getElementById("heroSlidesTrack");
                    if (!t) {
                        clearInterval(window.heroSliderInterval);
                        return;
                    }
                    goTo((current + 1) % slides.length);
                }, 5000);
            }
        });

        const slider = document.getElementById("heroSlider");
        if (slider)
            observer.observe(slider, { childList: true, subtree: true });
    }

    /* ----------------------------------------------------------------
       INIT — jalankan saat home page dimuat
    ---------------------------------------------------------------- */
    function initHomeSections() {
        /* Cek apakah elemen home ada */
        if (
            !document.getElementById("homeStafTrack") &&
            !document.getElementById("homeGaleriGrid")
        )
            return;

        loadHomeStaf();
        loadHomeVisiMisi();
        loadHomeGaleri();
        loadHomePengumuman();
        fixHeroInterval();
    }

    /* Jalankan saat halaman home di-navigate */
    window.addEventListener("hashchange", () => {
        const hash = location.hash.replace("#", "") || "home";
        if (hash === "home" || hash === "") {
            setTimeout(initHomeSections, 200);
        }
    });

    /* Jalankan juga saat pertama load */
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () =>
            setTimeout(initHomeSections, 400),
        );
    } else {
        setTimeout(initHomeSections, 400);
    }

    /* Expose untuk dipanggil manual jika perlu */
    window.initHomeSections = initHomeSections;
})();
>>>>>>> f095065e321e32c52ed71452dd74841c27579e72
