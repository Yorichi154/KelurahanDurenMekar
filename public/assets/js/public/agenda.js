console.log("AGENDA JS BERHASIL DIMUAT");async function renderAgendaPublic(){console.log("Agenda Loaded");const o=document.getElementById("agendaPublic");if(!o)return;let t=document.getElementById("agendaPagination");t||(t=document.createElement("div"),t.id="agendaPagination",t.className="data-pagination",o.insertAdjacentElement("afterend",t));let s=1;const d=6;try{const i=await fetch("/api/public/agenda",{credentials:"include",headers:{Accept:"application/json"}});if(!i.ok)throw new Error(`HTTP ${i.status}`);const g=await i.json(),r=(Array.isArray(g)?g:[]).sort((a,c)=>{const l=(c.date||"").localeCompare(a.date||"");return l!==0?l:(c.time||"").localeCompare(a.time||"")});if(!r.length){o.innerHTML=`
                <div class="agenda-empty-full">
                    <i class="fa-regular fa-calendar-xmark"></i>
                    <p>Belum ada agenda kegiatan.</p>
                </div>`,t.innerHTML="";return}const p=()=>{const a=Math.ceil(r.length/d);s>a&&(s=a||1);const c=(s-1)*d,l=r.slice(c,c+d);o.innerHTML=l.map(n=>{const e=n.date?new Date(n.date):null,$=e?e.getDate():"-",b=e?e.toLocaleDateString("id-ID",{month:"short"}):"-",v=e?e.getFullYear():"",f=e?e.toLocaleDateString("id-ID",{weekday:"long"}):"",u=e&&e<new Date,h=u?"agenda-badge-past":"agenda-badge-upcoming",m=(n.content||"").split(`
`).filter(Boolean);return`
                <div class="agenda-card-full">
                    <div class="acf-date-box ${h}">
                        <span class="acf-day">${$}</span>
                        <span class="acf-mon">${b}</span>
                        <span class="acf-yr">${v}</span>
                    </div>
                    <div class="acf-body">
                        <div class="acf-status">${u?'<span class="acf-tag acf-tag-past">Selesai</span>':'<span class="acf-tag acf-tag-upcoming">Akan Datang</span>'}</div>
                        <h3 class="acf-title">${n.title||"(Tanpa Judul)"}</h3>
                        <div class="acf-meta">
                            ${f?`<span><i class="fa-regular fa-calendar"></i> ${f}, ${window.fmtDate?window.fmtDate(n.date):n.date||"-"}</span>`:""}
                            ${n.time?`<span><i class="fa-regular fa-clock"></i> ${n.time}</span>`:""}
                            ${n.location?`<span><i class="fa-solid fa-location-dot"></i> ${n.location}</span>`:""}
                        </div>
                        ${m.length?`<div class="acf-content">${m.map(y=>`<p>${y}</p>`).join("")}</div>`:""}
                    </div>
                </div>`}).join(""),t.innerHTML=a>1?`
                    <button class="page-btn" data-page="${s-1}" ${s===1?"disabled":""}>
                        <i class="fa-solid fa-chevron-left"></i> Sebelumnya
                    </button>
                    <span class="page-info">Halaman ${s} dari ${a}</span>
                    <button class="page-btn" data-page="${s+1}" ${s===a?"disabled":""}>
                        Berikutnya <i class="fa-solid fa-chevron-right"></i>
                    </button>
                `:""};t.onclick=a=>{const c=a.target.closest(".page-btn");!c||c.disabled||(s=Number(c.dataset.page)||1,p(),o.scrollIntoView({behavior:"smooth",block:"start"}))},p()}catch(i){console.error(i),o.innerHTML='<div class="agenda-empty-full"><i class="fa-solid fa-circle-exclamation"></i><p>Gagal memuat agenda.</p></div>',t.innerHTML=""}}async function renderAgenda(){return renderAgendaPublic()}

