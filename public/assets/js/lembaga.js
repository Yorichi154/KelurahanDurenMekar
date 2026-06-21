(function(){if(!window.KelurahanStore)return;const{Storage:m}=window.KelurahanStore,f=window.KelurahanGuard||{},p="lembagaKontak";function E(){const d=m.get(p,null);if(Array.isArray(d)&&d.length)return;const e=[{id:"rt-001",jenis:"rt",nama:"Ahmad Hidayat",jabatan:"Ketua RT 001 / RW 001",wilayah:"RT 001 / RW 001",kontak:"0812-3456-0001",keterangan:"Pelayanan surat pengantar & koordinasi lingkungan."},{id:"rt-002",jenis:"rt",nama:"Yusuf Maulana",jabatan:"Ketua RT 002 / RW 001",wilayah:"RT 002 / RW 001",kontak:"0812-3456-0003",keterangan:""},{id:"rw-001",jenis:"rw",nama:"Mulyono",jabatan:"Ketua RW 001",wilayah:"RW 001",kontak:"0812-8888-0001",keterangan:"Sekretariat: Jl. Duren Mekar I No.10"},{id:"rw-002",jenis:"rw",nama:"Sugeng Riyadi",jabatan:"Ketua RW 002",wilayah:"RW 002",kontak:"0812-8888-0003",keterangan:"Sekretariat: Jl. Duren Mekar II No.15"},{id:"pkk-001",jenis:"pkk",nama:"Ibu Hj. Siti Aminah",jabatan:"Ketua TP PKK Kelurahan",wilayah:"Kelurahan Duren Mekar",kontak:"0812-7000-0001",keterangan:"Koordinasi kegiatan PKK & Posyandu."},{id:"kt-001",jenis:"karang-taruna",nama:"Rizky Pratama",jabatan:"Ketua Karang Taruna",wilayah:"Kelurahan Duren Mekar",kontak:"0812-9000-0001",keterangan:"Koordinasi kegiatan kepemudaan & sosial."},{id:"lpmk-001",jenis:"lpmk",nama:"H. Hasan Basri",jabatan:"Ketua LPMK",wilayah:"Kelurahan Duren Mekar",kontak:"0812-6000-0001",keterangan:"Perencanaan pembangunan kelurahan."}];m.set(p,e)}function y(){return E(),m.get(p,[])}function M(d){m.set(p,d)}async function R(d){const r={rt:"rt",rw:"rw",pkk:"pkk","karang-taruna":"karang-taruna",lpmk:"lpmk"}[d];if(!r)return;let c=[];try{const t=await fetch("/api/public/lembaga",{credentials:"include"});t.ok&&(c=await t.json())}catch(t){console.error("Gagal mengambil data lembaga:",t)}const u=c.filter(t=>t.jenis===r),g=f.getSession?f.getSession():null,i=!!(g&&g.role==="warga"),k=document.getElementById("lembagaTbody"),b=document.getElementById("lembagaKontakUtama");if(k&&(k.innerHTML=u.map(t=>`
          <tr>
            <td>${t.nama||"-"}</td>
            <td>${t.jabatan||"-"}</td>
            <td>${t.wilayah||"-"}</td>
            <td>${i?t.kontak||"-":'<span class="muted">Login untuk lihat</span>'}</td>
          </tr>`).join("")||'<tr><td colspan="4" class="empty">Data belum tersedia.</td></tr>'),b){const t=u[0];t?b.innerHTML=`
          <div class="card">
            <div class="card-body">
              <h3 class="section-title-sm">Kontak Utama</h3>
              <p><b>${t.nama}</b></p>
              <p class="muted">${t.jabatan}</p>
              <p><i class="fa-solid fa-location-dot"></i> ${t.wilayah}</p>
              <p><i class="fa-brands fa-whatsapp"></i> ${i?t.kontak||"-":'<span class="muted">Login untuk lihat</span>'}</p>
              ${t.keterangan?`<p class="muted" style="margin-top:8px;font-size:13px;">${t.keterangan}</p>`:""}
            </div>
          </div>`:b.innerHTML='<p class="muted">Data kontak belum tersedia.</p>'}}let w=!1;function T(){if(w||(w=!0,!f.requireAdmin||!f.requireAdmin()))return;const d=document.getElementById("jenisLembaga"),e=document.getElementById("lembagaSearch"),r=document.getElementById("admLembagaTbody"),c=document.getElementById("btnAddLembaga"),u=document.getElementById("lembagaModal"),g=document.getElementById("lembagaForm");if(!d||!r||!c||!u||!g)return;let i=d.value||"rt",k=null;function b(){const a=y().filter(o=>o.jenis===i),n=((e==null?void 0:e.value)||"").toLowerCase();return n?a.filter(o=>`${o.nama} ${o.jabatan} ${o.wilayah} ${o.kontak}`.toLowerCase().includes(n)):a}function t(){const a=b();r.innerHTML=a.map(n=>`
        <tr>
          <td>${n.nama||"-"}</td>
          <td>${n.jabatan||"-"}</td>
          <td>${n.wilayah||"-"}</td>
          <td>${n.kontak||"-"}</td>
          <td>
            <button type="button" class="btn btn-ghost" data-action="edit" data-id="${n.id}">
              <i class="fa-solid fa-pen"></i> Edit
            </button>
          </td>
        </tr>`).join("")||'<tr><td colspan="5" class="empty">Belum ada data untuk jenis lembaga ini.</td></tr>'}function j(a){k=a?a.id:null,u.classList.add("open");const n=(o,l)=>{const s=document.getElementById(o);s&&(s.value=l||"")};n("fLembagaId",(a==null?void 0:a.id)||""),n("fLembagaJenis",(a==null?void 0:a.jenis)||i),n("fLembagaNama",(a==null?void 0:a.nama)||""),n("fLembagaJabatan",(a==null?void 0:a.jabatan)||""),n("fLembagaWilayah",(a==null?void 0:a.wilayah)||""),n("fLembagaKontak",(a==null?void 0:a.kontak)||""),n("fLembagaKet",(a==null?void 0:a.keterangan)||"")}function L(){u.classList.remove("open"),k=null}d.addEventListener("change",()=>{i=d.value||"rt",t()}),e&&e.addEventListener("input",t),c.addEventListener("click",()=>{j(null)}),r.addEventListener("click",a=>{const n=a.target.closest("[data-action='edit']");if(!n)return;const o=n.dataset.id,l=y().find(s=>s.id===o);l&&j(l)}),g.addEventListener("submit",a=>{a.preventDefault();const n=h=>{var v,I;return((I=(v=document.getElementById(h))==null?void 0:v.value)==null?void 0:I.trim())||""},o=n("fLembagaId")||`${n("fLembagaJenis")}-${Date.now().toString(36)}`,l=n("fLembagaJenis")||i,s=y(),K=s.findIndex(h=>h.id===o),$={id:o,jenis:l,nama:n("fLembagaNama"),jabatan:n("fLembagaJabatan"),wilayah:n("fLembagaWilayah"),kontak:n("fLembagaKontak"),keterangan:n("fLembagaKet")};K>=0?s[K]=$:s.push($),M(s),i=l,d.value=l,t(),L()}),document.addEventListener("click",a=>{a.target.closest("[data-action='closeLembagaModal']")&&L(),a.target===u&&L()}),t()}window.addEventListener("page:loaded",d=>{var r;const e=((r=d.detail)==null?void 0:r.name)||"";(e==="rt"||e==="rw"||e==="pkk"||e==="karang-taruna"||e==="lpmk")&&R(e)})})();

