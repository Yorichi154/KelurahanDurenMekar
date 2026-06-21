(function(){"use strict";const x=e=>{try{return new Date(e).toLocaleDateString("id-ID",{day:"2-digit",month:"long",year:"numeric"})}catch(a){return e||""}};let L=null;async function T(){if(L)return L;try{const e=await fetch("/api/public/setting",{Accept:"application/json"});if(e.ok){const a=await e.json();if(a&&a.id)return L=a,L}}catch(e){console.error("Gagal fetch settings dari API:",e)}if(window.KelurahanStore){const e=window.KelurahanStore.Data.settings();L={site_name:e.siteName,address:e.address,phone:e.phone,email:e.email,instagram:e.instagram,facebook:e.facebook,youtube:e.youtube,profil:e.note,lurah_name:e.lurahName,kecamatan:e.kecamatan,kota:e.kota,provinsi:e.provinsi,kodepos:e.kodepos,maps:e.maps,jam_pelayanan:e.jamPelayanan,visi:e.visi,misi:e.misi,luas_wilayah:e.luas_wilayah,jumlah_penduduk:e.jumlah_penduduk,jumlah_rt:e.jumlah_rt,jumlah_rw:e.jumlah_rw}}return L}async function C(){const e=await T();if(!e)return;const a=document.querySelector(".logo-text h1"),m=document.querySelector(".logo-text p");if(a&&(a.innerHTML=`<i class="fa-solid fa-landmark"></i> ${e.site_name||"Kelurahan"}`),m&&(m.innerHTML=`<i class="fa-solid fa-location-dot"></i> ${e.address||""}`),!document.querySelector(".footer"))return;const o=document.getElementById("footerAbout");o&&(o.textContent=e.profil||`Website resmi ${e.site_name||"Kelurahan Duren Mekar"} untuk menyediakan informasi dan layanan kepada masyarakat secara online.`);const l=document.querySelector(".footer-social a[aria-label='Facebook']"),f=document.querySelector(".footer-social a[aria-label='X']"),d=document.querySelector(".footer-social a[aria-label='Instagram']");l&&(l.style.display="none"),f&&(f.style.display="none"),d&&(e.instagram?(d.href=e.instagram.startsWith("http")?e.instagram:`https://instagram.com/${e.instagram.replace("@","")}`,d.style.display="inline-flex"):d.style.display="none");const n=document.getElementById("footerAddress");n&&(n.querySelector("span").textContent=e.address||"-");const u=document.getElementById("footerPhone");u&&(u.querySelector("span").textContent=e.phone||"-");const g=document.getElementById("footerEmail");g&&(g.querySelector("span").textContent=e.email||"-");const t=document.getElementById("footerCopyright");t&&(t.textContent=`\xA9 2026 ${e.site_name||"Kelurahan Duren Mekar"}. Hak Cipta Dilindungi.`);const c=document.getElementById("footerNewsList");if(c)try{const p=await fetch("/api/public/berita");if(p.ok){const i=(await p.json()).filter(s=>s.status==="published").slice(0,3);i.length>0?(c.innerHTML=i.map(s=>`
                            <li>
                                <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                                <a href="#berita" data-news-id="${s.id}">${s.title}</a>
                            </li>
                        `).join(""),c.querySelectorAll("a").forEach(s=>{s.addEventListener("click",()=>{const v=s.getAttribute("data-news-id");sessionStorage.setItem("autoOpenNewsId",v)})})):c.innerHTML='<li class="muted">Belum ada berita.</li>'}}catch(p){console.error("Gagal memuat berita untuk footer:",p)}}async function H(){const e=document.getElementById("homeNewsGrid"),a=document.getElementById("homeAgendaList"),m=document.getElementById("stat-total-warga"),r=document.getElementById("stat-total-rtrw"),o=document.getElementById("stat-layanan-aktif"),l=document.getElementById("stat-surat-diproses");if(m||r||o||l)try{const n=await fetch("/api/public/stats",{credentials:"include"});if(n.ok){const u=await n.json();m&&u.total_warga!==void 0&&(m.textContent=Number(u.total_warga).toLocaleString("id-ID")),r&&u.total_rtrw!==void 0&&(r.textContent=u.total_rtrw),o&&u.layanan_aktif!==void 0&&(o.textContent=Number(u.layanan_aktif).toLocaleString("id-ID")),l&&u.surat_diproses!==void 0&&(l.textContent=Number(u.surat_diproses).toLocaleString("id-ID"))}}catch(n){console.error("Gagal memuat statistik:",n)}if(e)try{const n=await fetch("/api/public/berita",{credentials:"include"});if(!n.ok)throw new Error(`HTTP ${n.status}`);const g=(await n.json()).filter(t=>t.status==="published").sort((t,c)=>new Date(c.created_at)-new Date(t.created_at)).slice(0,6);if(!g.length)e.innerHTML='<div class="empty-card" style="grid-column:1/-1">Belum ada berita.</div>';else{let B=function(y){var w,I,j,M;(w=v[s])==null||w.classList.remove("active"),(I=E[s])==null||I.classList.remove("active"),s=(y+v.length)%v.length,(j=v[s])==null||j.classList.add("active"),(M=E[s])==null||M.classList.add("active")},$=function(y){k(y),h.querySelectorAll(".home-news-item").forEach((w,I)=>w.classList.toggle("active",I===s))};e.className="home-news-wrap",e.innerHTML=`
                        <div class="home-news-featured" id="homeFeaturedWrap">
                            <div class="home-news-featured-track" id="homeFeaturedTrack"></div>
                            <button class="featured-nav featured-prev" id="featPrev">&#8249;</button>
                            <button class="featured-nav featured-next" id="featNext">&#8250;</button>
                            <div class="featured-dots" id="featDots"></div>
                        </div>
                        <div class="home-news-list" id="homeNewsList"></div>
                    `;const t=document.getElementById("homeFeaturedTrack"),c=document.getElementById("featDots"),p=document.getElementById("featPrev"),b=document.getElementById("featNext"),i=g.slice(0,Math.min(g.length,4));t.innerHTML=i.map((y,w)=>{const I=y.category||"Berita";return`
                        <div class="featured-slide${w===0?" active":""}" data-idx="${w}">
                            ${y.image?`<img src="${y.image}" alt="${y.title}" onerror="this.style.display='none'">`:'<div class="featured-no-img"><i class="fa-regular fa-newspaper"></i></div>'}
                            <div class="featured-overlay">
                                <span class="featured-cat">${I}</span>
                                <h3 class="featured-title">${y.title}</h3>
                                <div class="featured-meta">${x(y.created_at)} &bull; ${y.author||"Kelurahan Duren Mekar"}</div>
                                <a class="featured-read nav-link" href="#berita" data-page="berita">Baca Selengkapnya &rsaquo;</a>
                            </div>
                        </div>`}).join(""),c.innerHTML=i.map((y,w)=>`<button class="feat-dot${w===0?" active":""}" data-i="${w}"></button>`).join("");let s=0;const v=t.querySelectorAll(".featured-slide"),E=c.querySelectorAll(".feat-dot");p==null||p.addEventListener("click",()=>B(s-1)),b==null||b.addEventListener("click",()=>B(s+1)),E.forEach(y=>y.addEventListener("click",()=>B(+y.dataset.i))),v.length>1&&(window._featTimer&&clearInterval(window._featTimer),window._featTimer=setInterval(()=>{if(!document.getElementById("homeFeaturedTrack")){clearInterval(window._featTimer);return}B(s+1)},7e3));const h=document.getElementById("homeNewsList"),S=g.slice(0,4);h.innerHTML=S.map((y,w)=>`
                        <article class="home-news-item${w===0?" active":""}" data-idx="${w}">
                            ${y.image?`<div class="hni-thumb"><img src="${y.image}" alt="${y.title}" onerror="this.style.display='none'"></div>`:'<div class="hni-thumb hni-thumb-empty"><i class="fa-regular fa-newspaper"></i></div>'}
                            <div class="hni-body">
                                <span class="hni-cat">${y.category||"Berita"}</span>
                                <div class="hni-title">${y.title}</div>
                                <div class="hni-date">${x(y.created_at)}</div>
                            </div>
                        </article>
                    `).join(""),h.querySelectorAll(".home-news-item").forEach(y=>{y.style.cursor="pointer",y.addEventListener("click",()=>{const w=+y.dataset.idx;B(w),h.querySelectorAll(".home-news-item").forEach(I=>I.classList.remove("active")),y.classList.add("active")})});const k=B;p==null||p.addEventListener("click",()=>$(s-1),{once:!1}),b==null||b.addEventListener("click",()=>$(s+1),{once:!1})}}catch(n){console.error("Gagal memuat berita:",n),e&&(e.innerHTML='<div class="error-card">Gagal memuat berita.</div>')}if(a)try{const n=await fetch("/api/public/agenda",{credentials:"include"});if(!n.ok)throw new Error(`HTTP ${n.status}`);const g=(await n.json()).filter(t=>t.date>=new Date().toISOString().slice(0,10)||!0).sort((t,c)=>(t.date||"").localeCompare(c.date||"")).slice(0,4);g.length?a.innerHTML=g.map(t=>`
                        <div class="agenda-row">
                            <div class="agenda-date-box">
                                <span class="adb-day">${new Date(t.date||Date.now()).getDate()}</span>
                                <span class="adb-mon">${new Date(t.date||Date.now()).toLocaleDateString("id-ID",{month:"short"})}</span>
                            </div>
                            <div class="agenda-content">
                                <div class="agenda-title">${t.title}</div>
                                <div class="agenda-detail">
                                    ${t.time?`<span><i class="fa-regular fa-clock"></i> ${t.time}</span>`:""}
                                    ${t.location?`<span><i class="fa-solid fa-location-dot"></i> ${t.location}</span>`:""}
                                </div>
                            </div>
                        </div>
                    `).join(""):a.innerHTML='<div class="agenda-empty"><i class="fa-regular fa-calendar-xmark"></i><p>Belum ada agenda mendatang</p></div>'}catch(n){console.error("Gagal memuat agenda:",n),a&&(a.innerHTML='<div class="agenda-empty">Gagal memuat agenda.</div>')}const f=document.getElementById("heroSlider"),d=document.getElementById("heroSlidesTrack");if(f&&d)try{const n=await fetch("/api/public/galeri",{credentials:"include"});if(n.ok){const u=await n.json();if(u&&u.length>0){d.innerHTML=u.map(i=>`
                            <div class="hero-slide">
                                <img src="${i.image}" alt="${i.title}" loading="lazy">
                                <div class="hero-slide-caption">${i.title}</div>
                            </div>
                        `).join("");let g=document.getElementById("heroSliderDots");g||(g=document.createElement("div"),g.className="hero-slider-dots",g.id="heroSliderDots",f.appendChild(g)),g.innerHTML=u.map((i,s)=>`
                            <button class="hero-slider-dot ${s===0?"active":""}" data-index="${s}"></button>
                        `).join("");let t=0;const c=d.querySelectorAll(".hero-slide"),p=g.querySelectorAll(".hero-slider-dot"),b=i=>{t=i,d.style.transform=`translateX(-${t*100}%)`,p.forEach((s,v)=>{s.classList.toggle("active",v===t)})};p.forEach(i=>{i.addEventListener("click",()=>{const s=parseInt(i.dataset.index);b(s)})}),c.length>1&&(window.heroSliderInterval&&clearInterval(window.heroSliderInterval),window.heroSliderInterval=setInterval(()=>{if(!document.getElementById("heroSlider")){clearInterval(window.heroSliderInterval),window.heroSliderInterval=null;return}const s=(t+1)%c.length;b(s)},7e3))}}}catch(n){console.error("Gagal memuat galeri untuk slider hero:",n)}}async function _(){const e=document.getElementById("beritaContainer"),a=document.getElementById("beritaTabs"),m=document.getElementById("beritaSearch"),r=document.getElementById("beritaPagination");if(!e)return;let o=1;const l=6;try{const f=await fetch("/api/public/berita",{credentials:"include"});if(!f.ok)throw new Error(`HTTP ${f.status}`);const n=(await f.json()).filter(i=>i.status==="published"),g=["Semua",...Array.from(new Set(n.map(i=>i.category).filter(Boolean)))];let t="Semua",c="";const p=()=>{const i=c.toLowerCase().trim(),s=n.filter(h=>{const S=t==="Semua"||h.category===t,k=!i||h.title&&h.title.toLowerCase().includes(i)||h.content&&h.content.toLowerCase().includes(i)||h.excerpt&&h.excerpt.toLowerCase().includes(i);return S&&k}),v=Math.ceil(s.length/l);o>v&&(o=v||1);const E=(o-1)*l,B=s.slice(E,E+l);e.innerHTML=B.map(h=>`
                        <article class="berita-card" style="cursor: pointer; display: flex; flex-direction: column; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); transition: transform 0.2s, box-shadow 0.2s;" data-id="${h.id}">
                            ${h.image?`<img src="${h.image}" alt="${h.title}" class="berita-thumb" style="width:100%; aspect-ratio:16/10; object-fit:cover; border-bottom:1px solid var(--border);" onerror="this.style.display='none';">`:""}
                            <div class="berita-content" style="padding: 16px; display: flex; flex-direction: column; gap: 8px; flex-grow: 1;">
                                <span class="berita-category" style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--primary);">${h.category||"Umum"}</span>
                                <h3 style="font-size: 16px; font-weight: 900; margin: 0; line-height: 1.3; color: var(--text);">${h.title}</h3>
                                <small class="muted">${x(h.date||h.created_at)}</small>
                                <p style="font-size: 13px; color: var(--muted); margin: 4px 0 12px; line-height: 1.5;">${h.excerpt||""}</p>
                                <button class="btn-read-more" style="align-self: flex-start; margin-top: auto; font-weight: 700; color: var(--primary); background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 0;">Baca Selengkapnya <i class="fa-solid fa-arrow-right"></i></button>
                            </div>
                        </article>
                    `).join("")||'<div class="muted" style="grid-column: span 3; text-align: center; padding: 24px;">Tidak ada berita yang cocok.</div>',r&&(r.innerHTML=v>1?`
                            <button class="page-btn" data-page="${o-1}" ${o===1?"disabled":""}>
                                <i class="fa-solid fa-chevron-left"></i> Sebelumnya
                            </button>
                            <span class="page-info">Halaman ${o} dari ${v}</span>
                            <button class="page-btn" data-page="${o+1}" ${o===v?"disabled":""}>
                                Berikutnya <i class="fa-solid fa-chevron-right"></i>
                            </button>
                        `:""),e.querySelectorAll(".berita-card").forEach(h=>{h.addEventListener("click",()=>{const S=h.getAttribute("data-id"),k=n.find($=>String($.id)===String(S));if(k){document.getElementById("publicBeritaTitle").textContent=k.title,document.getElementById("publicBeritaHeadline").textContent=k.title,document.getElementById("publicBeritaCategory").textContent=k.category||"Berita",document.getElementById("publicBeritaDate").textContent=x(k.date||k.created_at),document.getElementById("publicBeritaContent").textContent=k.content||"";const $=document.getElementById("publicBeritaImage");k.image?($.src=k.image,$.style.display="block"):($.removeAttribute("src"),$.style.display="none"),document.getElementById("publicBeritaModal").classList.add("open")}})}),a&&a.querySelectorAll(".tab").forEach(h=>{h.classList.toggle("active",h.dataset.filter===t)})};a&&(a.innerHTML=g.map(i=>`
                        <button class="tab ${i===t?"active":""}" data-filter="${i}">
                            ${i}
                        </button>
                    `).join(""),a.addEventListener("click",i=>{const s=i.target.closest(".tab");s&&(t=s.dataset.filter,o=1,p())})),m&&(m.value="",m.addEventListener("input",i=>{c=i.target.value,o=1,p()})),r&&r.addEventListener("click",i=>{const s=i.target.closest(".page-btn");!s||s.disabled||(o=Number(s.dataset.page)||1,p(),e.scrollIntoView({behavior:"smooth",block:"start"}))}),p();const b=sessionStorage.getItem("autoOpenNewsId");if(b){sessionStorage.removeItem("autoOpenNewsId");const i=e.querySelector(`.berita-card[data-id="${b}"]`);if(i)i.click();else{const s=n.find(v=>String(v.id)===String(b));if(s){document.getElementById("publicBeritaTitle").textContent=s.title,document.getElementById("publicBeritaHeadline").textContent=s.title,document.getElementById("publicBeritaCategory").textContent=s.category||"Berita",document.getElementById("publicBeritaDate").textContent=x(s.date||s.created_at),document.getElementById("publicBeritaContent").textContent=s.content||"";const v=document.getElementById("publicBeritaImage");s.image?(v.src=s.image,v.style.display="block"):(v.removeAttribute("src"),v.style.display="none"),document.getElementById("publicBeritaModal").classList.add("open")}}}}catch(f){console.error("Gagal memuat berita:",f),e.innerHTML="<p>Gagal memuat berita.</p>"}}document.addEventListener("click",e=>{var a;(e.target.closest("#closePublicBeritaModalBtn")||e.target.matches("#publicBeritaModal"))&&((a=document.getElementById("publicBeritaModal"))==null||a.classList.remove("open"))});async function q(){const e=document.getElementById("agendaPublic");let a=document.getElementById("agendaPagination");if(!e)return;a||(a=document.createElement("div"),a.id="agendaPagination",a.className="data-pagination",e.insertAdjacentElement("afterend",a));let m=1;const r=6;e.innerHTML='<div class="agenda-loading"><i class="fa-solid fa-spinner fa-spin"></i> Memuat agenda...</div>',a.innerHTML="";try{const o=await fetch("/api/public/agenda",{credentials:"include"});if(!o.ok)throw new Error(`HTTP ${o.status}`);const l=await o.json();if(!l.length){e.innerHTML=`
                <div class="agenda-empty-full">
                    <i class="fa-regular fa-calendar-xmark"></i>
                    <p>Belum ada agenda kegiatan.</p>
                </div>`,a.innerHTML="";return}const f=[...l].sort((d,n)=>{const u=(n.date||"").localeCompare(d.date||"");return u!==0?u:(n.time||"").localeCompare(d.time||"")}),d=()=>{const n=Math.max(1,Math.ceil(f.length/r));m>n&&(m=n);const u=(m-1)*r,g=f.slice(u,u+r);e.innerHTML=g.map(t=>{const c=t.date?new Date(t.date):null,p=c?c.getDate():"-",b=c?c.toLocaleDateString("id-ID",{month:"short"}):"-",i=c?c.getFullYear():"",v=c?c.toLocaleDateString("id-ID",{weekday:"long"}):"",h=c&&c<new Date,y=h?"agenda-badge-past":"agenda-badge-upcoming",E=(t.content||"").split(`
`).filter(Boolean);return`
                <div class="agenda-card-full">
                    <!-- Tanggal Box -->
                    <div class="acf-date-box ${y}">
                        <span class="acf-day">${p}</span>
                        <span class="acf-mon">${b}</span>
                        <span class="acf-yr">${i}</span>
                    </div>

                    <!-- Konten -->
                    <div class="acf-body">
                        <div class="acf-status">${h?'<span class="acf-tag acf-tag-past">Selesai</span>':'<span class="acf-tag acf-tag-upcoming">Akan Datang</span>'}</div>
                        <h3 class="acf-title">${t.title||"(Tanpa Judul)"}</h3>
                        <div class="acf-meta">
                            ${v?`<span><i class="fa-regular fa-calendar"></i> ${v}, ${x(t.date)}</span>`:""}
                            ${t.time?`<span><i class="fa-regular fa-clock"></i> ${t.time}</span>`:""}
                            ${t.location?`<span><i class="fa-solid fa-location-dot"></i> ${t.location}</span>`:""}
                        </div>
                        ${E.length?`<div class="acf-content">${E.map(I=>`<p>${I}</p>`).join("")}</div>`:""}
                    </div>
                </div>`}).join(""),a.innerHTML=n>1?`
                    <button class="page-btn" data-agenda-page="${m-1}" ${m<=1?"disabled":""}>
                        <i class="fa-solid fa-chevron-left"></i> Sebelumnya
                    </button>
                    <span class="page-info">Halaman ${m} dari ${n}</span>
                    <button class="page-btn" data-agenda-page="${m+1}" ${m>=n?"disabled":""}>
                        Berikutnya <i class="fa-solid fa-chevron-right"></i>
                    </button>
                `:""};a.onclick=n=>{const u=n.target.closest(".page-btn");!u||u.disabled||(m=Number(u.dataset.agendaPage)||1,d(),e.scrollIntoView({behavior:"smooth",block:"start"}))},d()}catch(o){console.error("Gagal memuat agenda:",o),e.innerHTML='<div class="agenda-empty-full"><i class="fa-solid fa-circle-exclamation"></i><p>Gagal memuat agenda.</p></div>',a.innerHTML=""}}
async function A(){const e=document.getElementById("galeriGrid"),a=document.getElementById("galeriFilter"),m=document.getElementById("galeriPagination");if(!e||!a)return;let r=1;const o=6;try{const l=await fetch("/api/public/galeri",{credentials:"include"});if(!l.ok)throw new Error("Gagal memuat galeri");const f=await l.json(),n=["Semua",...Array.from(new Set(f.map(t=>t.category).filter(Boolean)))];let u="Semua";const g=()=>{const t=u==="Semua"?f:f.filter(i=>i.category===u),c=Math.ceil(t.length/o);r>c&&(r=c||1);const p=(r-1)*o,b=t.slice(p,p+o);e.innerHTML=b.map(i=>`
                            <article class="gallery-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s;">
                                ${i.image?`<img src="${i.image}" alt="${i.title}" style="width:100%; aspect-ratio:4/3; object-fit:cover; border-bottom:1px solid var(--border);" onerror="this.style.display='none'">`:""}
                                <div class="gallery-body" style="padding:16px; display:flex; flex-direction:column; gap:6px; flex-grow:1;">
                                    <h3 style="font-size: 15px; font-weight: 800; color: var(--text); margin:0;">${i.title}</h3>
                                    <p style="font-size: 13px; color: var(--muted); margin:0;">${i.content||""}</p>
                                    <div class="muted" style="font-size:11px; margin-top:auto; font-weight:700;">
                                        ${i.category||"Umum"} \u2022 ${x(i.date||i.created_at)}
                                    </div>
                                </div>
                            </article>
                        `).join("")||'<div class="muted" style="grid-column: span 3; text-align: center; padding: 24px;">Belum ada foto galeri.</div>',m&&(m.innerHTML=c>1?`
                            <button class="page-btn" data-page="${r-1}" ${r===1?"disabled":""}>
                                <i class="fa-solid fa-chevron-left"></i> Sebelumnya
                            </button>
                            <span class="page-info">Halaman ${r} dari ${c}</span>
                            <button class="page-btn" data-page="${r+1}" ${r===c?"disabled":""}>
                                Berikutnya <i class="fa-solid fa-chevron-right"></i>
                            </button>
                        `:""),a.querySelectorAll(".filter-btn").forEach(i=>{i.classList.toggle("active",i.dataset.filter===u)})};a.innerHTML=n.map(t=>`
                    <button class="filter-btn ${t===u?"active":""}" data-filter="${t}">
                        ${t}
                    </button>
                `).join(""),a.addEventListener("click",t=>{const c=t.target.closest(".filter-btn");c&&(u=c.dataset.filter,r=1,g())}),m&&m.addEventListener("click",t=>{const c=t.target.closest(".page-btn");!c||c.disabled||(r=Number(c.dataset.page)||1,g(),e.scrollIntoView({behavior:"smooth",block:"start"}))}),g()}catch(l){console.error("Gagal memuat galeri:",l),e.innerHTML='<div class="error-card" style="grid-column: span 3; text-align: center; padding: 24px;">Gagal memuat galeri.</div>'}}function D(){document.querySelectorAll(".faq-question").forEach(e=>{e.addEventListener("click",()=>{const a=e.nextElementSibling;a&&a.classList.toggle("show")})})}async function P(){try{const e=await T();if(e){const r=document.getElementById("kPhone"),o=document.getElementById("kEmail"),l=document.getElementById("kAddress"),f=document.getElementById("kAddress2"),d=document.getElementById("kProfil"),n=document.getElementById("kIgRow"),u=document.getElementById("kInstagram"),g=document.getElementById("kFbRow"),t=document.getElementById("kFacebook"),c=document.getElementById("kYtRow"),p=document.getElementById("kYoutube");r&&(r.textContent=e.phone||"-"),o&&(o.textContent=e.email||"-"),l&&(l.textContent=e.address||"-"),f&&(f.textContent=`Kec. ${e.kecamatan||"-"}, ${e.kota||"-"}`),d&&(d.textContent=e.jam_pelayanan||e.profil||"-"),e.instagram?(n&&(n.style.display="block"),u&&(u.textContent=e.instagram)):n&&(n.style.display="none"),e.facebook?(g&&(g.style.display="block"),t&&(t.textContent=e.facebook)):g&&(g.style.display="none"),e.youtube?(c&&(c.style.display="block"),p&&(p.textContent=e.youtube)):c&&(c.style.display="none");var _se=document.getElementById("kSosialEmpty");_se&&(_se.style.display=(e.instagram||e.facebook||e.youtube)?"none":"block")}const a=await fetch("/api/public/rtrw");if(a.ok){const r=await a.json(),o=document.getElementById("kRtGrid");o&&(r&&r.length>0?o.innerHTML=r.map(l=>`
                            <div class="rt-card">
                                <strong>${l.rt_rw||"-"}</strong>
                                <p>${l.ketua||"-"}</p>
                                <small>${l.no_hp||"-"}</small>
                            </div>
                        `).join(""):o.innerHTML='<div style="font-size: 13px; color: var(--muted);">Belum ada kontak RT/RW</div>')}const m=await fetch("/api/public/faq");if(m.ok){const r=await m.json(),o=document.getElementById("kFaqBox");if(o)if(r&&r.length>0){let l=1;const c=6,d=()=>{const n=Math.max(1,Math.ceil(r.length/c)),u=(l-1)*c,g=r.slice(u,u+c);o.innerHTML=g.map(t=>`
                            <div class="faq-item">
                                <button class="faq-question">${t.question}</button>
                                <div class="faq-answer">${t.answer}</div>
                            </div>
                        `).join("")+(r.length>c?`
                            <div class="data-pagination faq-pagination" style="margin-top: 16px;">
                                <button class="page-btn" data-faq-page="prev" ${l<=1?"disabled":""}><i class="fa-solid fa-chevron-left"></i> Sebelumnya</button>
                                <span class="page-info">Halaman ${l} dari ${n}</span>
                                <button class="page-btn" data-faq-page="next" ${l>=n?"disabled":""}>Berikutnya <i class="fa-solid fa-chevron-right"></i></button>
                            </div>
                        `:"");o.querySelectorAll(".faq-question").forEach(t=>{t.addEventListener("click",()=>{t.classList.toggle("active"),t.nextElementSibling.classList.toggle("show")})});const f=o.querySelector('[data-faq-page="prev"]'),h=o.querySelector('[data-faq-page="next"]');f&&f.addEventListener("click",()=>{l>1&&(l--,d())}),h&&h.addEventListener("click",()=>{l<n&&(l++,d())})};d()}else o.innerHTML='<div style="font-size: 13px; color: var(--muted);">Belum ada FAQ</div>'}}catch(e){console.error("Error loading kontak data:",e)}}async function N(){const e=document.getElementById("pengumumanList"),a=document.getElementById("filterKategori"),m=document.getElementById("filterCari");if(!e)return;let r=[];try{const l=await fetch("/api/public/pengumuman",{credentials:"include"});l.ok?r=await l.json():console.error("Gagal memuat pengumuman: status",l.status)}catch(l){console.error("Gagal memuat pengumuman:",l)}a&&a.options.length<=1&&Array.from(new Set(r.map(f=>f.kategori).filter(Boolean))).forEach(f=>{const d=document.createElement("option");d.value=f,d.textContent=f.charAt(0).toUpperCase()+f.slice(1),a.appendChild(d)});function o(){const l=a?a.value:"",f=(m?m.value:"").toLowerCase();let d=[...r].filter(n=>l&&(n.kategori||"")!==l?!1:f?(n.title||"").toLowerCase().includes(f)||(n.content||"").toLowerCase().includes(f):!0);if(d.sort((n,u)=>(u.date||"").localeCompare(n.date||"")),e.innerHTML="",!d.length){e.innerHTML='<div class="empty-card" style="padding: 24px; text-align: center; color: var(--muted); border: 1px dashed var(--border); border-radius: var(--radius); width: 100%;">Belum ada pengumuman...</div>';return}d.forEach(n=>{const u=document.createElement("article");u.className="announcement-card";let g="";if(n.file_path){const s=n.file_path.startsWith("data:")||n.file_path.startsWith("http")?n.file_path:"/storage/"+n.file_path;n.file_path.toLowerCase().endsWith(".pdf")?g=`
                            <div style="margin-top: 12px;">
                                <a href="${s}" target="_blank" class="btn btn-ghost btn-sm" style="font-weight: 800; font-size: 12px; color: var(--primary); display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 6px; background: transparent; cursor: pointer; text-decoration: none;">
                                    <i class="fa-solid fa-file-pdf" style="color: #ef4444; font-size: 14px;"></i> Lihat PDF Lampiran
                                </a>
                            </div>
                        `:g=`
                            <div style="margin-top: 12px;">
                                <img src="${s}" alt="Lampiran" style="max-width: 100%; max-height: 320px; border-radius: 8px; border: 1px solid var(--border); display: block; object-fit: contain; cursor: zoom-in;" onclick="window.open(this.src, '_blank')" />
                            </div>
                        `}const t={info:{bg:"#dbeafe",color:"#1d4ed8"},penting:{bg:"#fef9c3",color:"#b45309"},darurat:{bg:"#fee2e2",color:"#dc2626"},kegiatan:{bg:"#d1fae5",color:"#059669"}},c=(n.kategori||"info").toLowerCase(),p=t[c]||t.info,i=(n.content||"").split(`
`).filter(Boolean).map(s=>`<p class="peng-content-line">${s}</p>`).join("");u.innerHTML=`
                    <div class="peng-card-head">
                        <span class="peng-badge" style="background:${p.bg};color:${p.color}">
                            <i class="fa-solid fa-tag" style="font-size:9px"></i> ${(n.kategori||"Info").toUpperCase()}
                        </span>
                        <span class="peng-date">
                            <i class="fa-regular fa-calendar" style="color:var(--primary)"></i>
                            ${x(n.date||n.created_at)||"-"}
                        </span>
                    </div>
                    <h3 class="peng-title">${n.title||"(Tanpa judul)"}</h3>
                    <div class="peng-body">${i||'<p class="peng-content-line muted">\u2014</p>'}</div>
                    ${g}
                `,e.appendChild(u)})}a&&!a.dataset.listenerBound&&(a.dataset.listenerBound="true",a.addEventListener("change",o)),m&&!m.dataset.listenerBound&&(m.dataset.listenerBound="true",m.addEventListener("input",o)),o()}async function G(){var m;let e=document.getElementById("soOrgChart");const a=document.getElementById("soEmpty");if(!e){const r=document.getElementById("soTopLevel"),o=document.getElementById("soOthers");if(!r&&!o)return;const l=r||o;e=document.createElement("div"),e.id="soOrgChart",e.className="org-chart-wrap",l.parentNode.insertBefore(e,l),r&&r.parentNode&&r.remove(),o&&o.parentNode&&o.remove()}e.innerHTML='<div class="so-loading"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data...</div>',a&&(a.style.display="none");try{let f=function(t){return l.filter(c=>(c.parent_jabatan||null)===(t||null)).map(c=>({...c,children:f(c.jabatan)}))},n=function(t){const c=t.foto?t.foto.startsWith("/storage/")||t.foto.startsWith("http")?t.foto:"/storage/"+t.foto:"";return`<div class="org-card">
                    <div class="org-photo">${c?`<img src="${c}" alt="${t.nama}" onerror="this.onerror=null;this.parentNode.innerHTML='<i class='fa-solid fa-user so-ph-icon'></i>'">`:'<i class="fa-solid fa-user so-ph-icon"></i>'}</div>
                    <div class="org-name">${t.nama}</div>
                    <div class="org-jabatan">${t.jabatan}</div>
                </div>`},u=function(t,c){const b=t.children&&t.children.length>0?`
                    <div class="org-vline"></div>
                    <div class="org-children">${t.children.map(i=>`<div class="org-node-wrap"><div class="org-vline"></div>${u(i,!1)}</div>`).join("")}</div>`:"";return`<div class="org-node${c?" org-root":""}">${n(t)}${b}</div>`};const r=await fetch("/api/public/struktur-organisasi",{credentials:"include",headers:{Accept:"application/json"}});if(!r.ok)throw new Error("HTTP "+r.status);const o=await r.json(),l=(Array.isArray(o)?o:(m=o==null?void 0:o.data)!=null?m:[]).filter(t=>t.aktif!==!1).sort((t,c)=>{var i,s,v,E;const p=(i=t.urutan)!=null?i:999,b=(s=c.urutan)!=null?s:999;return p!==b?p-b:((v=t.id)!=null?v:0)-((E=c.id)!=null?E:0)});if(!l.length){e.innerHTML="",a&&(a.style.display="flex");return}const d=f(null),g=d.length===1?u(d[0],!0):`<div class="org-root-row">${d.map(t=>`<div class="org-node-wrap"><div class="org-vline" style="visibility:hidden"></div>${u(t,!0)}</div>`).join("")}</div>`;e.innerHTML=`<div class="org-chart">${g}</div>`}catch(r){console.error("Struktur organisasi error:",r),e.innerHTML=`<div class="so-loading" style="color:#ef4444">
                <i class="fa-solid fa-circle-exclamation"></i>
                Gagal memuat data. (${r.message})
            </div>`}}async function F(){const e=await T();if(!e)return;const a=document.getElementById("pVisi"),m=document.getElementById("pMisi"),r=document.getElementById("pWilayah"),o=document.getElementById("pPenduduk"),l=document.getElementById("pRtrw");if(a&&(a.textContent=e.visi||"Terwujudnya kelurahan yang maju, sejahtera, dan berbudaya dengan pelayanan prima kepada masyarakat."),m)if(e.misi){const f=e.misi.split(`
`).map(d=>d.trim()).filter(Boolean);f.length>0&&(m.innerHTML=f.map(d=>`
                        <li>
                            <i class="fa-solid fa-check" aria-hidden="true"></i>
                            <span>${d}</span>
                        </li>
                    `).join(""))}else m.innerHTML=`
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
                `;if(r&&(r.textContent=e.luas_wilayah||"24,5 km\xB2"),o&&(o.textContent=e.jumlah_penduduk||"8.542"),l){const f=e.jumlah_rt||"45",d=e.jumlah_rw||"9";l.textContent=`${f} / ${d}`}}async function W(){const e=await T();if(!e)return;const a=document.getElementById("mWilayah"),m=document.getElementById("mPenduduk"),r=document.getElementById("mRtrw");if(a&&(a.textContent=e.luas_wilayah||"24,5 km\xB2"),m&&(m.textContent=e.jumlah_penduduk||"8.542"),r){const o=e.jumlah_rt||"45",l=e.jumlah_rw||"9";r.textContent=`${o} / ${l}`}}window.addEventListener("page:loaded",e=>{var m;window.heroSliderInterval&&(clearInterval(window.heroSliderInterval),window.heroSliderInterval=null),C();const a=(m=e.detail)==null?void 0:m.name;a==="home"&&(H(),setTimeout(()=>{typeof window.initHomeSections=="function"&&window.initHomeSections()},300)),a==="berita"&&_(),a==="agenda"&&q(),a==="galeri"&&A(),a==="kontak"&&(D(),P()),a==="pengumuman"&&N(),a==="struktur-organisasi"&&G(),a==="peta-wilayah"&&W(),a==="profil"&&F()}),window.addEventListener("settings:changed",()=>{L=null,C()}),document.addEventListener("DOMContentLoaded",C)})();

