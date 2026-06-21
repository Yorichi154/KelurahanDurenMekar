(function(){const{Data:Q,uid:va}=window.KelurahanStore,na=window.KelurahanGuard,Z=t=>{try{return new Date(t).toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"})}catch(a){return t||""}},da=t=>new Promise((a,i)=>{const d=new FileReader;d.onload=()=>a(String(d.result||"")),d.onerror=()=>i(new Error("Gagal membaca file")),d.readAsDataURL(t)});function z(t){const a=document.getElementById("fImagePreview");a&&(t?(a.src=t,a.style.display="block"):(a.removeAttribute("src"),a.style.display="none"))}function ha(t){document.body.classList.toggle("is-admin",!!t)}function Ia(t){document.querySelectorAll(".admin-side a").forEach(a=>{a.classList.toggle("active",a.getAttribute("href")===t)})}let sa=!1;function wa(){sa||(sa=!0,document.addEventListener("click",t=>{var n,e,o;const a=(e=(n=t.target).closest)==null?void 0:e.call(n,".group-toggle");if(!a)return;const i=(o=a.closest)==null?void 0:o.call(a,".menu-group");if(!i)return;const d=!i.classList.contains("open");i.classList.toggle("open",d),a.setAttribute("aria-expanded",d?"true":"false")}))}function Ba(t){var n;const a=document.getElementById("adminSideMenu");if(!a)return;const i=a.querySelector(`a[href="${t}"]`);if(!i)return;const d=(n=i.closest)==null?void 0:n.call(i,".menu-group");if(d){d.classList.add("open");const e=d.querySelector(".group-toggle");e&&e.setAttribute("aria-expanded","true")}}let oa=!1;function Sa(){if(oa)return;if(oa=!0,!document.getElementById("adminMenuBackdrop")){const i=document.createElement("div");i.id="adminMenuBackdrop",document.body.appendChild(i)}const t=()=>document.body.classList.remove("admin-menu-open"),a=()=>document.body.classList.toggle("admin-menu-open");document.addEventListener("click",i=>{var d,n,e,o;if(i.target.id==="adminMenuBackdrop")return t();if((n=(d=i.target).closest)!=null&&n.call(d,"[data-action='toggleAdminMenu']"))return a();if((o=(e=i.target).closest)!=null&&o.call(e,".admin-side a[data-page]"))return t()}),document.addEventListener("keydown",i=>{i.key==="Escape"&&t()})}function La(){const t=document.querySelector(".admin-top .top-actions");if(!t||t.querySelector("[data-action='toggleAdminMenu']"))return;const a=document.createElement("button");a.type="button",a.className="btn btn-ghost",a.setAttribute("data-action","toggleAdminMenu"),a.innerHTML='<i class="fa-solid fa-bars"></i> Menu';function _updateAdminToggle(){a.style.setProperty("display",(Math.max(document.documentElement.clientWidth||0,window.innerWidth||0)>=1024?"none":"inline-flex"),"important")}
_updateAdminToggle();window.addEventListener("resize",_updateAdminToggle);t.prepend(a)}function Ta(){const t=document.getElementById("adminUserLabel");if(!t)return;const a=na.getSession();t.textContent=a?`Login: ${a.name} (${a.role})`:"-"}async function b(t,a={}){var n;const i={Accept:"application/json","X-Requested-With":"XMLHttpRequest",...a.headers};if((a.method||"GET").toUpperCase()!=="GET"&&!i["X-CSRF-TOKEN"]){const e=(n=document.querySelector('meta[name="csrf-token"]'))==null?void 0:n.content;e&&(i["X-CSRF-TOKEN"]=e)}return fetch(t,{...a,credentials:"include",headers:i})}async function Aa(){var t,a,i,d;try{const n=await b("/api/admin/stats",{credentials:"include",headers:{Accept:"application/json"}});if(!n.ok)throw new Error("Gagal mengambil statistik");const e=await n.json();console.log("Stats:",e);const o=document.getElementById("metricBerita"),s=document.getElementById("metricGaleri"),r=document.getElementById("metricAgenda"),l=document.getElementById("metricPengumuman");o&&(o.textContent=(t=e.berita)!=null?t:0),s&&(s.textContent=(a=e.galeri)!=null?a:0),r&&(r.textContent=(i=e.agenda)!=null?i:0),l&&(l.textContent=(d=e.pengumuman)!=null?d:0)}catch(n){console.error("Dashboard Error:",n);const e=document.getElementById("metricBerita"),o=document.getElementById("metricGaleri"),s=document.getElementById("metricAgenda"),r=document.getElementById("metricPengumuman");e&&(e.textContent="-"),o&&(o.textContent="-"),s&&(s.textContent="-"),r&&(r.textContent="-")}}function Oa(t,a){if(t==="berita"){const i=`<span class="badge">${a.category||"Info"}</span>`,d=`<span class="badge" style="${a.status==="published"?"background:rgba(34,197,94,.12);color:#16a34a":"background:rgba(148,163,184,.22);color:#334155"}">${a.status||"draft"}</span>`;return`
        <tr>
          <td><b>${a.title}</b><div class="muted" style="font-size:12px">${a.excerpt||""}</div></td>
          <td>${i}</td>
          <td>${Z(a.date)}</td>
          <td>${d}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-warning btn-sm" data-action="edit" data-id="${a.id}"><i class="fa-solid fa-pen"></i> Edit</button>
              <button class="btn btn-danger btn-sm" data-action="delete" data-id="${a.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>`}if(t==="agenda")return`
        <tr>
          <td><b>${a.title}</b><div class="muted" style="font-size:12px">${a.content||""}</div></td>
          <td>${Z(a.date)}${a.time?" \u2022 "+a.time:""}</td>
          <td>${a.location||"-"}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-warning btn-sm" data-action="edit" data-id="${a.id}"><i class="fa-solid fa-pen"></i> Edit</button>
              <button class="btn btn-danger btn-sm" data-action="delete" data-id="${a.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>`;if(t==="galeri")return`
        <tr>
          <td><b>${a.title}</b><div class="muted" style="font-size:12px">${a.content||""}</div></td>
          <td><span class="badge">${a.category||"-"}</span></td>
          <td>${Z(a.date)}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-warning btn-sm" data-action="edit" data-id="${a.id}"><i class="fa-solid fa-pen"></i> Edit</button>
              <button class="btn btn-danger btn-sm" data-action="delete" data-id="${a.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>`;if(t==="pengumuman"){const d=(a.status||"info")==="urgent"?'<span class="badge badge-cat-darurat">URGENT</span>':'<span class="badge badge-cat-info">INFO</span>';return`
        <tr>
          <td><b>${a.title}</b><div class="muted" style="font-size:12px">${a.content||""}</div></td>
          <td>${Z(a.date)}</td>
          <td>${d}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-warning btn-sm" data-action="edit" data-id="${a.id}"><i class="fa-solid fa-pen"></i> Edit</button>
              <button class="btn btn-danger btn-sm" data-action="delete" data-id="${a.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>`}return""}function q(t,a){const i=document.getElementById("adminModal");if(!i)return;const d=document.getElementById("adminModalTitle");d&&(d.textContent=a?"Edit":"Tambah");const n=document.getElementById("itemId");n&&(n.value=(a==null?void 0:a.id)||"");const e={fTitle:(a==null?void 0:a.title)||"",fCategory:(a==null?void 0:a.category)||"",fDate:(a==null?void 0:a.date)||"",fTime:(a==null?void 0:a.time)||"",fLocation:(a==null?void 0:a.location)||"",fExcerpt:(a==null?void 0:a.excerpt)||"",fContent:(a==null?void 0:a.content)||"",fStatus:(a==null?void 0:a.status)||(t==="pengumuman"?"info":"published")};Object.entries(e).forEach(([r,l])=>{const c=document.getElementById(r);c&&(c.value=l)});const o=document.getElementById("fImageExisting");o&&(o.value=(a==null?void 0:a.image)||"");const s=document.getElementById("fImage");s&&s.type==="file"&&(s.value=""),z((a==null?void 0:a.image)||""),i.classList.add("open"),i.setAttribute("aria-hidden","false")}function W(){const t=document.getElementById("adminModal");t&&t.classList.remove("open"),t.setAttribute("aria-hidden","true")}function Ua(t){const a=n=>{var e,o;return((o=(e=document.getElementById(n))==null?void 0:e.value)==null?void 0:o.trim())||""},d={id:a("itemId")||va()};return t==="berita"?{...d,title:a("fTitle"),category:a("fCategory"),date:a("fDate"),image:"",excerpt:a("fExcerpt"),content:a("fContent"),status:a("fStatus")||"draft"}:t==="agenda"?{...d,title:a("fTitle"),date:a("fDate"),time:a("fTime"),location:a("fLocation"),content:a("fContent")}:t==="galeri"?{...d,title:a("fTitle"),category:a("fCategory"),date:a("fDate"),image:"",content:a("fContent")}:t==="pengumuman"?{...d,title:a("fTitle"),date:a("fDate"),status:a("fStatus")||"info",content:a("fContent")}:d}function R(t){try{const a=localStorage.getItem(t),i=a?JSON.parse(a):[];return Array.isArray(i)?i:[]}catch(a){return[]}}function J(t,a){localStorage.setItem(t,JSON.stringify(Array.isArray(a)?a:[]))}function ia(t="id"){return`${t}-${Math.random().toString(36).slice(2,10)}-${Date.now().toString(36)}`}function O(t){if(!t)return"-";const a=new Date(t);return Number.isNaN(a.getTime())?String(t):a.toLocaleString("id-ID",{year:"numeric",month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit"})}function Y(t,a="pengaduan"){const i=(t||"").toLowerCase();let d="badge-neutral";return a==="pengaduan"?(i==="baru"&&(d="badge-new"),i==="diproses"&&(d="badge-proses"),i==="selesai"&&(d="badge-done"),i==="ditolak"&&(d="badge-reject")):(i==="menunggu"&&(d="badge-wait"),i==="diproses"&&(d="badge-proses"),i==="selesai"&&(d="badge-done"),i==="siap_diambil"&&(d="badge-done"),i==="ditolak"&&(d="badge-reject")),a==="umkm"&&(i==="aktif"&&(d="badge-done"),i==="nonaktif"&&(d="badge-neutral")),a==="faq"&&(i==="published"&&(d="badge-done"),i==="draft"&&(d="badge-wait")),`<span class="badge ${d}">${i==="siap_diambil"?"Siap Diambil":t||"-"}</span>`}function aa(t){const a=document.getElementById(t);a&&(a.classList.add("open"),a.setAttribute("aria-hidden","false"))}function U(t){const a=document.getElementById(t);a&&(a.classList.remove("open"),a.setAttribute("aria-hidden","true"))}let ra=!1;async function ja(){const t=(i,d)=>{const n=document.getElementById(i);n&&(n.value=d||"")};async function a(){var i;try{const d=await b("/api/admin/setting",{credentials:"same-origin",headers:{Accept:"application/json"}});if(!d.ok)return;const n=await d.json();if(!n)return;t("pkSiteName",n.site_name),t("pkLurahName",n.lurah_name),t("pkKecamatan",n.kecamatan),t("pkKota",n.kota),t("pkProvinsi",n.provinsi),t("pkKodepos",n.kodepos),t("pkDeskripsi",n.profil),t("pkVisi",n.visi),t("pkMisi",n.misi),t("pkLuas",n.luas_wilayah),t("pkPenduduk",n.jumlah_penduduk),t("pkRT",n.jumlah_rt),t("pkRW",n.jumlah_rw),t("pkEmail",n.email),t("pkPhone",n.phone),t("pkAddress",n.address),t("pkInstagram",n.instagram),t("pkFacebook",n.facebook),t("pkYoutube",n.youtube),t("pkMaps",n.maps),t("pkJam",n.jam_pelayanan),(i=window.KelurahanStore)!=null&&i.Data&&window.KelurahanStore.Data.saveSettings({siteName:n.site_name||"",email:n.email||"",phone:n.phone||"",address:n.address||"",instagram:n.instagram||"",facebook:n.facebook||"",youtube:n.youtube||"",note:n.profil||"",lurahName:n.lurah_name||"",kecamatan:n.kecamatan||"",kota:n.kota||"",provinsi:n.provinsi||"",kodepos:n.kodepos||"",profil:n.profil||"",maps:n.maps||"",jamPelayanan:n.jam_pelayanan||"",visi:n.visi||"",misi:n.misi||"",luas_wilayah:n.luas_wilayah||"",jumlah_penduduk:n.jumlah_penduduk||"",jumlah_rt:n.jumlah_rt||"",jumlah_rw:n.jumlah_rw||""})}catch(d){console.error("Gagal load profil kelurahan:",d)}}await a(),!ra&&(ra=!0,document.addEventListener("click",async i=>{var s;const d=i.target.closest("[data-action='saveProfil']");if(i.target.closest("[data-action='resetProfil']")){await a();return}if(!d)return;const e=r=>{var l,c;return((c=(l=document.getElementById(r))==null?void 0:l.value)==null?void 0:c.trim())||""},o={site_name:e("pkSiteName"),lurah_name:e("pkLurahName"),kecamatan:e("pkKecamatan"),kota:e("pkKota"),provinsi:e("pkProvinsi"),kodepos:e("pkKodepos"),profil:e("pkDeskripsi"),visi:e("pkVisi"),misi:e("pkMisi"),luas_wilayah:e("pkLuas"),jumlah_penduduk:e("pkPenduduk"),jumlah_rt:e("pkRT"),jumlah_rw:e("pkRW"),email:e("pkEmail"),phone:e("pkPhone"),address:e("pkAddress"),instagram:e("pkInstagram"),facebook:e("pkFacebook"),youtube:e("pkYoutube"),maps:e("pkMaps"),jam_pelayanan:e("pkJam")};try{const l=await(await b("/api/admin/setting",{credentials:"same-origin",headers:{Accept:"application/json"}})).json().catch(()=>null),c=(s=document.querySelector('meta[name="csrf-token"]'))==null?void 0:s.content;let m;if(l!=null&&l.id?m=await b(`/api/admin/setting/${l.id}`,{method:"PUT",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":c,Accept:"application/json"},credentials:"same-origin",body:JSON.stringify(o)}):m=await b("/api/admin/setting",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":c,Accept:"application/json"},credentials:"same-origin",body:JSON.stringify(o)}),!m.ok)throw new Error("Gagal menyimpan ke server");alert("Profil kelurahan berhasil disimpan."),await a(),window.dispatchEvent(new CustomEvent("settings:changed"))}catch(r){alert("Gagal menyimpan profil: "+r.message)}}))}let la=!1;function Ha(){const t=document.getElementById("adminPengaduanTbody"),a=document.getElementById("adminPengaduanEmpty"),i=document.getElementById("adminPengaduanSearch"),d=document.getElementById("adminPengaduanFilter");if(!t)return;const n=()=>{const s=R("pengaduan");let r=!1;for(const l of s)l.id||(l.id=ia("pd"),r=!0),l.status||(l.status="baru",r=!0);r&&J("pengaduan",s)},e=()=>R("pengaduan").slice().sort((s,r)=>{const l=new Date(s.tanggal||s.createdAt||0).getTime();return new Date(r.tanggal||r.createdAt||0).getTime()-l}),o=()=>{const s=((i==null?void 0:i.value)||"").trim().toLowerCase(),r=((d==null?void 0:d.value)||"").trim().toLowerCase();let l=e();s&&(l=l.filter(c=>`${c.nama||""} ${c.judul||""} ${c.isi||""}`.toLowerCase().includes(s))),r&&(l=l.filter(c=>(c.status||"").toLowerCase()==r)),t.innerHTML=l.map(c=>`
          <tr>
            <td>${c.nama||"-"}</td>
            <td>${c.judul||"-"}</td>
            <td>${O(c.tanggal||c.createdAt)}</td>
            <td>${Y(c.status,"pengaduan")}</td>
            <td>
              <div class="row-actions">
                <button class="btn btn-ghost" data-action="pengaduanDetail" data-id="${c.id}"><i class="fa-regular fa-eye"></i> Detail</button>
                <button class="btn btn-ghost" data-action="pengaduanDelete" data-id="${c.id}"><i class="fa-regular fa-trash-can"></i> Hapus</button>
              </div>
            </td>
          </tr>
        `).join(""),a&&(a.style.display=l.length?"none":"block")};n(),o(),i==null||i.addEventListener("input",o),d==null||d.addEventListener("change",o),!la&&(la=!0,document.addEventListener("click",s=>{var v;const r=s.target.closest("[data-action='pengaduanDetail']"),l=s.target.closest("[data-action='pengaduanDelete']"),c=s.target.closest("[data-action='closePengaduanModal']"),m=s.target.closest("[data-action='savePengaduanStatus']");if(c){U("adminPengaduanModal");return}if(l){const E=l.dataset.id;if(!confirm("Hapus pengaduan ini?"))return;const I=R("pengaduan").filter(u=>u.id!=E);J("pengaduan",I),o();return}if(r){const E=r.dataset.id,u=R("pengaduan").find(p=>p.id==E);if(!u)return;document.getElementById("apdId").value=u.id,document.getElementById("apdNama").value=u.nama||"",document.getElementById("apdTanggal").value=O(u.tanggal||u.createdAt),document.getElementById("apdJudul").value=u.judul||"",document.getElementById("apdIsi").value=u.isi||"",document.getElementById("apdStatus").value=(u.status||"baru").toLowerCase(),document.getElementById("apdCatatan").value=u.catatanAdmin||"";const g=document.getElementById("adminPengaduanModalSub");g&&(g.textContent=`ID: ${u.id}`),aa("adminPengaduanModal");return}if(m){const E=document.getElementById("apdId").value,I=document.getElementById("apdStatus").value,u=((v=document.getElementById("apdCatatan").value)==null?void 0:v.trim())||"",g=R("pengaduan"),p=g.find(f=>f.id==E);if(!p)return;p.status=I,p.catatanAdmin=u,p.updatedAt=new Date().toISOString(),J("pengaduan",g),U("adminPengaduanModal"),o()}}))}let ca=!1;function Ga(){const t=document.getElementById("adminSuratTbody"),a=document.getElementById("adminSuratEmpty"),i=document.getElementById("adminSuratSearch"),d=document.getElementById("adminSuratFilter");if(!t)return;const n=()=>{const s=R("surat");let r=!1;for(const l of s)l.id||(l.id=ia("sr"),r=!0),l.status||(l.status="menunggu",r=!0);r&&J("surat",s)},e=()=>R("surat").slice().sort((s,r)=>{const l=new Date(s.tanggal||s.createdAt||0).getTime();return new Date(r.tanggal||r.createdAt||0).getTime()-l}),o=()=>{const s=((i==null?void 0:i.value)||"").trim().toLowerCase(),r=((d==null?void 0:d.value)||"").trim().toLowerCase();let l=e();s&&(l=l.filter(c=>`${c.nama||""} ${c.jenis||c.jenisSurat||""} ${c.keperluan||""}`.toLowerCase().includes(s))),r&&(l=l.filter(c=>(c.status||"").toLowerCase()==r)),t.innerHTML=l.map(c=>`
          <tr>
            <td>${c.jenis||c.jenisSurat||"-"}</td>
            <td>${c.nama||"-"}</td>
            <td>${O(c.tanggal||c.createdAt)}</td>
            <td>${Y(c.status,"surat")}</td>
            <td>
              <div class="row-actions">
                <button class="btn btn-ghost" data-action="suratDetail" data-id="${c.id}"><i class="fa-regular fa-eye"></i> Detail</button>
                <button class="btn btn-ghost" data-action="suratDelete" data-id="${c.id}"><i class="fa-regular fa-trash-can"></i> Hapus</button>
              </div>
            </td>
          </tr>
        `).join(""),a&&(a.style.display=l.length?"none":"block")};n(),o(),i==null||i.addEventListener("input",o),d==null||d.addEventListener("change",o),!ca&&(ca=!0,document.addEventListener("click",s=>{var v;const r=s.target.closest("[data-action='suratDetail']"),l=s.target.closest("[data-action='suratDelete']"),c=s.target.closest("[data-action='closeSuratModal']"),m=s.target.closest("[data-action='saveSuratStatus']");if(c){U("adminSuratModal");return}if(l){const E=l.dataset.id;if(!confirm("Hapus pengajuan surat ini?"))return;const I=R("surat").filter(u=>u.id!=E);J("surat",I),o();return}if(r){const E=r.dataset.id,u=R("surat").find(p=>p.id==E);if(!u)return;document.getElementById("asId").value=u.id,document.getElementById("asJenis").value=u.jenis||u.jenisSurat||"",document.getElementById("asTanggal").value=O(u.tanggal||u.createdAt),document.getElementById("asNama").value=u.nama||"",document.getElementById("asNik").value=u.nik||u.NIK||"",document.getElementById("asKeperluan").value=u.keperluan||u.keterangan||"",document.getElementById("asStatus").value=(u.status||"menunggu").toLowerCase(),document.getElementById("asCatatan").value=u.catatanAdmin||"";const g=document.getElementById("adminSuratModalSub");g&&(g.textContent=`ID: ${u.id}`),aa("adminSuratModal");return}if(m){const E=document.getElementById("asId").value,I=document.getElementById("asStatus").value,u=((v=document.getElementById("asCatatan").value)==null?void 0:v.trim())||"",g=R("surat"),p=g.find(f=>f.id==E);if(!p)return;p.status=I,p.catatanAdmin=u,p.updatedAt=new Date().toISOString(),J("surat",g),U("adminSuratModal"),o()}}))}function ea(t){const{type:a,searchId:i,tbodyId:d,emptyId:n,modalId:e,formId:o,titleId:s,createAction:r,closeAction:l,buildItem:c,fillForm:m,row:v,editAction:E,deleteAction:I}=t,u=document.getElementById(d);if(!u)return;const g=document.getElementById(n),p=document.getElementById(i),f=document.getElementById(e),S=document.getElementById(o),T=document.getElementById(s),A=()=>{const $=((p==null?void 0:p.value)||"").trim().toLowerCase();let L=Q.list(a);$&&(L=L.filter(k=>JSON.stringify(k).toLowerCase().includes($))),u.innerHTML=L.map(v).join(""),g&&(g.style.display=L.length?"none":"block")},D=()=>{f&&(f.classList.add("open"),f.setAttribute("aria-hidden","false"))},K=()=>{f&&(f.classList.remove("open"),f.setAttribute("aria-hidden","true"))},_=()=>{var L;if(!S)return;(L=S.reset)==null||L.call(S);const $=S.querySelector('input[type="hidden"]');$&&($.value="")},M=`__admin_simple_${a}`;window[M]||(window[M]=!0,p==null||p.addEventListener("input",A),document.addEventListener("click",$=>{const L=$.target.closest(`[data-action='${r}']`),k=$.target.closest(`[data-action='${l}']`),h=$.target.closest(`[data-action='${E}']`),y=$.target.closest(`[data-action='${I}']`);if(L){_(),T&&(T.textContent=T.dataset.createTitle||"Tambah Data"),D();return}if(k){K();return}if(h){const w=h.dataset.id,j=Q.get(a,w);if(!j)return;m(j),T&&(T.textContent=T.dataset.editTitle||"Ubah Data"),D();return}if(y){const w=y.dataset.id;if(!confirm("Hapus data ini?"))return;Q.remove(a,w),A();return}}),S==null||S.addEventListener("submit",$=>{$.preventDefault();const L=c();L.id||(L.id=KelurahanStore.uid()),Q.upsert(a,L),K(),A()})),A()}function Ja(){ea({type:"umkm",searchId:"adminUmkmSearch",tbodyId:"adminUmkmTbody",emptyId:"adminUmkmEmpty",modalId:"adminUmkmModal",formId:"adminUmkmForm",titleId:"adminUmkmModalTitle",createAction:"umkmCreate",closeAction:"umkmClose",editAction:"umkmEdit",deleteAction:"umkmDelete",buildItem:()=>{var t,a,i,d,n,e,o,s,r,l,c,m;return{id:((t=document.getElementById("umkmId"))==null?void 0:t.value)||"",nama:((i=(a=document.getElementById("umkmNama"))==null?void 0:a.value)==null?void 0:i.trim())||"",pemilik:((n=(d=document.getElementById("umkmPemilik"))==null?void 0:d.value)==null?void 0:n.trim())||"",kategori:((o=(e=document.getElementById("umkmKategori"))==null?void 0:e.value)==null?void 0:o.trim())||"",kontak:((r=(s=document.getElementById("umkmKontak"))==null?void 0:s.value)==null?void 0:r.trim())||"",status:((l=document.getElementById("umkmStatus"))==null?void 0:l.value)||"aktif",alamat:((m=(c=document.getElementById("umkmAlamat"))==null?void 0:c.value)==null?void 0:m.trim())||"",updatedAt:new Date().toISOString()}},fillForm:t=>{document.getElementById("umkmId").value=t.id||"",document.getElementById("umkmNama").value=t.nama||"",document.getElementById("umkmPemilik").value=t.pemilik||"",document.getElementById("umkmKategori").value=t.kategori||"",document.getElementById("umkmKontak").value=t.kontak||"",document.getElementById("umkmStatus").value=t.status||"aktif",document.getElementById("umkmAlamat").value=t.alamat||""},row:t=>`
        <tr>
          <td>${t.nama||"-"}</td>
          <td>${t.pemilik||"-"}</td>
          <td>${t.kategori||"-"}</td>
          <td>${Y(t.status||"aktif","umkm")}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-ghost" data-action="umkmEdit" data-id="${t.id}"><i class="fa-regular fa-pen-to-square"></i> Edit</button>
              <button class="btn btn-ghost" data-action="umkmDelete" data-id="${t.id}"><i class="fa-regular fa-trash-can"></i> Hapus</button>
            </div>
          </td>
        </tr>
      `})}function Ya(){ea({type:"rtrw",searchId:"adminRtrwSearch",tbodyId:"adminRtrwTbody",emptyId:"adminRtrwEmpty",modalId:"adminRtrwModal",formId:"adminRtrwForm",titleId:"adminRtrwModalTitle",createAction:"rtrwCreate",closeAction:"rtrwClose",editAction:"rtrwEdit",deleteAction:"rtrwDelete",buildItem:()=>{var t,a,i,d,n,e,o,s,r;return{id:((t=document.getElementById("rtrwId"))==null?void 0:t.value)||"",rt:((i=(a=document.getElementById("rtrwRt"))==null?void 0:a.value)==null?void 0:i.trim())||"",rw:((n=(d=document.getElementById("rtrwRw"))==null?void 0:d.value)==null?void 0:n.trim())||"",ketua:((o=(e=document.getElementById("rtrwKetua"))==null?void 0:e.value)==null?void 0:o.trim())||"",kontak:((r=(s=document.getElementById("rtrwKontak"))==null?void 0:s.value)==null?void 0:r.trim())||"",updatedAt:new Date().toISOString()}},fillForm:t=>{document.getElementById("rtrwId").value=t.id||"",document.getElementById("rtrwRt").value=t.rt||"",document.getElementById("rtrwRw").value=t.rw||"",document.getElementById("rtrwKetua").value=t.ketua||"",document.getElementById("rtrwKontak").value=t.kontak||""},row:t=>`
        <tr>
          <td>RT ${t.rt||"-"} / RW ${t.rw||"-"}</td>
          <td>${t.ketua||"-"}</td>
          <td>${t.kontak||"-"}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-ghost" data-action="rtrwEdit" data-id="${t.id}"><i class="fa-regular fa-pen-to-square"></i> Edit</button>
              <button class="btn btn-ghost" data-action="rtrwDelete" data-id="${t.id}"><i class="fa-regular fa-trash-can"></i> Hapus</button>
            </div>
          </td>
        </tr>
      `})}function Xa(){ea({type:"faq",searchId:"adminFaqSearch",tbodyId:"adminFaqTbody",emptyId:"adminFaqEmpty",modalId:"adminFaqModal",formId:"adminFaqForm",titleId:"adminFaqModalTitle",createAction:"faqCreate",closeAction:"faqClose",editAction:"faqEdit",deleteAction:"faqDelete",buildItem:()=>{var t,a,i,d,n,e,o,s;return{id:((t=document.getElementById("faqId"))==null?void 0:t.value)||"",q:((i=(a=document.getElementById("faqQ"))==null?void 0:a.value)==null?void 0:i.trim())||"",a:((n=(d=document.getElementById("faqA"))==null?void 0:d.value)==null?void 0:n.trim())||"",cat:((o=(e=document.getElementById("faqCat"))==null?void 0:e.value)==null?void 0:o.trim())||"",status:((s=document.getElementById("faqStatus"))==null?void 0:s.value)||"published",updatedAt:new Date().toISOString()}},fillForm:t=>{document.getElementById("faqId").value=t.id||"",document.getElementById("faqQ").value=t.q||"",document.getElementById("faqA").value=t.a||"",document.getElementById("faqCat").value=t.cat||"",document.getElementById("faqStatus").value=t.status||"published"},row:t=>`
        <tr>
          <td>${t.q||"-"}</td>
          <td>${t.cat||"-"}</td>
          <td>${Y(t.status||"draft","faq")}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-ghost" data-action="faqEdit" data-id="${t.id}"><i class="fa-regular fa-pen-to-square"></i> Edit</button>
              <button class="btn btn-ghost" data-action="faqDelete" data-id="${t.id}"><i class="fa-regular fa-trash-can"></i> Hapus</button>
            </div>
          </td>
        </tr>
      `})}async function $a(){var a;async function t(){var o,s,r,l,c,m,v,E,I,u,g,p;const d=await(await b("/api/admin/laporan")).json();document.getElementById("lapTotalBerita").textContent=(o=d.berita)!=null?o:0,document.getElementById("lapTotalAgenda").textContent=(s=d.agenda)!=null?s:0,document.getElementById("lapTotalPengumuman").textContent=(r=d.pengumuman)!=null?r:0,document.getElementById("lapTotalGaleri").textContent=(l=d.galeri)!=null?l:0,document.getElementById("lapTotalSurat").textContent=(c=d.surat)!=null?c:0,document.getElementById("lapTotalPengaduan").textContent=(m=d.pengaduan)!=null?m:0,document.getElementById("lapTotalRtrw").textContent=(v=d.rtrw)!=null?v:0,document.getElementById("lapTotalFaq").textContent=(E=d.faq)!=null?E:0,document.getElementById("lapTotalLembaga").textContent=(I=d.lembaga)!=null?I:0,document.getElementById("lapTotalUnitKerja").textContent=(u=d.unit_kerja)!=null?u:0,document.getElementById("lapTotalPelayanan").textContent=(g=d.pelayanan)!=null?g:0,document.getElementById("lapTotalUser").textContent=(p=d.user)!=null?p:0;const n=document.getElementById("lapSuratTbody");n.innerHTML=(d.surat_status||[]).map(f=>`
                    <tr>
                        <td>${f.status}</td>
                        <td>${f.total}</td>
                    </tr>
                `).join("");const e=document.getElementById("lapPengaduanTbody");e.innerHTML=(d.pengaduan_status||[]).map(f=>`
                    <tr>
                        <td>${f.status}</td>
                        <td>${f.total}</td>
                    </tr>
                `).join("")}await t(),(a=document.querySelector("[data-action='refreshLaporan']"))==null||a.addEventListener("click",t)}let za=!1;async function X(){if(!document.getElementById("adminTbody"))return;async function a(){try{const e=await b("/api/admin/berita");if(!e.ok)throw new Error("HTTP "+e.status);const o=await e.json(),s=document.getElementById("adminTbody");if(!s)return;s.innerHTML=o.map(function(r){return`<tr data-id="${r.id}">
        <td>
            <b>${r.title||""}</b>
            <div style="font-size:12px;color:#888">${r.excerpt||""}</div>
        </td>
        <td><span class="badge">${r.category||"-"}</span></td>
        <td>${r.date||"-"}</td>
        <td>
            <span class="badge" style="${r.status==="published"?"background:rgba(34,197,94,.12);color:#16a34a":"background:rgba(148,163,184,.22);color:#334155"}">${r.status||"draft"}</span>
        </td>
        <td>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
                <button type="button"
                    style="padding:5px 12px;border-radius:6px;border:none;cursor:pointer;background:#f59e0b;color:#fff;font-size:13px;display:inline-flex;align-items:center;gap:5px"
                    data-action="editBerita" data-id="${r.id}">
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button type="button"
                    style="padding:5px 12px;border-radius:6px;border:none;cursor:pointer;background:#ef4444;color:#fff;font-size:13px;display:inline-flex;align-items:center;gap:5px"
                    data-action="deleteBerita" data-id="${r.id}">
                    <i class="fa-solid fa-trash"></i> Hapus
                </button>
            </div>
        </td>
    </tr>`}).join("")}catch(e){console.error("Gagal memuat berita:",e)}}X._loadData=a,await a();var i=document.querySelector("[data-action='create']");i&&!i.dataset.bound&&(i.dataset.bound="true",i.addEventListener("click",function(){q("berita",null)}));var d=document.getElementById("fImage");d&&!d.dataset.bound&&(d.dataset.bound="true",d.addEventListener("change",async function(e){var o=e.target.files[0];if(o)try{var s=await da(o),r=document.getElementById("fImageExisting");r&&(r.value=s),z(s)}catch(l){alert("Gagal membaca file")}}));var n=document.getElementById("adminForm");n&&(n.removeAttribute("data-bound"),n.onsubmit=null,n.onsubmit=async function(e){var v,E,I,u,g,p,f,S;e.preventDefault();var o=(((v=document.getElementById("itemId"))==null?void 0:v.value)||"").trim(),s={title:((E=document.getElementById("fTitle"))==null?void 0:E.value)||"",category:((I=document.getElementById("fCategory"))==null?void 0:I.value)||"",date:((u=document.getElementById("fDate"))==null?void 0:u.value)||"",excerpt:((g=document.getElementById("fExcerpt"))==null?void 0:g.value)||"",content:((p=document.getElementById("fContent"))==null?void 0:p.value)||"",status:((f=document.getElementById("fStatus"))==null?void 0:f.value)||"draft",image:((S=document.getElementById("fImageExisting"))==null?void 0:S.value)||""};try{var r=o?"/api/admin/berita/"+o:"/api/admin/berita",l=o?"PUT":"POST",c=await b(r,{method:l,headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if(!c.ok){var m=await c.json().catch(function(){return{}});alert("Gagal menyimpan: "+(m.message||c.status));return}W(),await a()}catch(T){console.error(T),alert("Terjadi kesalahan saat menyimpan berita")}}),X._loadData=a}async function ua(){const t=document.getElementById("adminTbody");if(!t)return;async function a(){try{const e=await(await b("/api/admin/agenda")).json();t.innerHTML=e.map(o=>`
                <tr>
                    <td>${o.title}</td>
                    <td>${o.date}</td>
                    <td>${o.time||""}</td>
                    <td>${o.location||""}</td>
                    <td>
                        <button
                            class="btn btn-warning btn-sm"
                            data-action="editAgenda"
                            data-id="${o.id}">
                            Edit
                        </button>
                        <button
                            class="btn btn-danger btn-sm"
                            data-action="deleteAgenda"
                            data-id="${o.id}">
                            Hapus
                        </button>
                    </td>
                </tr>
            `).join("")}catch(n){console.error("Gagal memuat agenda",n)}}await a();const i=document.querySelector("[data-action='create']");i&&(i.onclick=()=>{var n;document.getElementById("itemId").value="",(n=document.getElementById("adminForm"))==null||n.reset(),document.getElementById("adminModalTitle")&&(document.getElementById("adminModalTitle").textContent="Tambah Agenda"),q("agenda")});const d=document.getElementById("adminForm");d&&(d.onsubmit=async n=>{var l;n.preventDefault();const e=document.getElementById("itemId").value,o={title:document.getElementById("fTitle").value,date:document.getElementById("fDate").value,time:document.getElementById("fTime").value,location:document.getElementById("fLocation").value,content:document.getElementById("fContent").value},s=(l=document.querySelector('meta[name="csrf-token"]'))==null?void 0:l.content;let r;if(e?r=await b(`/api/admin/agenda/${e}`,{method:"PUT",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":s,Accept:"application/json"},body:JSON.stringify(o)}):r=await b("/api/admin/agenda",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":s,Accept:"application/json"},body:JSON.stringify(o)}),!r.ok){alert("Gagal menyimpan agenda");return}W(),await a()})}async function ma(){const t=document.getElementById("adminTbody");if(!t)return;async function a(){try{const e=await(await b("/api/admin/pengumuman")).json();t.innerHTML=e.map(o=>`
                    <tr>
                        <td>${o.title}</td>
                        <td>${o.date}</td>
                        <td>${o.status}</td>
                        <td>
                            <button
                                class="btn btn-warning btn-sm"
                                data-action="editPengumuman"
                                data-id="${o.id}">
                                Edit
                            </button>
                            <button
                                class="btn btn-danger btn-sm"
                                data-action="deletePengumuman"
                                data-id="${o.id}">
                                Hapus
                            </button>
                        </td>
                    </tr>
                `).join("")}catch(n){console.error("Gagal memuat pengumuman",n)}}await a();const i=document.querySelector("[data-action='create']");i&&(i.onclick=()=>{var n;document.getElementById("itemId").value="",(n=document.getElementById("adminForm"))==null||n.reset(),document.getElementById("adminModalTitle")&&(document.getElementById("adminModalTitle").textContent="Tambah Pengumuman"),q("pengumuman")});const d=document.getElementById("adminForm");d&&(d.onsubmit=async n=>{var l;n.preventDefault();const e=document.getElementById("itemId").value,o={title:document.getElementById("fTitle").value,date:document.getElementById("fDate").value,status:document.getElementById("fStatus").value,content:document.getElementById("fContent").value},s=(l=document.querySelector('meta[name="csrf-token"]'))==null?void 0:l.content;let r;if(e?r=await b(`/api/admin/pengumuman/${e}`,{method:"PUT",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":s,Accept:"application/json"},body:JSON.stringify(o)}):r=await b("/api/admin/pengumuman",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":s,Accept:"application/json"},body:JSON.stringify(o)}),!r.ok){alert("Gagal menyimpan pengumuman");return}W(),await a()})}async function Da(){console.log("INIT GALERI JALAN");const t=document.getElementById("adminTbody");if(!t)return;async function a(){try{const o=await(await b("/api/admin/galeri")).json();console.log("BERITA RESPONSE =",o),console.log("BERITA ARRAY =",Array.isArray(o)),t.innerHTML=o.map(s=>{var r,l;return`
                <tr>
                    <td>${s.title}</td>
                    <td>${(r=s.category)!=null?r:"-"}</td>
                    <td>${(l=s.date)!=null?l:"-"}</td>
                    <td>
                        <button
                            class="btn btn-warning btn-sm"
                            onclick="editGaleri(${s.id})">
                            Edit
                        </button>

                        <button
                            class="btn btn-danger btn-sm"
                            onclick="deleteGaleri(${s.id})">
                            Hapus
                        </button>
                    </td>
                </tr>
            `}).join("")}catch(e){console.error("Galeri Error:",e)}}await a();const i=document.querySelector("[data-action='create']");i&&!i.dataset.boundLaravel&&(i.dataset.boundLaravel="true",i.addEventListener("click",()=>{var e;document.getElementById("itemId").value="",(e=document.getElementById("adminForm"))==null||e.reset(),z(""),q("galeri")}));const d=document.getElementById("fImage");d&&d.addEventListener("change",async e=>{const o=e.target.files[0];if(o)try{const s=await da(o);document.getElementById("fImageExisting").value=s,z(s)}catch(s){console.error(s),alert("Gagal membaca file")}});const n=document.getElementById("adminForm");n&&!n.dataset.boundLaravel&&(n.dataset.boundLaravel="true",n.addEventListener("submit",async e=>{var r;e.preventDefault();const o=document.getElementById("itemId").value,s={title:document.getElementById("fTitle").value,category:document.getElementById("fCategory").value,date:document.getElementById("fDate").value,image:((r=document.getElementById("fImageExisting"))==null?void 0:r.value)||"",content:document.getElementById("fContent").value};try{let l;if(o?(console.log(s),l=await b(`/api/admin/galeri/${o}`,{method:"PUT",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(s)})):l=await b("/api/admin/galeri",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(s)}),!l.ok)throw new Error("Gagal menyimpan galeri");n.reset(),document.getElementById("itemId").value="",W(),await a()}catch(l){console.error(l),alert("Gagal menyimpan galeri")}})),window.editGaleri=async function(e){var o,s,r,l;try{const m=await(await b(`/api/admin/galeri/${e}`)).json();document.getElementById("itemId").value=m.id,document.getElementById("fTitle").value=(o=m.title)!=null?o:"",document.getElementById("fCategory").value=(s=m.category)!=null?s:"",document.getElementById("fDate").value=(r=m.date)!=null?r:"",document.getElementById("fContent").value=(l=m.content)!=null?l:"";const v=document.getElementById("fImageExisting");v&&(v.value=m.image||""),z(m.image||""),q("galeri",m)}catch(c){console.error(c)}},window.deleteGaleri=async function(e){if(confirm("Hapus galeri ini?"))try{(await(await b(`/api/admin/galeri/${e}`,{method:"DELETE",headers:{Accept:"application/json"}})).json()).success&&await a()}catch(o){console.error(o)}}}async function Pa(){const t=document.getElementById("adminPengaduanTbody"),a=document.getElementById("adminPengaduanEmpty"),i=document.getElementById("adminPengaduanSearch")||document.getElementById("adminPengaduanSearchTop"),d=document.getElementById("adminPengaduanFilter");if(!t)return;let n=[];async function e(){try{n=await(await b("/api/admin/pengaduan",{credentials:"same-origin",headers:{Accept:"application/json"}})).json(),o()}catch(s){console.error("Gagal memuat pengaduan",s)}}function o(){const s=((i==null?void 0:i.value)||"").trim().toLowerCase(),r=((d==null?void 0:d.value)||"").trim().toLowerCase();let l=n;s&&(l=l.filter(c=>{var m;return`${((m=c.user)==null?void 0:m.name)||""} ${c.judul||""} ${c.isi||""}`.toLowerCase().includes(s)})),r&&(l=l.filter(c=>{const m=(c.status||"").toLowerCase();return r==="baru"?m==="baru"||m==="menunggu":m===r})),t.innerHTML=l.map(c=>{var m;return`
            <tr>
                <td>${((m=c.user)==null?void 0:m.name)||"-"}</td>
                <td>${c.judul||"-"}</td>
                <td>${O(c.created_at||c.tanggal)}</td>
                <td>${Y(c.status,"pengaduan")}</td>
                <td>
                    <div class="row-actions">
                        <button class="btn btn-ghost" data-action="pengaduanDetailLaravel" data-id="${c.id}"><i class="fa-regular fa-eye"></i> Detail</button>
                        <button class="btn btn-ghost" data-action="pengaduanDeleteLaravel" data-id="${c.id}"><i class="fa-regular fa-trash-can"></i> Hapus</button>
                    </div>
                </td>
            </tr>
        `}).join(""),a&&(a.style.display=l.length?"none":"block")}await e(),i==null||i.addEventListener("input",o),d==null||d.addEventListener("change",o),window._pengaduanLaravelBound||(window._pengaduanLaravelBound=!0,document.addEventListener("click",async s=>{var v,E,I;const r=s.target.closest("[data-action='pengaduanDetailLaravel']"),l=s.target.closest("[data-action='pengaduanDeleteLaravel']"),c=s.target.closest("[data-action='closePengaduanModal']"),m=s.target.closest("[data-action='savePengaduanStatus']");if(c){U("adminPengaduanModal");return}if(l){const u=l.dataset.id;if(!confirm("Hapus pengaduan ini secara permanen?"))return;try{(await b(`/api/admin/pengaduan/${u}`,{method:"DELETE",headers:{"X-CSRF-TOKEN":(v=document.querySelector('meta[name="csrf-token"]'))==null?void 0:v.content,Accept:"application/json"}})).ok?(alert("Pengaduan berhasil dihapus"),e()):alert("Gagal menghapus pengaduan")}catch(g){console.error(g),alert("Gagal menghapus pengaduan")}return}if(r){const u=r.dataset.id;try{const p=await(await b(`/api/admin/pengaduan/${u}`,{headers:{Accept:"application/json"}})).json();if(!p)return;document.getElementById("apdId").value=p.id,document.getElementById("apdNama").value=((E=p.user)==null?void 0:E.name)||"",document.getElementById("apdTanggal").value=O(p.created_at||p.tanggal),document.getElementById("apdJudul").value=p.judul||"",document.getElementById("apdIsi").value=p.isi||"",document.getElementById("apdStatus").value=(p.status||"menunggu").toLowerCase(),document.getElementById("apdCatatan").value=p.catatanAdmin||"";const f=document.getElementById("adminPengaduanModalSub");f&&(f.textContent=`ID: ${p.id}`),aa("adminPengaduanModal")}catch(g){console.error(g)}return}if(m){const u=document.getElementById("apdId").value,g=document.getElementById("apdStatus").value;try{(await b(`/api/admin/pengaduan/${u}`,{method:"PUT",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":(I=document.querySelector('meta[name="csrf-token"]'))==null?void 0:I.content,Accept:"application/json"},body:JSON.stringify({status:g})})).ok?(alert("Status pengaduan berhasil disimpan"),U("adminPengaduanModal"),e()):alert("Gagal menyimpan status pengaduan")}catch(p){console.error(p),alert("Gagal menyimpan status pengaduan")}}}))}async function xa(){var v,E,I,u;const t="/api/admin/struktur-organisasi";let a=[],i=null;const d=document.getElementById("soGrid"),n=document.getElementById("soEmpty"),e=document.getElementById("soSearch"),o=document.getElementById("soModal"),s=document.getElementById("soForm");if(!d)return;async function r(){var g;try{const p=await b(t,{credentials:"same-origin",headers:{Accept:"application/json"}});if(!p.ok)throw new Error("HTTP "+p.status);const f=await p.json();a=Array.isArray(f)?f:(g=f==null?void 0:f.data)!=null?g:[],l()}catch(p){console.error("Gagal memuat struktur:",p),a=[],l()}}function l(){const g=((e==null?void 0:e.value)||"").toLowerCase(),p=g?a.filter(f=>(f.nama+" "+f.jabatan).toLowerCase().includes(g)):a;if(!p.length){d.innerHTML="",n&&(n.style.display="block");return}n&&(n.style.display="none"),d.innerHTML=p.map(f=>{const S=f.foto?`<img src="/storage/${f.foto}" alt="${f.nama}" />`:'<i class="fa-solid fa-user so-avatar-icon"></i>',T=f.parent_jabatan?`<div class="so-parent">Bawahan dari: ${f.parent_jabatan}</div>`:'<div class="so-parent" style="color:var(--primary);font-weight:800">\u2014 Kepala \u2014</div>';return`
                <div class="so-card">
                    <span class="so-urutan-badge">#${f.urutan}</span>
                    <div class="so-photo">${S}</div>
                    <div class="so-nama">${f.nama}</div>
                    <div class="so-jabatan">${f.jabatan}</div>
                    ${T}
                    <div class="so-actions">
                        <button class="btn btn-ghost btn-sm" data-so-edit="${f.id}"><i class="fa-solid fa-pen"></i> Edit</button>
                        <button class="btn btn-danger btn-sm" data-so-del="${f.id}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>`}).join("")}function c(g=null){var S;i=g?g.id:null,document.getElementById("soModalTitle").textContent=g?"Edit Anggota":"Tambah Anggota",document.getElementById("soId").value=(g==null?void 0:g.id)||"",document.getElementById("soNama").value=(g==null?void 0:g.nama)||"",document.getElementById("soJabatan").value=(g==null?void 0:g.jabatan)||"",document.getElementById("soParent").value=(g==null?void 0:g.parent_jabatan)||"",document.getElementById("soUrutan").value=(S=g==null?void 0:g.urutan)!=null?S:0,document.getElementById("soFoto").value="";const p=document.getElementById("soPhotoPreview"),f=document.getElementById("soPhotoIcon");g!=null&&g.foto?(p.src="/storage/"+g.foto,p.style.display="block",f.style.display="none"):(p.style.display="none",f.style.display="block"),o.classList.add("open"),o.setAttribute("aria-hidden","false")}function m(){o.classList.remove("open"),o.setAttribute("aria-hidden","true"),i=null}(v=document.getElementById("soFoto"))==null||v.addEventListener("change",g=>{var S;const p=(S=g.target.files)==null?void 0:S[0];if(!p)return;const f=new FileReader;f.onload=T=>{const A=document.getElementById("soPhotoPreview"),D=document.getElementById("soPhotoIcon");A&&(A.src=T.target.result,A.style.display="block"),D&&(D.style.display="none")},f.readAsDataURL(p)}),s==null||s.addEventListener("submit",async g=>{var A,D,K,_,M,$,L;g.preventDefault();const p=document.getElementById("soBtnSimpan");p&&(p.disabled=!0,p.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...');const f=new FormData;f.append("nama",((A=document.getElementById("soNama"))==null?void 0:A.value.trim())||""),f.append("jabatan",((D=document.getElementById("soJabatan"))==null?void 0:D.value.trim())||""),f.append("parent_jabatan",((K=document.getElementById("soParent"))==null?void 0:K.value.trim())||""),f.append("urutan",((_=document.getElementById("soUrutan"))==null?void 0:_.value)||0);const S=($=(M=document.getElementById("soFoto"))==null?void 0:M.files)==null?void 0:$[0];S&&f.append("foto",S),i&&f.append("_method","PUT");const T=i?`${t}/${i}`:t;try{const k=await b(T,{method:"POST",credentials:"same-origin",headers:{"X-CSRF-TOKEN":(L=document.querySelector('meta[name="csrf-token"]'))==null?void 0:L.content,Accept:"application/json"},body:f});if(!k.ok){const h=await k.json().catch(()=>({}));throw new Error(h.message||"Gagal")}m(),await r()}catch(k){alert("Error: "+k.message)}finally{p&&(p.disabled=!1,p.innerHTML='<i class="fa-solid fa-floppy-disk"></i> Simpan')}}),(E=document.getElementById("soBtnTambah"))==null||E.addEventListener("click",()=>c()),(I=document.getElementById("soBtnClose"))==null||I.addEventListener("click",m),(u=document.getElementById("soBtnBatal"))==null||u.addEventListener("click",m),o==null||o.addEventListener("click",g=>{g.target===o&&m()}),d.addEventListener("click",async g=>{var S;const p=g.target.closest("[data-so-edit]");if(p){const T=Number(p.dataset.soEdit);c(a.find(A=>A.id===T));return}const f=g.target.closest("[data-so-del]");if(f){const T=Number(f.dataset.soDel),A=a.find(D=>D.id===T);if(!A||!confirm(`Hapus "${A.nama}"?`))return;try{if(!(await b(`${t}/${T}`,{method:"DELETE",credentials:"same-origin",headers:{"X-CSRF-TOKEN":(S=document.querySelector('meta[name="csrf-token"]'))==null?void 0:S.content,Accept:"application/json"}})).ok)throw new Error("Gagal menghapus");await r()}catch(D){alert(D.message)}}}),e==null||e.addEventListener("input",l),await r()}async function Ka(){const t=document.getElementById("adminSuratTbody"),a=document.getElementById("adminSuratEmpty"),i=document.getElementById("adminSuratSearch"),d=document.getElementById("adminSuratFilter");if(!t)return;let n=[];async function e(){try{const r=(d==null?void 0:d.value)==="trashed"?"/api/admin/surat?trashed=true":"/api/admin/surat",l=await b(r,{credentials:"same-origin",headers:{Accept:"application/json"}});if(!l.ok)throw new Error(`HTTP ${l.status}`);const c=await l.json();n=Array.isArray(c)?c:Array.isArray(c==null?void 0:c.data)?c.data:[],o()}catch(s){console.error("Gagal memuat surat",s),n=[],o()}}function o(){const s=((i==null?void 0:i.value)||"").trim().toLowerCase(),r=((d==null?void 0:d.value)||"").trim().toLowerCase();let l=n;s&&(l=l.filter(c=>{var m;return`${((m=c.user)==null?void 0:m.name)||""} ${c.jenis_surat||""} ${c.keperluan||""}`.toLowerCase().includes(s)})),r&&r!=="trashed"&&(l=l.filter(c=>(c.status||"").toLowerCase()==r)),t.innerHTML=l.map(c=>{var E;const v=(d==null?void 0:d.value)==="trashed"?`
                            <button class="btn btn-warning btn-sm" data-action="suratRestoreLaravel" data-id="${c.id}"><i class="fa-solid fa-trash-arrow-up"></i> Pulihkan</button>
                            <button class="btn btn-danger btn-sm" data-action="suratForceDeleteLaravel" data-id="${c.id}"><i class="fa-regular fa-trash-can"></i> Hapus Permanen</button>
                        `:`
                            <button class="btn btn-ghost" data-action="suratDetailLaravel" data-id="${c.id}"><i class="fa-regular fa-eye"></i> Detail</button>
                            <button class="btn btn-ghost" data-action="suratDeleteLaravel" data-id="${c.id}"><i class="fa-regular fa-trash-can"></i> Hapus</button>
                        `;return`
                            <tr>
                                <td>${c.jenis_surat||"-"}</td>
                                <td>${((E=c.user)==null?void 0:E.name)||"-"}</td>
                                <td>${O(c.created_at||c.tanggal)}</td>
                                <td>${Y(c.status,"surat")}</td>
                                <td>
                                    <div class="row-actions">
                                        ${v}
                                    </div>
                                </td>
                            </tr>
                        `}).join(""),a&&(a.style.display=l.length?"none":"block")}await e(),i==null||i.addEventListener("input",o),d==null||d.addEventListener("change",e),window._suratLaravelBound||(window._suratLaravelBound=!0,document.addEventListener("click",async s=>{var I,u,g,p,f,S,T,A,D,K,_,M,$;const r=s.target.closest("[data-action='suratDetailLaravel']"),l=s.target.closest("[data-action='suratDeleteLaravel']"),c=s.target.closest("[data-action='suratRestoreLaravel']"),m=s.target.closest("[data-action='suratForceDeleteLaravel']"),v=s.target.closest("[data-action='closeSuratModal']"),E=s.target.closest("[data-action='saveSuratStatus']");if(v){U("adminSuratModal");return}if(c){const L=c.dataset.id;if(!confirm("Pulihkan pengajuan surat ini?"))return;try{(await b(`/api/admin/surat/${L}/restore`,{method:"POST",headers:{"X-CSRF-TOKEN":(I=document.querySelector('meta[name="csrf-token"]'))==null?void 0:I.content,Accept:"application/json"}})).ok?(alert("Pengajuan surat berhasil dipulihkan"),e()):alert("Gagal memulihkan pengajuan surat")}catch(k){console.error(k),alert("Gagal memulihkan pengajuan surat")}return}if(m){const L=m.dataset.id;if(!confirm("Hapus pengajuan surat ini secara PERMANEN beserta seluruh berkasnya? Tindakan ini tidak dapat dibatalkan!"))return;try{(await b(`/api/admin/surat/${L}/force`,{method:"DELETE",headers:{"X-CSRF-TOKEN":(u=document.querySelector('meta[name="csrf-token"]'))==null?void 0:u.content,Accept:"application/json"}})).ok?(alert("Pengajuan surat berhasil dihapus secara permanen"),e()):alert("Gagal menghapus permanen")}catch(k){console.error(k),alert("Gagal menghapus permanen")}return}if(l){const L=l.dataset.id;confirm("Hapus pengajuan surat ini (Soft Delete)? Staf/warga tidak akan melihat surat ini, namun Admin dapat memulihkannya kembali.");try{(await b(`/api/admin/surat/${L}`,{method:"DELETE",headers:{"X-CSRF-TOKEN":(g=document.querySelector('meta[name="csrf-token"]'))==null?void 0:g.content,Accept:"application/json"}})).ok?(alert("Pengajuan surat berhasil dipindahkan ke tempat sampah"),e()):alert("Gagal memindahkan ke tempat sampah")}catch(k){console.error(k),alert("Gagal memindahkan ke tempat sampah")}return}if(r){const L=r.dataset.id;try{const h=await(await b(`/api/admin/surat/${L}`,{headers:{Accept:"application/json"}})).json();if(!h)return;document.getElementById("asId").value=h.id,document.getElementById("asJenis").value=h.jenis_surat||"",document.getElementById("asTanggal").value=O(h.created_at||h.tanggal),document.getElementById("asNama").value=((p=h.user)==null?void 0:p.name)||"",document.getElementById("asNik").value=((f=h.user)==null?void 0:f.nik)||"",document.getElementById("asTelp").value=((S=h.user)==null?void 0:S.telp)||"",document.getElementById("asAlamat").value=`${((T=h.user)==null?void 0:T.alamat)||""} RT ${((A=h.user)==null?void 0:A.rt)||"-"}/RW ${((D=h.user)==null?void 0:D.rw)||"-"}`,document.getElementById("asKeperluan").value=h.keperluan||"",document.getElementById("asStatus").value=(h.status||"menunggu").toLowerCase(),document.getElementById("asCatatan").value=(_=(K=h.catatan_staf)!=null?K:h.catatanAdmin)!=null?_:"";const y=document.getElementById("adminSuratModalSub");y&&(y.textContent=`ID: ${h.id}`);const w=document.getElementById("asBerkasContainer");if(w){const j=Array.isArray(h.berkas)?h.berkas:[];if(!j.length)w.innerHTML='<div class="muted" style="grid-column: 1/-1;">Tidak ada berkas persyaratan yang diunggah.</div>';else{const P=B=>{if(!B)return"0 B";const C=1024,F=["B","KB","MB","GB"],N=Math.floor(Math.log(B)/Math.log(C));return parseFloat((B/Math.pow(C,N)).toFixed(1))+" "+F[N]},x=B=>String(B||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");w.innerHTML=j.map(B=>{const F=((B.mime||"").startsWith("image/")||(B.fileName||"").match(/\.(jpg|jpeg|png|webp|gif)$/i))&&B.dataUrl?B.dataUrl:"";let N="";F?N=`<img src="${F}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px 8px 0 0;" />`:N=`
                                            <div style="width: 100%; height: 100px; background: rgba(148, 163, 184, 0.1); border-radius: 8px 8px 0 0; display: flex; align-items: center; justify-content: center;">
                                                <i class="fa-solid fa-file-pdf" style="font-size: 36px; color: #ef4444;"></i>
                                            </div>
                                        `;const H=B.dataUrl?`href="${B.dataUrl}" target="_blank"`:`href="#" onclick="alert('File tidak dapat dibuka karena ukuran melebihi batas demo.'); return false;"`,G=B.dataUrl?`href="${B.dataUrl}" download="${x(B.fileName)}"`:`href="#" onclick="alert('File tidak dapat didownload karena ukuran melebihi batas demo.'); return false;"`;return`
                                        <div class="card" style="border: 1px solid var(--border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; background: #fff; box-shadow: none;">
                                            ${N}
                                            <div style="padding: 8px; display: flex; flex-direction: column; flex: 1;">
                                                <div style="font-weight: 1000; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${x(B.fileName)}">${x(B.fileName||"-")}</div>
                                                <div style="font-size: 10px; color: var(--muted); margin-top: 2px; font-weight: 700;">${x(B.requirement||"Berkas")}</div>
                                                <div style="font-size: 10px; color: var(--muted); margin-top: 1px;">${P(B.size)}</div>

                                                <div style="margin-top: auto; padding-top: 6px; display: flex; gap: 4px; justify-content: flex-end;">
                                                    <a class="btn btn-light btn-sm" ${H} style="padding: 2px 6px; border-radius: 4px; font-size: 10px; border: 1px solid var(--border); display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px;" title="Lihat">
                                                        <i class="fa-regular fa-eye"></i>
                                                    </a>
                                                    <a class="btn btn-light btn-sm" ${G} style="padding: 2px 6px; border-radius: 4px; font-size: 10px; border: 1px solid var(--border); display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px;" title="Unduh">
                                                        <i class="fa-solid fa-download"></i>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    `}).join("")}}aa("adminSuratModal")}catch(k){console.error(k)}return}if(E){const L=document.getElementById("asId").value,k=document.getElementById("asStatus").value,h=((M=document.getElementById("asCatatan").value)==null?void 0:M.trim())||"";try{(await b(`/api/admin/surat/${L}`,{method:"PUT",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":($=document.querySelector('meta[name="csrf-token"]'))==null?void 0:$.content,Accept:"application/json"},body:JSON.stringify({status:k,catatan:h})})).ok?(alert("Status surat berhasil disimpan"),U("adminSuratModal"),e()):alert("Gagal menyimpan status surat")}catch(y){console.error(y),alert("Gagal menyimpan status surat")}}}))}document.addEventListener("click",async t=>{var r,l,c;if(t.target.closest("[data-action='closeModal']")){W();return}const i=t.target.closest("[data-action='deleteBerita']");if(i){const m=i.dataset.id;if(!confirm("Hapus berita ini?"))return;try{const v=await b(`/api/admin/berita/${m}`,{method:"DELETE",credentials:"same-origin",headers:{Accept:"application/json","X-CSRF-TOKEN":(r=document.querySelector('meta[name="csrf-token"]'))==null?void 0:r.content}});if(console.log("[BERITA DELETE]",m,"status=",v.status,"ok=",v.ok),v.ok)typeof X._loadData=="function"?await X._loadData():await X();else{let E="HTTP "+v.status;try{const u=await v.clone().json();u!=null&&u.message&&(E=u.message),console.error("[BERITA DELETE] body=",u)}catch(I){try{const u=await v.text();console.error("[BERITA DELETE] non-JSON body=",u.slice(0,500))}catch(u){}}alert("Gagal menghapus berita: "+E)}}catch(v){console.error(v),alert("Kesalahan jaringan saat menghapus berita")}return}const d=t.target.closest("[data-action='editBerita']");if(d){const m=d.dataset.id;try{const v=await b(`/api/admin/berita/${m}`,{credentials:"same-origin",headers:{Accept:"application/json"}});if(console.log("[BERITA EDIT]",m,"status=",v.status,"ok=",v.ok),!v.ok){let I="HTTP "+v.status;try{const u=await v.json();u!=null&&u.message&&(I=u.message)}catch(u){}alert("Gagal memuat data berita: "+I);return}const E=await v.json();document.getElementById("adminModalTitle")&&(document.getElementById("adminModalTitle").textContent="Edit Berita"),q("berita",E)}catch(v){console.error(v),alert("Gagal memuat data berita")}return}const n=t.target.closest("[data-action='deleteAgenda']");if(n){const m=n.dataset.id;if(!confirm("Hapus agenda ini?"))return;try{await b(`/api/admin/agenda/${m}`,{method:"DELETE",credentials:"same-origin",headers:{Accept:"application/json","X-CSRF-TOKEN":(l=document.querySelector('meta[name="csrf-token"]'))==null?void 0:l.content}}),await ua()}catch(v){console.error(v)}return}const e=t.target.closest("[data-action='editAgenda']");if(e){const m=e.dataset.id;try{const E=await(await b(`/api/admin/agenda/${m}`,{credentials:"same-origin",headers:{Accept:"application/json"}})).json();document.getElementById("adminModalTitle")&&(document.getElementById("adminModalTitle").textContent="Edit Agenda"),q("agenda",E)}catch(v){console.error(v)}return}const o=t.target.closest("[data-action='deletePengumuman']");if(o){const m=o.dataset.id;if(!confirm("Hapus pengumuman ini?"))return;try{await b(`/api/admin/pengumuman/${m}`,{method:"DELETE",credentials:"same-origin",headers:{Accept:"application/json","X-CSRF-TOKEN":(c=document.querySelector('meta[name="csrf-token"]'))==null?void 0:c.content}}),await ma()}catch(v){console.error(v)}return}const s=t.target.closest("[data-action='editPengumuman']");if(s){const m=s.dataset.id;try{const E=await(await b(`/api/admin/pengumuman/${m}`,{credentials:"same-origin",headers:{Accept:"application/json"}})).json();document.getElementById("adminModalTitle")&&(document.getElementById("adminModalTitle").textContent="Edit Pengumuman"),q("pengumuman",E)}catch(v){console.error(v)}return}});async function _a(){const t=document.getElementById("adminRtrwTbody");if(!t)return;async function a(){const e=await(await b("/api/admin/rtrw")).json();console.log("BERITA RESPONSE =",e),console.log("BERITA ARRAY =",Array.isArray(e)),t.innerHTML=e.map(o=>{var s,r;return`
            <tr>
                <td>${o.rt}</td>
                <td>${o.rw}</td>
                <td>${(s=o.ketua)!=null?s:"-"}</td>
                <td>${(r=o.telepon)!=null?r:"-"}</td>
                <td>
                    <button class="btn btn-warning btn-sm"
                        onclick="editRtrw(${o.id})">
                        Edit
                    </button>

                    <button class="btn btn-danger btn-sm"
                        onclick="deleteRtrw(${o.id})">
                        Hapus
                    </button>
                </td>
            </tr>
        `}).join("")}await a();const i=document.querySelector("[data-action='rtrwCreate']");i==null||i.addEventListener("click",()=>{var n;document.getElementById("rtrwId").value="",document.getElementById("adminRtrwForm").reset(),(n=document.getElementById("adminRtrwModal"))==null||n.classList.add("open")});const d=document.getElementById("adminRtrwForm");d&&!d.dataset.laravelBound&&(d.dataset.laravelBound="true",d.addEventListener("submit",async n=>{var r;n.preventDefault();const e=document.getElementById("rtrwId").value,o={rt:document.getElementById("rtrwRt").value,rw:document.getElementById("rtrwRw").value,ketua:document.getElementById("rtrwKetua").value,telepon:document.getElementById("rtrwKontak").value};let s;if(e?s=await b(`/api/admin/rtrw/${e}`,{method:"PUT",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(o)}):s=await b("/api/admin/rtrw",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(o)}),!s.ok){alert("Gagal menyimpan RT/RW");return}d.reset(),(r=document.getElementById("adminRtrwModal"))==null||r.classList.remove("open"),await a()})),window.editRtrw=async n=>{var s,r,l,c,m;const o=await(await b(`/api/admin/rtrw/${n}`)).json();document.getElementById("rtrwId").value=o.id,document.getElementById("rtrwRt").value=(s=o.rt)!=null?s:"",document.getElementById("rtrwRw").value=(r=o.rw)!=null?r:"",document.getElementById("rtrwKetua").value=(l=o.ketua)!=null?l:"",document.getElementById("rtrwKontak").value=(c=o.telepon)!=null?c:"",(m=document.getElementById("adminRtrwModal"))==null||m.classList.add("open")},window.deleteRtrw=async n=>{confirm("Hapus data ini?")&&(await b(`/api/admin/rtrw/${n}`,{method:"DELETE"}),await a())}}async function Ma(){console.log("FAQ LARAVEL LOADED");const t=document.getElementById("adminFaqTbody");if(!t)return;async function a(){const n=await(await b("/api/admin/faq")).json();console.log("FAQ RESPONSE =",n),console.log("FAQ ARRAY =",Array.isArray(n)),t.innerHTML=n.map(e=>{var o;return`
            <tr>
                <td>${e.question}</td>
                <td>${(o=e.category)!=null?o:"-"}</td>
                <td><span class="badge badge-done">Published</span></td>
                <td>
                    <button
                        class="btn btn-warning btn-sm"
                        onclick="editFaq(${e.id})">
                        Edit
                    </button>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="deleteFaq(${e.id})">
                        Hapus
                    </button>
                </td>
            </tr>
        `}).join("")}await a();const i=document.getElementById("adminFaqForm");i&&!i.dataset.laravelBound&&(i.dataset.laravelBound="true",i.addEventListener("submit",async d=>{var s;d.preventDefault();const n=document.getElementById("faqId").value,e={question:document.getElementById("faqQ").value,answer:document.getElementById("faqA").value,category:document.getElementById("faqCat").value};let o;if(n?o=await b(`/api/admin/faq/${n}`,{method:"PUT",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e)}):o=await b("/api/admin/faq",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e)}),!o.ok){alert("Gagal menyimpan FAQ");return}i.reset(),(s=document.getElementById("adminFaqModal"))==null||s.classList.remove("open"),await a()})),window.editFaq=async d=>{var o,s,r,l;const e=await(await b(`/api/admin/faq/${d}`)).json();document.getElementById("faqId").value=e.id,document.getElementById("faqQ").value=(o=e.question)!=null?o:"",document.getElementById("faqA").value=(s=e.answer)!=null?s:"",document.getElementById("faqCat").value=(r=e.category)!=null?r:"",(l=document.getElementById("adminFaqModal"))==null||l.classList.add("open")},window.deleteFaq=async d=>{confirm("Hapus FAQ ini?")&&(await b(`/api/admin/faq/${d}`,{method:"DELETE"}),await a())},document.addEventListener("click",d=>{var n,e;d.target.closest("[data-action='faqCreate']")&&(document.getElementById("faqId").value="",document.getElementById("adminFaqForm").reset(),(n=document.getElementById("adminFaqModal"))==null||n.classList.add("open")),d.target.closest("[data-action='faqClose']")&&((e=document.getElementById("adminFaqModal"))==null||e.classList.remove("open"))})}async function Ca(){var d;const t=document.getElementById("admLembagaTbody");if(!t)return;async function a(){try{const e=await(await b("/api/admin/lembaga")).json();console.log("LEMBAGA RESPONSE =",e),console.log("LEMBAGA ARRAY =",Array.isArray(e)),t.innerHTML=e.map(o=>{var s,r,l,c;return`
                <tr>
                    <td>${(s=o.nama)!=null?s:"-"}</td>
                    <td>${(r=o.jabatan)!=null?r:"-"}</td>
                    <td>${(l=o.wilayah)!=null?l:"-"}</td>
                    <td>${(c=o.kontak)!=null?c:"-"}</td>
                    <td class="text-right">
                        <button
                            class="btn btn-warning btn-sm"
                            onclick="editLembaga(${o.id})">
                            Edit
                        </button>

                        <button
                            class="btn btn-danger btn-sm"
                            onclick="deleteLembaga(${o.id})">
                            Hapus
                        </button>
                    </td>
                </tr>
            `}).join("")}catch(n){console.error("Lembaga Error:",n)}}await a();const i=document.getElementById("lembagaForm");i&&!i.dataset.boundLaravel&&(i.dataset.boundLaravel="true",i.addEventListener("submit",async n=>{var r;n.preventDefault();const e=document.getElementById("fLembagaId").value,o={jenis:document.getElementById("fLembagaJenis").value,nama:document.getElementById("fLembagaNama").value,jabatan:document.getElementById("fLembagaJabatan").value,wilayah:document.getElementById("fLembagaWilayah").value,kontak:document.getElementById("fLembagaKontak").value,keterangan:document.getElementById("fLembagaKet").value};let s;if(e?s=await b(`/api/admin/lembaga/${e}`,{method:"PUT",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(o)}):s=await b("/api/admin/lembaga",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(o)}),!s.ok){alert("Gagal menyimpan data lembaga");return}i.reset(),(r=document.getElementById("lembagaModal"))==null||r.classList.remove("open"),await a()})),(d=document.getElementById("btnAddLembaga"))==null||d.addEventListener("click",()=>{var n;i.reset(),document.getElementById("fLembagaId").value="",(n=document.getElementById("lembagaModal"))==null||n.classList.add("open")}),document.addEventListener("click",n=>{var e;n.target.closest("[data-action='closeLembagaModal']")&&((e=document.getElementById("lembagaModal"))==null||e.classList.remove("open"))}),window.editLembaga=async function(n){var s,r,l,c,m,v,E;const o=await(await b(`/api/admin/lembaga/${n}`)).json();document.getElementById("fLembagaId").value=o.id,document.getElementById("fLembagaJenis").value=(s=o.jenis)!=null?s:"",document.getElementById("fLembagaNama").value=(r=o.nama)!=null?r:"",document.getElementById("fLembagaJabatan").value=(l=o.jabatan)!=null?l:"",document.getElementById("fLembagaWilayah").value=(c=o.wilayah)!=null?c:"",document.getElementById("fLembagaKontak").value=(m=o.kontak)!=null?m:"",document.getElementById("fLembagaKet").value=(v=o.keterangan)!=null?v:"",(E=document.getElementById("lembagaModal"))==null||E.classList.add("open")},window.deleteLembaga=async function(n){confirm("Hapus data lembaga ini?")&&(await b(`/api/admin/lembaga/${n}`,{method:"DELETE"}),await a())}}async function Na(){var s,r,l,c,m,v;const t=document.getElementById("adminUnitKerjaTbody");if(!t)return;const a=document.getElementById("ukForm"),i=document.getElementById("ukFormCard");function d(E){const I=E?new Date(E):null;return!I||isNaN(I.getTime())?"-":I.toLocaleString("id-ID",{year:"numeric",month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit"})}async function n(){const I=await(await b("/api/admin/unit-kerja")).json();t.innerHTML=I.map(u=>{var g,p,f,S,T,A;return`
            <tr>
                <td>
                    <div style="font-weight:bold">${(g=u.nama_unit)!=null?g:"-"}</div>
                    <div class="muted" style="font-size:12px">${(p=u.jenis)!=null?p:""}</div>
                </td>
                <td>
                    <div style="display:flex;align-items:center;gap:10px">
                        <img src="${u.foto_pimpinan?"/storage/"+u.foto_pimpinan:"assets/images/avatar-placeholder.svg"}" style="width:30px;height:30px;border-radius:50%;object-fit:cover" />
                        <div>
                            <div style="font-weight:bold">${(f=u.nama_pimpinan)!=null?f:"-"}</div>
                            <div class="muted" style="font-size:11px">${(S=u.jabatan_pimpinan)!=null?S:"-"}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div>${(T=u.kontak)!=null?T:"-"}</div>
                    <div class="muted" style="font-size:12px">${(A=u.email)!=null?A:""}</div>
                </td>
                <td>${d(u.updated_at)}</td>
                <td class="text-right">

                    <button
                        class="btn btn-warning btn-sm"
                        onclick="editUnitKerja(${u.id})">
                        Edit
                    </button>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="deleteUnitKerja(${u.id})">
                        Hapus
                    </button>

                </td>
            </tr>
        `}).join("")}function e(E={}){var u,g,p;const I=document.createElement("tr");I.innerHTML=`
                <td><input type="text" class="input staff-nama" value="${(u=E.nama)!=null?u:""}" placeholder="Nama..." required /></td>
                <td><input type="text" class="input staff-jabatan" value="${(g=E.jabatan)!=null?g:""}" placeholder="Jabatan..." required /></td>
                <td><input type="text" class="input staff-nip" value="${(p=E.nip)!=null?p:""}" placeholder="NIP..." /></td>
                <td class="text-right">
                    <button type="button" class="btn btn-danger btn-sm remove-staff-row"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `,I.querySelector(".remove-staff-row").onclick=()=>I.remove(),document.getElementById("ukTimTbody").appendChild(I)}function o(){a&&a.reset(),document.getElementById("ukId").value="",document.getElementById("ukFotoPreview").src="assets/images/avatar-placeholder.svg",document.getElementById("ukTimTbody").innerHTML=""}(s=document.getElementById("ukFotoPimpinan"))==null||s.addEventListener("change",E=>{const I=E.target.files[0];if(I){const u=new FileReader;u.onload=g=>{document.getElementById("ukFotoPreview").src=g.target.result},u.readAsDataURL(I)}}),(r=document.getElementById("ukAddStaffBtn"))==null||r.addEventListener("click",()=>{e()}),await n(),(l=document.getElementById("ukAddBtn"))==null||l.addEventListener("click",()=>{o(),i.hidden=!1}),(c=document.getElementById("ukFormClose"))==null||c.addEventListener("click",()=>{i.hidden=!0}),(m=document.getElementById("ukFormCancel"))==null||m.addEventListener("click",()=>{i.hidden=!0}),(v=document.getElementById("ukRefreshBtn"))==null||v.addEventListener("click",n),a&&!a.dataset.boundLaravel&&(a.dataset.boundLaravel="true",a.addEventListener("submit",async E=>{var A;E.preventDefault();const I=document.getElementById("ukId").value,u=new FormData;u.append("jenis",document.getElementById("ukJenis").value),u.append("nama_unit",document.getElementById("ukNamaUnit").value),u.append("nama_pimpinan",document.getElementById("ukNamaPimpinan").value),u.append("jabatan_pimpinan",document.getElementById("ukJabatanPimpinan").value),u.append("nip_pimpinan",document.getElementById("ukNipPimpinan").value),u.append("pendidikan_pimpinan",document.getElementById("ukPendidikanPimpinan").value),u.append("kontak",document.getElementById("ukKontak").value),u.append("email",document.getElementById("ukEmail").value),u.append("alamat",document.getElementById("ukAlamat").value),u.append("riwayat_jabatan",document.getElementById("ukRiwayatJabatan").value),u.append("tugas",document.getElementById("ukTugas").value),u.append("kewenangan",document.getElementById("ukKewenangan").value);const g=[];document.querySelectorAll("#ukTimTbody tr").forEach(D=>{var $,L,k;const K=($=D.querySelector(".staff-nama"))==null?void 0:$.value.trim(),_=(L=D.querySelector(".staff-jabatan"))==null?void 0:L.value.trim(),M=(k=D.querySelector(".staff-nip"))==null?void 0:k.value.trim();(K||_)&&g.push({nama:K,jabatan:_,nip:M})}),u.append("tim_pegawai",JSON.stringify(g));const p=document.getElementById("ukFotoPimpinan").files[0];p&&u.append("foto_pimpinan",p);let f="/api/admin/unit-kerja";I&&(f=`/api/admin/unit-kerja/${I}`,u.append("_method","PUT"));const S=(A=document.querySelector('meta[name="csrf-token"]'))==null?void 0:A.content;if(!(await b(f,{method:"POST",headers:{"X-CSRF-TOKEN":S,Accept:"application/json"},body:u})).ok){alert("Gagal menyimpan Unit Kerja");return}o(),i.hidden=!0,await n()})),window.editUnitKerja=async function(E){var p,f,S,T,A,D,K,_,M,$,L,k;const u=await(await b(`/api/admin/unit-kerja/${E}`)).json();o(),document.getElementById("ukId").value=u.id,document.getElementById("ukJenis").value=(p=u.jenis)!=null?p:"",document.getElementById("ukNamaUnit").value=(f=u.nama_unit)!=null?f:"",document.getElementById("ukNamaPimpinan").value=(S=u.nama_pimpinan)!=null?S:"",document.getElementById("ukJabatanPimpinan").value=(T=u.jabatan_pimpinan)!=null?T:"",document.getElementById("ukNipPimpinan").value=(A=u.nip_pimpinan)!=null?A:"",document.getElementById("ukPendidikanPimpinan").value=(D=u.pendidikan_pimpinan)!=null?D:"",document.getElementById("ukKontak").value=(K=u.kontak)!=null?K:"",document.getElementById("ukEmail").value=(_=u.email)!=null?_:"",document.getElementById("ukAlamat").value=(M=u.alamat)!=null?M:"",document.getElementById("ukRiwayatJabatan").value=($=u.riwayat_jabatan)!=null?$:"",document.getElementById("ukTugas").value=(L=u.tugas)!=null?L:"",document.getElementById("ukKewenangan").value=(k=u.kewenangan)!=null?k:"",u.foto_pimpinan?document.getElementById("ukFotoPreview").src=`/storage/${u.foto_pimpinan}`:document.getElementById("ukFotoPreview").src="assets/images/avatar-placeholder.svg",(Array.isArray(u.tim_pegawai)?u.tim_pegawai:[]).forEach(h=>e(h)),i.hidden=!1,i.scrollIntoView({behavior:"smooth",block:"start"})},window.deleteUnitKerja=async function(E){var u;if(!confirm("Hapus Unit Kerja ini?"))return;const I=(u=document.querySelector('meta[name="csrf-token"]'))==null?void 0:u.content;await b(`/api/admin/unit-kerja/${E}`,{method:"DELETE",headers:{"X-CSRF-TOKEN":I,Accept:"application/json"}}),await n()}}async function Ra(){var T,A,D,K,_,M,$,L;const t=document.getElementById("srvAdmTbody");if(!t)return;const a=document.getElementById("srvForm"),i=document.getElementById("srvModal"),d=()=>{i==null||i.classList.add("open")},n=()=>{i==null||i.classList.remove("open")};let e=[],o=[],s=[];function r(){const k=document.getElementById("fSrvSyaratList");k&&(k.innerHTML=e.map((h,y)=>`
                <div class="array-row" style="display:flex;gap:8px;margin-bottom:8px">
                    <input class="input syarat-input" value="${h!=null?h:""}" placeholder="Tulis persyaratan..." required>
                    <button type="button" class="btn btn-danger btn-sm" onclick="removeSyarat(${y})">Hapus</button>
                </div>
            `).join("")||'<div class="muted" style="padding: 10px 0;">Belum ada persyaratan.</div>')}window.removeSyarat=k=>{m(),e.splice(k,1),r()};function l(){const k=document.getElementById("fSrvStepList");k&&(k.innerHTML=o.map((h,y)=>{var w,j;return`
                <div class="array-row" style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px;border:1px solid var(--border);padding:12px;border-radius:10px;background:#f8fafc;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <strong>Langkah ${y+1}</strong>
                        <button type="button" class="btn btn-danger btn-sm" onclick="removeStep(${y})">Hapus</button>
                    </div>
                    <input class="input step-judul" value="${(w=h.judul)!=null?w:""}" placeholder="Judul langkah (contoh: Isi Form Online)..." required>
                    <textarea class="input step-desc" rows="2" placeholder="Deskripsi detail langkah..." required>${(j=h.deskripsi)!=null?j:""}</textarea>
                </div>
            `}).join("")||'<div class="muted" style="padding: 10px 0;">Belum ada tahapan proses.</div>')}window.removeStep=k=>{m(),o.splice(k,1),l()};function c(){const k=document.getElementById("fSrvFormList");if(!k)return;const h=[["text","Text Box (Teks Satu Baris)"],["textarea","Text Area (Teks Multi Baris)"],["select","Dropdown (Pilihan)"],["date","Date Picker (Tanggal)"],["checkbox","Checkbox (Centang)"],["radio","Radio Button (Pilihan Tunggal)"],["number","Number Input (Angka)"],["file","File Upload (Unggah File)"]];k.innerHTML=s.map((y,w)=>{var x;const j=Array.isArray(y.options)?y.options.join(", "):y.options||"",P=h.map(([B,C])=>`
                    <option value="${B}" ${y.type===B?"selected":""}>${C}</option>
                `).join("");return`
                <div class="array-row" style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px;border:1px solid var(--border);padding:12px;border-radius:10px;background:#f8fafc;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <strong>Field Input Dinamis ${w+1}</strong>
                        <button type="button" class="btn btn-danger btn-sm" onclick="removeField(${w})">Hapus</button>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                        <div>
                            <label style="font-size:11px;font-weight:bold;margin-bottom:4px;display:block;">Label Field</label>
                            <input class="input field-label" value="${(x=y.label)!=null?x:""}" placeholder="Contoh: Nama Usaha" required>
                        </div>
                        <div>
                            <label style="font-size:11px;font-weight:bold;margin-bottom:4px;display:block;">Tipe Field</label>
                            <select class="input field-type">${P}</select>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 100px;gap:10px;align-items:center;margin-top:6px;">
                        <div>
                            <label style="font-size:11px;font-weight:bold;margin-bottom:4px;display:block;">Pilihan Opsi (pisahkan dengan koma)</label>
                            <input class="input field-options" value="${j}" placeholder="Pilihan 1, Pilihan 2 (khusus Dropdown/Radio)">
                        </div>
                        <label style="display:flex;align-items:center;gap:6px;margin-top:18px;font-weight:bold;cursor:pointer;">
                            <input type="checkbox" class="field-required" ${y.required?"checked":""}> Wajib Diisi
                        </label>
                    </div>
                </div>
                `}).join("")||'<div class="muted" style="padding: 10px 0;">Belum ada field tambahan.</div>'}window.removeField=k=>{m(),s.splice(k,1),c()};function m(){const k=document.getElementById("fSrvSyaratList");k&&(e=[...k.querySelectorAll(".syarat-input")].map(w=>w.value.trim()));const h=document.getElementById("fSrvStepList");h&&(o=[...h.querySelectorAll(".array-row")].map(w=>{var j,P;return{judul:((j=w.querySelector(".step-judul"))==null?void 0:j.value.trim())||"",deskripsi:((P=w.querySelector(".step-desc"))==null?void 0:P.value.trim())||""}}));const y=document.getElementById("fSrvFormList");y&&(s=[...y.querySelectorAll(".array-row")].map(w=>{var N,H,G,V;const j=((N=w.querySelector(".field-label"))==null?void 0:N.value.trim())||"",P=((H=w.querySelector(".field-type"))==null?void 0:H.value)||"text",B=(((G=w.querySelector(".field-options"))==null?void 0:G.value)||"").split(",").map(ta=>ta.trim()).filter(Boolean),C=!!((V=w.querySelector(".field-required"))!=null&&V.checked);return{key:j.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/(^_|_$)/g,"")||"field_"+Math.random().toString(36).slice(2,6),label:j,type:P,required:C,options:B}}))}async function v(){try{const h=await(await b("/api/admin/pelayanan")).json();t.innerHTML=h.map(y=>{var w,j;return`
                    <tr>
                        <td><b>${(w=y.nama)!=null?w:"-"}</b></td>
                        <td><code>${(j=y.slug)!=null?j:"-"}</code></td>
                        <td>
                            <span class="badge ${y.online?"badge-done":"badge-wait"}">
                                ${y.online?"Online":"Offline"}
                            </span>
                        </td>
                        <td>
                            <span class="badge ${y.status==="aktif"?"badge-done":"badge-wait"}" style="cursor: pointer" onclick="togglePelayananStatus(${y.id}, '${y.status}')">
                                ${y.status==="aktif"?"Aktif":"Nonaktif"}
                            </span>
                        </td>
                        <td class="text-right">
                            <button
                                type="button"
                                class="btn btn-warning btn-sm"
                                onclick="editPelayanan(${y.id})">
                                Edit
                            </button>
                            <button
                                type="button"
                                class="btn btn-danger btn-sm"
                                onclick="deletePelayanan(${y.id})">
                                Hapus
                            </button>
                        </td>
                    </tr>
                `}).join("")||'<tr><td colspan="5" class="muted" style="text-align:center;padding:24px;">Belum ada pelayanan dikonfigurasi.</td></tr>'}catch(k){console.error("Pelayanan Load Error:",k)}}const E=document.getElementById("fSrvTemplateEditor"),I=document.getElementById("varDropdownMenu"),u=document.getElementById("btnInsertVar");document.querySelectorAll(".word-editor-toolbar .toolbar-btn").forEach(k=>{k.addEventListener("click",function(h){h.preventDefault(),h.stopPropagation();const y=this.dataset.cmd;document.execCommand(y,!1,null),E.focus()})}),(T=document.getElementById("editorStyle"))==null||T.addEventListener("change",function(k){document.execCommand("formatBlock",!1,this.value),E.focus()}),(A=document.getElementById("editorFont"))==null||A.addEventListener("change",function(k){document.execCommand("fontName",!1,this.value),E.focus()}),(D=document.getElementById("editorSize"))==null||D.addEventListener("change",function(k){document.execCommand("fontSize",!1,this.value),E.focus()}),u==null||u.addEventListener("click",function(k){k.preventDefault(),k.stopPropagation();const h=I.style.display==="block";I.style.display=h?"none":"block"}),document.addEventListener("click",function(){I&&(I.style.display="none")});function g(k){E.focus();const h=window.getSelection();if(h.getRangeAt&&h.rangeCount){let y=h.getRangeAt(0),w=y.commonAncestorContainer,j=!1;for(;w;){if(w===E){j=!0;break}w=w.parentNode}j||(y=document.createRange(),y.selectNodeContents(E),y.collapse(!1),h.removeAllRanges(),h.addRange(y)),y.deleteContents();const P=document.createTextNode(k);y.insertNode(P),y.setStartAfter(P),y.setEndAfter(P),h.removeAllRanges(),h.addRange(y)}else E.innerHTML+=k}function p(){if(!I)return;let k=`
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
            `;const h=s.filter(y=>y.label&&y.key);h.length>0&&(k+='<div class="dropdown-header">Variabel Form Pengajuan</div>',h.forEach(y=>{k+=`<a class="dropdown-item btn-insert-var-item" href="#" data-var="${y.key}">${y.label} ({{${y.key}}})</a>`})),I.innerHTML=k,I.querySelectorAll(".btn-insert-var-item").forEach(y=>{y.addEventListener("click",function(w){w.preventDefault(),w.stopPropagation(),g(`{{${this.dataset.var}}}`),I.style.display="none"})})}const f=c;c=function(){f();const k=document.getElementById("fSrvFormList");k&&setTimeout(()=>{k.querySelectorAll(".field-label").forEach(y=>{y.addEventListener("input",()=>{m(),p()})})},0),p()},await v(),(K=document.getElementById("btnAddSrv"))==null||K.addEventListener("click",()=>{a.reset(),document.getElementById("fSrvId").value="",document.getElementById("fSrvTemplate").value="",E&&(E.innerHTML=""),document.getElementById("fSrvDeskripsiSurat").value="",document.getElementById("fSrvStatus").checked=!0,e=[],o=[],s=[],r(),l(),c(),d()}),(_=document.getElementById("btnAddSyarat"))==null||_.addEventListener("click",()=>{m(),e.push(""),r()}),(M=document.getElementById("btnAddStep"))==null||M.addEventListener("click",()=>{m(),o.push({judul:"",deskripsi:""}),l()}),($=document.getElementById("btnAddField"))==null||$.addEventListener("click",()=>{m(),s.push({key:"",label:"",type:"text",required:!1,options:[]}),c()}),(L=document.getElementById("srvRefreshBtn"))==null||L.addEventListener("click",v),document.addEventListener("click",k=>{k.target.closest("[data-action='closeSrvModal']")&&n()}),a&&!a.dataset.boundLaravel&&(a.dataset.boundLaravel="true",a.addEventListener("submit",async k=>{var P;k.preventDefault(),m(),E&&(document.getElementById("fSrvTemplate").value=E.innerHTML);const h=document.getElementById("fSrvId").value,y={nama:document.getElementById("fSrvNama").value,slug:document.getElementById("fSrvPage").value,estimasi:document.getElementById("fSrvEstimasi").value,biaya:document.getElementById("fSrvBiaya").value,online:document.getElementById("fSrvOnline").checked,syarat:e.filter(Boolean),langkah:o.filter(x=>x.judul||x.deskripsi),form_fields:s.filter(x=>x.label),jam_pelayanan:document.getElementById("fSrvJam").value,lokasi:document.getElementById("fSrvLokasi").value,catatan:document.getElementById("fSrvCatatan").value,template_html:document.getElementById("fSrvTemplate").value,teks_tombol:document.getElementById("fSrvTombol").value,deskripsi_surat:document.getElementById("fSrvDeskripsiSurat").value,status:document.getElementById("fSrvStatus").checked?"aktif":"nonaktif"};let w;const j=(P=document.querySelector('meta[name="csrf-token"]'))==null?void 0:P.content;if(h?w=await b(`/api/admin/pelayanan/${h}`,{method:"PUT",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":j,Accept:"application/json"},body:JSON.stringify(y)}):w=await b("/api/admin/pelayanan",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":j,Accept:"application/json"},body:JSON.stringify(y)}),!w.ok){alert("Gagal menyimpan pelayanan");return}n(),await v()}));function S(k){const h=(k||"").toUpperCase(),y=`
<table class="data-table">
  <tr><td class="field-label">Nama Lengkap</td><td class="sep">:</td><td><strong>{{nama}}</strong></td></tr>
  <tr><td class="field-label">Tempat / Tgl Lahir</td><td class="sep">:</td><td>{{tempat_lahir}}, {{tgl_lahir}}</td></tr>
  <tr><td class="field-label">Jenis Kelamin</td><td class="sep">:</td><td>{{jenis_kelamin}}</td></tr>
  <tr><td class="field-label">Agama</td><td class="sep">:</td><td>{{agama}}</td></tr>
  <tr><td class="field-label">Status Perkawinan</td><td class="sep">:</td><td>{{status_nikah}}</td></tr>
  <tr><td class="field-label">Pekerjaan</td><td class="sep">:</td><td>{{pekerjaan}}</td></tr>
  <tr><td class="field-label">NIK</td><td class="sep">:</td><td>{{nik}}</td></tr>
  <tr><td class="field-label">No. KK</td><td class="sep">:</td><td>{{no_kk}}</td></tr>
  <tr><td class="field-label">Alamat</td><td class="sep">:</td><td>{{alamat}}</td></tr>
  <tr><td class="field-label">RT / RW</td><td class="sep">:</td><td>{{rt}} / {{rw}}</td></tr>
</table>`;switch(h){case"SKTM":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
\${blockPemohon}
<p style="margin-top: 15px;">Adalah benar warga Kelurahan Duren Mekar yang berdomisili pada alamat tersebut di atas, dan yang bersangkutan <strong>TIDAK MAMPU / KURANG MAMPU</strong> secara ekonomi.</p>
<p>Surat keterangan ini dibuat untuk keperluan : <strong>{{keperluan}}</strong>.</p>
<p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>`;case"SKDOM":case"SKDM":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
\${blockPemohon}
<p style="margin-top: 15px;">Adalah benar warga yang berdomisili / bertempat tinggal secara <strong>{{jenis_domisili}}</strong> di Kelurahan Duren Mekar sejak <strong>{{sejak_tahun}}</strong>.</p>
<p>Surat keterangan ini dibuat untuk keperluan : <strong>{{keperluan}}</strong>.</p>
<p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>`;case"SKKEHIDUPAN":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan dengan sesungguhnya bahwa :</p>
\${blockPemohon}
<p style="margin-top: 15px;">Adalah benar warga Kelurahan Duren Mekar yang berdomisili pada alamat tersebut di atas dan pada saat surat keterangan ini dibuat, yang bersangkutan <strong>MASIH HIDUP</strong>.</p>
<p>Surat keterangan ini dibuat untuk keperluan : <strong>{{keperluan}}</strong>.</p>
<p>Demikian surat keterangan ini kami buat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>`;case"SKBELUMNIK":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
\${blockPemohon}
<p style="margin-top: 15px;">Adalah benar warga Kelurahan Duren Mekar dan berdasarkan data yang ada pada kami, yang bersangkutan <strong>BELUM MEMILIKI NOMOR INDUK KEPENDUDUKAN (NIK)</strong>.</p>
<p>Surat keterangan ini dibuat untuk keperluan : <strong>{{keperluan}}</strong>.</p>
<p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>`;case"SKWIRASWASTA":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
\${blockPemohon}
<p style="margin-top: 15px;">Adalah benar warga Kelurahan Duren Mekar yang menjalankan usaha/wirausaha dengan keterangan sebagai berikut :</p>
<table class="data-table">
  <tr><td class="field-label">Nama Usaha</td><td class="sep">:</td><td>{{nama_usaha}}</td></tr>
  <tr><td class="field-label">Jenis Usaha</td><td class="sep">:</td><td>{{jenis_usaha}}</td></tr>
  <tr><td class="field-label">Alamat Usaha</td><td class="sep">:</td><td>{{alamat_usaha}}</td></tr>
  <tr><td class="field-label">Perkiraan Pendapatan</td><td class="sep">:</td><td>Rp {{pendapatan}} / bulan</td></tr>
</table>
<p style="margin-top: 15px;">Surat keterangan ini dibuat untuk keperluan : <strong>{{keperluan}}</strong>.</p>
<p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>`;case"SKPINDAH":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
\${blockPemohon}
<p style="margin-top: 15px;">Adalah benar warga Kelurahan Duren Mekar yang akan <strong>PINDAH TEMPAT TINGGAL</strong> ke :</p>
<table class="data-table">
  <tr><td class="field-label">Alamat Tujuan</td><td class="sep">:</td><td>{{alamat_tujuan}}</td></tr>
  <tr><td class="field-label">Kelurahan/Desa</td><td class="sep">:</td><td>{{kel_tujuan}}</td></tr>
  <tr><td class="field-label">Kecamatan</td><td class="sep">:</td><td>{{kec_tujuan}}</td></tr>
  <tr><td class="field-label">Kota/Kabupaten</td><td class="sep">:</td><td>{{kota_tujuan}}</td></tr>
  <tr><td class="field-label">Alasan Pindah</td><td class="sep">:</td><td>{{alasan_pindah}}</td></tr>
</table>
<p style="margin-top: 15px;">Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>`;case"SKKEMATIAN":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
<table class="data-table">
  <tr><td class="field-label">Nama Almarhum/ah</td><td class="sep">:</td><td><strong>{{nama_alm}}</strong></td></tr>
  <tr><td class="field-label">Tempat / Tgl Lahir</td><td class="sep">:</td><td>{{tempat_lahir_alm}}, {{tgl_lahir_alm}}</td></tr>
  <tr><td class="field-label">NIK</td><td class="sep">:</td><td>{{nik_alm}}</td></tr>
  <tr><td class="field-label">Agama</td><td class="sep">:</td><td>{{agama_alm}}</td></tr>
  <tr><td class="field-label">Tanggal Meninggal</td><td class="sep">:</td><td>{{tgl_meninggal}}</td></tr>
  <tr><td class="field-label">Tempat Meninggal</td><td class="sep">:</td><td>{{tempat_meninggal}}</td></tr>
  <tr><td class="field-label">Sebab Kematian</td><td class="sep">:</td><td>{{sebab_kematian}}</td></tr>
  <tr><td class="field-label">Alamat Terakhir</td><td class="sep">:</td><td>{{alamat_alm}}</td></tr>
</table>
<p style="margin-top: 15px;">Surat keterangan ini dibuat untuk keperluan : <strong>{{keperluan}}</strong>.</p>
<p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>`;case"SKKELAHIRAN":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa telah lahir seorang anak dengan keterangan sebagai berikut :</p>
<table class="data-table">
  <tr><td class="field-label">Nama Anak</td><td class="sep">:</td><td><strong>{{nama_anak}}</strong></td></tr>
  <tr><td class="field-label">Jenis Kelamin</td><td class="sep">:</td><td>{{jk_anak}}</td></tr>
  <tr><td class="field-label">Tempat Lahir</td><td class="sep">:</td><td>{{tempat_lahir_anak}}</td></tr>
  <tr><td class="field-label">Tanggal Lahir</td><td class="sep">:</td><td>{{tgl_lahir_anak}}</td></tr>
  <tr><td class="field-label">Nama Ayah</td><td class="sep">:</td><td>{{nama_ayah}}</td></tr>
  <tr><td class="field-label">Nama Ibu</td><td class="sep">:</td><td>{{nama_ibu}}</td></tr>
  <tr><td class="field-label">Alamat Orang Tua</td><td class="sep">:</td><td>{{alamat_ortu}}</td></tr>
</table>
<p style="margin-top: 15px;">Surat keterangan ini dibuat untuk keperluan : <strong>{{keperluan}}</strong>.</p>
<p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>`;case"SKGAJISWASTA":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
\${blockPemohon}
<p style="margin-top: 15px;">Adalah benar warga Kelurahan Duren Mekar yang bekerja sebagai <strong>{{jabatan}}</strong> di <strong>{{nama_perusahaan}}</strong> dengan penghasilan rata-rata <strong>Rp {{penghasilan}}</strong> per bulan.</p>
<p>Surat keterangan ini dibuat untuk keperluan : <strong>{{keperluan}}</strong>.</p>
<p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>`;case"SKGAJIPNS":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
\${blockPemohon}
<p style="margin-top: 15px;">Adalah benar warga Kelurahan Duren Mekar yang berstatus sebagai <strong>Pegawai Negeri Sipil (PNS)</strong> pada instansi <strong>{{instansi}}</strong>, Golongan <strong>{{golongan}}</strong>, dengan penghasilan rata-rata <strong>Rp {{penghasilan}}</strong> per bulan.</p>
<p>Surat keterangan ini dibuat untuk keperluan : <strong>{{keperluan}}</strong>.</p>
<p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>`;case"SKPEMILIKAN":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
\${blockPemohon}
<p style="margin-top: 15px;">Adalah benar warga Kelurahan Duren Mekar yang memiliki sebidang tanah dengan keterangan :</p>
<table class="data-table">
  <tr><td class="field-label">Luas Tanah</td><td class="sep">:</td><td>{{luas_tanah}} m\xB2</td></tr>
  <tr><td class="field-label">Lokasi Tanah</td><td class="sep">:</td><td>{{lokasi_tanah}}</td></tr>
  <tr><td class="field-label">Bukti Kepemilikan</td><td class="sep">:</td><td>{{bukti_kepemilikan}}</td></tr>
  <tr><td class="field-label">Nomor Sertifikat</td><td class="sep">:</td><td>{{no_sertifikat}}</td></tr>
</table>
<p style="margin-top: 15px;">Surat keterangan ini dibuat untuk keperluan : <strong>{{keperluan}}</strong>.</p>
<p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>`;case"SKTIDAKBUTA":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
\${blockPemohon}
<p style="margin-top: 15px;">Adalah benar warga Kelurahan Duren Mekar yang berdasarkan pengetahuan dan pengamatan kami, yang bersangkutan <strong>TIDAK BUTA HURUF</strong> dan mampu membaca serta menulis dengan baik.</p>
<p>Surat keterangan ini dibuat untuk keperluan : <strong>{{keperluan}}</strong>.</p>
<p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>`;case"SKSENGKETA":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
\${blockPemohon}
<p style="margin-top: 15px;">Adalah benar warga Kelurahan Duren Mekar yang memiliki tanah/bangunan di <strong>{{alamat_tanah}}</strong>, dan berdasarkan pengetahuan kami, tanah/bangunan tersebut <strong>TIDAK DALAM SENGKETA</strong> dengan pihak manapun.</p>
<p>Surat keterangan ini dibuat untuk keperluan : <strong>{{keperluan}}</strong>.</p>
<p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>`;case"SKBERSIH":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
\${blockPemohon}
<p style="margin-top: 15px;">Adalah benar warga Kelurahan Duren Mekar yang berdasarkan pengetahuan dan pengamatan kami selama ini, yang bersangkutan <strong>BERKELAKUAN BAIK</strong>, tidak pernah terlibat dalam tindak pidana dan tidak pernah melakukan perbuatan yang bertentangan dengan norma masyarakat.</p>
<p>Surat keterangan ini dibuat untuk keperluan : <strong>{{keperluan}}</strong>.</p>
<p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>`;case"N1":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
\${blockPemohon}
<p style="margin-top: 15px;">Adalah benar warga Kelurahan Duren Mekar dan bermaksud untuk <strong>MELANGSUNGKAN PERNIKAHAN</strong> dengan :</p>
<table class="data-table">
  <tr><td class="field-label">Nama Calon Pasangan</td><td class="sep">:</td><td><strong>{{nama_pasangan}}</strong></td></tr>
  <tr><td class="field-label">Tempat / Tgl Lahir</td><td class="sep">:</td><td>{{ttl_pasangan}}</td></tr>
  <tr><td class="field-label">NIK Calon Pasangan</td><td class="sep">:</td><td>{{nik_pasangan}}</td></tr>
  <tr><td class="field-label">Alamat Calon Pasangan</td><td class="sep">:</td><td>{{alamat_pasangan}}</td></tr>
  <tr><td class="field-label">Rencana Menikah</td><td class="sep">:</td><td>{{rencana_nikah}}</td></tr>
</table>
<p style="margin-top: 15px;">Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya di Kantor Urusan Agama setempat.</p>`;case"N2":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
\${blockPemohon}
<p style="margin-top: 15px;">Adalah anak dari :</p>
<table class="data-table">
  <tr><td class="field-label">Nama Ayah</td><td class="sep">:</td><td>{{nama_ayah}}</td></tr>
  <tr><td class="field-label">Nama Ibu</td><td class="sep">:</td><td>{{nama_ibu}}</td></tr>
  <tr><td class="field-label">Alamat Orang Tua</td><td class="sep">:</td><td>{{alamat_ortu}}</td></tr>
  <tr><td class="field-label">Status Perkawinan Ortu</td><td class="sep">:</td><td>{{status_ortu}}</td></tr>
</table>
<p style="margin-top: 15px;">Demikian surat keterangan asal usul ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya di Kantor Urusan Agama setempat.</p>`;case"N4":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
<table class="data-table">
  <tr><td class="field-label">Nama Ayah</td><td class="sep">:</td><td><strong>{{nama_ayah}}</strong></td></tr>
  <tr><td class="field-label">Tempat / Tgl Lahir</td><td class="sep">:</td><td>{{ttl_ayah}}</td></tr>
  <tr><td class="field-label">Pekerjaan Ayah</td><td class="sep">:</td><td>{{pekerjaan_ayah}}</td></tr>
  <tr><td class="field-label">Nama Ibu</td><td class="sep">:</td><td><strong>{{nama_ibu}}</strong></td></tr>
  <tr><td class="field-label">Tempat / Tgl Lahir Ibu</td><td class="sep">:</td><td>{{ttl_ibu}}</td></tr>
  <tr><td class="field-label">Pekerjaan Ibu</td><td class="sep">:</td><td>{{pekerjaan_ibu}}</td></tr>
  <tr><td class="field-label">Alamat Orang Tua</td><td class="sep">:</td><td>{{alamat_ortu}}</td></tr>
</table>
<p style="margin-top: 15px;">Demikian surat keterangan tentang orang tua ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya di Kantor Urusan Agama setempat.</p>`;case"PENGANTAR":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, memberikan surat pengantar kepada :</p>
\${blockPemohon}
<p style="margin-top: 15px;">Untuk keperluan : <strong>{{keperluan}}</strong> pada instansi/lembaga <strong>{{tujuan_instansi}}</strong>.</p>
<p>Kepada yang berwenang diharapkan dapat memberikan bantuan sebagaimana mestinya.</p>
<p>Demikian surat pengantar ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>`;case"PENGANTARSKCK":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, memberikan surat pengantar guna keperluan pembuatan Surat Keterangan Catatan Kepolisian (SKCK) kepada :</p>
\${blockPemohon}
<p style="margin-top: 15px;">Kepada Yth. Kepala Kepolisian Sektor / Resort Kota Depok agar berkenan membantu yang bersangkutan dalam pembuatan <strong>SKCK</strong>.</p>
<p>Demikian surat pengantar ini dibuat dengan sebenarnya.</p>`;case"PENGANTARPINDAH":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
\${blockPemohon}
<p style="margin-top: 15px;">Bermaksud pindah tempat tinggal ke : <strong>{{alamat_tujuan}}</strong>, Kelurahan <strong>{{kel_tujuan}}</strong>, Kecamatan <strong>{{kec_tujuan}}</strong>, Kota/Kabupaten <strong>{{kota_tujuan}}</strong>.</p>
<p>Kepada pihak yang berwenang di tempat tujuan agar berkenan menerima dan membantu yang bersangkutan mengurus kepindahannya.</p>
<p>Demikian surat pengantar ini dibuat dengan sebenarnya.</p>`;case"REKOMENDASI":return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, dengan ini memberikan <strong>REKOMENDASI</strong> kepada :</p>
\${blockPemohon}
<p style="margin-top: 15px;">Untuk keperluan : <strong>{{keperluan}}</strong>.</p>
<p>Berdasarkan pengamatan dan pengetahuan kami, yang bersangkutan adalah warga yang baik, bertanggung jawab, dan layak mendapat rekomendasi untuk keperluan tersebut.</p>
<p>Demikian surat rekomendasi ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>`;case"KUASA":return`<p>Yang bertanda tangan di bawah ini, selaku Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
<p><strong>PEMBERI KUASA :</strong></p>
\${blockPemohon}
<p style="margin-top: 15px;"><strong>Memberikan kuasa penuh kepada :</strong></p>
<table class="data-table">
  <tr><td class="field-label">Nama Penerima Kuasa</td><td class="sep">:</td><td><strong>{{nama_penerima}}</strong></td></tr>
  <tr><td class="field-label">NIK Penerima Kuasa</td><td class="sep">:</td><td>{{nik_penerima}}</td></tr>
  <tr><td class="field-label">Hubungan</td><td class="sep">:</td><td>{{hubungan}}</td></tr>
  <tr><td class="field-label">Alamat Penerima</td><td class="sep">:</td><td>{{alamat_penerima}}</td></tr>
</table>
<p style="margin-top: 15px;">Untuk keperluan : <strong>{{keperluan}}</strong>.</p>
<p>Surat kuasa ini dibuat dengan sebenarnya tanpa paksaan dari pihak manapun.</p>`;default:return`<p>Yang bertanda tangan di bawah ini, Lurah Duren Mekar, Kecamatan Bojongsari, Kota Depok, menerangkan bahwa :</p>
\${blockPemohon}
<p style="margin-top: 15px;">Surat keterangan ini dibuat untuk keperluan : <strong>{{keperluan}}</strong>.</p>
<p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>`}}window.editPelayanan=async function(k){var x,B,C,F,N,H,G,V,ta,ya,fa,ba,ka,Ea;const y=await(await b(`/api/admin/pelayanan/${k}`)).json();document.getElementById("fSrvId").value=y.id,document.getElementById("fSrvNama").value=(x=y.nama)!=null?x:"",document.getElementById("fSrvPage").value=(B=y.slug)!=null?B:"",document.getElementById("fSrvEstimasi").value=(C=y.estimasi)!=null?C:"",document.getElementById("fSrvBiaya").value=(F=y.biaya)!=null?F:"",document.getElementById("fSrvOnline").checked=!!y.online,document.getElementById("fSrvJam").value=(N=y.jam_pelayanan)!=null?N:"",document.getElementById("fSrvLokasi").value=(H=y.lokasi)!=null?H:"",document.getElementById("fSrvCatatan").value=(G=y.catatan)!=null?G:"";const w=(ta=(V=y.template)==null?void 0:V.konten_html)!=null?ta:"",j=S(y.slug||y.kode_surat),P=w.trim()!==""?w:j;document.getElementById("fSrvTemplate").value=P,E&&(E.innerHTML=P),document.getElementById("fSrvTombol").value=(ya=y.teks_tombol)!=null?ya:"",document.getElementById("fSrvDeskripsiSurat").value=(fa=y.deskripsi_surat)!=null?fa:"",document.getElementById("fSrvStatus").checked=y.status==="aktif",e=(ba=y.syarat)!=null?ba:[],o=(ka=y.langkah)!=null?ka:[],s=(Ea=y.form_fields)!=null?Ea:[],r(),l(),c(),d()},window.togglePelayananStatus=async function(k,h){var j,P;const y=h==="aktif"?"nonaktif":"aktif",w=(j=document.querySelector('meta[name="csrf-token"]'))==null?void 0:j.content;try{const B=await(await b(`/api/admin/pelayanan/${k}`)).json(),C={nama:B.nama,slug:B.slug,estimasi:B.estimasi,biaya:B.biaya,online:B.online,syarat:B.syarat,langkah:B.langkah,form_fields:B.form_fields,jam_pelayanan:B.jam_pelayanan,lokasi:B.lokasi,catatan:B.catatan,template_html:((P=B.template)==null?void 0:P.konten_html)||"",teks_tombol:B.teks_tombol,deskripsi_surat:B.deskripsi_surat,status:y};(await b(`/api/admin/pelayanan/${k}`,{method:"PUT",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":w,Accept:"application/json"},body:JSON.stringify(C)})).ok?await v():alert("Gagal mengubah status pelayanan")}catch(x){console.error("Error toggling status:",x)}},window.deletePelayanan=async function(k){var y;if(!confirm("Hapus pelayanan ini?"))return;const h=(y=document.querySelector('meta[name="csrf-token"]'))==null?void 0:y.content;await b(`/api/admin/pelayanan/${k}`,{method:"DELETE",headers:{"X-CSRF-TOKEN":h,Accept:"application/json"}}),await v()}}async function pa(){console.log("SETTING LARAVEL LOADED");const t=document.querySelector("[data-action='saveSettings']");if(!t)return;async function a(){var n,e,o,s,r,l,c,m;const i=await b("/api/admin/setting");if(!i.ok)return;const d=await i.json();d&&(document.getElementById("sSiteName").value=(n=d.site_name)!=null?n:"",document.getElementById("sEmail").value=(e=d.email)!=null?e:"",document.getElementById("sPhone").value=(o=d.phone)!=null?o:"",document.getElementById("sAddress").value=(s=d.address)!=null?s:"",document.getElementById("sInstagram").value=(r=d.instagram)!=null?r:"",document.getElementById("sFacebook").value=(l=d.facebook)!=null?l:"",document.getElementById("sYoutube").value=(c=d.youtube)!=null?c:"",document.getElementById("sNote").value=(m=d.profil)!=null?m:"")}await a(),t.dataset.laravelBound||(t.dataset.laravelBound="true",t.addEventListener("click",async()=>{const i={site_name:document.getElementById("sSiteName").value,email:document.getElementById("sEmail").value,phone:document.getElementById("sPhone").value,address:document.getElementById("sAddress").value,instagram:document.getElementById("sInstagram").value,facebook:document.getElementById("sFacebook").value,youtube:document.getElementById("sYoutube").value,profil:document.getElementById("sNote").value},n=await(await b("/api/admin/setting")).json();let e;if(n!=null&&n.id?e=await b(`/api/admin/setting/${n.id}`,{method:"PUT",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(i)}):e=await b("/api/admin/setting",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(i)}),!e.ok){alert("Gagal menyimpan pengaturan");return}alert("Pengaturan berhasil disimpan"),await a()}))}async function Fa(){const t=document.getElementById("adminUsersTbody");if(!t)return;async function a(){try{const n=await(await b("/api/admin/users")).json();document.getElementById("adminUsersEmpty").style.display=n.length?"none":"block",t.innerHTML=n.map(e=>{var o,s,r,l;return`

                <tr>

                    <td>${e.name}</td>

                    <td>${e.email}</td>

                    <td>
                        <span class="badge">
                            ${e.role}
                        </span>
                    </td>

                    <td>
                        ${(o=e.status)!=null?o:"aktif"}
                    </td>

                    <td>
                        ${(s=e.telp)!=null?s:"-"}
                    </td>

                    <td>
                        ${(r=e.rt)!=null?r:"-"}
                        /
                        ${(l=e.rw)!=null?l:"-"}
                    </td>

                    <td>
                        ${e.created_at?new Date(e.created_at).toLocaleDateString("id-ID"):"-"}
                    </td>

                    <td>

                        <button
                            class="btn btn-warning btn-sm"
                            onclick="editUser(${e.id})">

                            Edit

                        </button>

                        <button
                            class="btn btn-danger btn-sm"
                            onclick="deleteUser(${e.id})">

                            Hapus

                        </button>

                    </td>

                </tr>

                `}).join("")}catch(d){console.error(d)}}await a();const i=document.getElementById("adminUserForm");i&&!i.dataset.bound&&(i.dataset.bound=!0,i.addEventListener("submit",async function(d){var r,l;d.preventDefault();const n=document.getElementById("userId").value,e={name:document.getElementById("userName").value,email:document.getElementById("userEmail").value,role:document.getElementById("userRole").value,status:document.getElementById("userStatus").value},o=(r=document.querySelector('meta[name="csrf-token"]'))==null?void 0:r.content;if(!(await b(`/api/admin/users/${n}`,{method:"PUT",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":o,Accept:"application/json"},body:JSON.stringify(e)})).ok){alert("Gagal menyimpan user");return}(l=document.getElementById("adminUserModal"))==null||l.classList.remove("open"),await a()})),window.editUser=async function(d){var o,s,r,l,c;const e=await(await b(`/api/admin/users/${d}`)).json();document.getElementById("userId").value=e.id,document.getElementById("userName").value=(o=e.name)!=null?o:"",document.getElementById("userEmail").value=(s=e.email)!=null?s:"",document.getElementById("userRole").value=(r=e.role)!=null?r:"warga",document.getElementById("userStatus").value=(l=e.status)!=null?l:"aktif",(c=document.getElementById("adminUserModal"))==null||c.classList.add("open")},window.deleteUser=async function(d){var s,r;if(!confirm("Hapus user ini?"))return;const n=(s=document.querySelector('meta[name="csrf-token"]'))==null?void 0:s.content,e=await b(`/api/admin/users/${d}`,{method:"DELETE",headers:{"X-CSRF-TOKEN":n,Accept:"application/json"}}),o=await e.json();if(!e.ok){alert((r=o.message)!=null?r:"Gagal menghapus user");return}await a()},document.querySelectorAll('[data-action="userClose"]').forEach(d=>{d.onclick=()=>{var n;(n=document.getElementById("adminUserModal"))==null||n.classList.remove("open")}})}let ga=!1;async function qa(){const t=document.getElementById("adminPenandatanganTbody"),a=document.getElementById("adminPenandatanganEmpty"),i=document.getElementById("adminPenandatanganSearch");if(!t)return;let d=[];async function n(){try{const s=await b("/api/admin/master-penandatangan",{credentials:"same-origin",headers:{Accept:"application/json"}});if(!s.ok)throw new Error("Gagal memuat data penandatangan");d=await s.json(),e()}catch(s){console.error(s),t.innerHTML=`<tr><td colspan="5" style="text-align:center;color:red;">${s.message}</td></tr>`}}function e(){const s=((i==null?void 0:i.value)||"").trim().toLowerCase();let r=d;if(s&&(r=r.filter(l=>(l.nama||"").toLowerCase().includes(s)||(l.nip||"").toLowerCase().includes(s)||(l.jabatan||"").toLowerCase().includes(s))),!r.length){t.innerHTML="",a&&(a.style.display="block");return}a&&(a.style.display="none"),t.innerHTML=r.map(l=>{const c=l.status_aktif?'<span class="badge badge-done" style="background:rgba(34,197,94,.12);color:#16a34a">Aktif</span>':'<span class="badge badge-neutral" style="background:rgba(148,163,184,.22);color:#334155">Nonaktif</span>';return`
                <tr>
                    <td><b>${l.nama}</b></td>
                    <td>${l.jabatan}</td>
                    <td>${l.nip}</td>
                    <td>${c}</td>
                    <td>
                        <div class="row-actions">
                            <button class="btn btn-warning btn-sm" data-action="penandatanganEdit" data-id="${l.id}">
                                <i class="fa-solid fa-pen"></i> Edit
                            </button>
                            <button class="btn btn-danger btn-sm" data-action="penandatanganDelete" data-id="${l.id}">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
                `}).join("")}if(await n(),i&&!i.dataset.bound&&(i.dataset.bound="true",i.addEventListener("input",e)),ga)return;ga=!0;const o=document.getElementById("adminPenandatanganForm");o&&o.addEventListener("submit",async function(s){var E,I;s.preventDefault();const r=document.getElementById("penandatanganId").value,l={nama:document.getElementById("penandatanganNama").value,jabatan:document.getElementById("penandatanganJabatan").value,nip:document.getElementById("penandatanganNip").value,status_aktif:document.getElementById("penandatanganStatus").value==="1"},c=(E=document.querySelector('meta[name="csrf-token"]'))==null?void 0:E.content,m=r?"PUT":"POST",v=r?`/api/admin/master-penandatangan/${r}`:"/api/admin/master-penandatangan";try{const u=await b(v,{method:m,headers:{"Content-Type":"application/json","X-CSRF-TOKEN":c,Accept:"application/json"},body:JSON.stringify(l)});if(!u.ok){const g=await u.json();throw new Error(g.message||"Gagal menyimpan data")}(I=document.getElementById("adminPenandatanganModal"))==null||I.classList.remove("open"),await n()}catch(u){alert(u.message)}}),document.addEventListener("click",async s=>{var v,E,I,u;const r=s.target.closest("[data-action='penandatanganCreate']"),l=s.target.closest("[data-action='penandatanganEdit']"),c=s.target.closest("[data-action='penandatanganDelete']");if(s.target.closest("[data-action='penandatanganClose']")&&((v=document.getElementById("adminPenandatanganModal"))==null||v.classList.remove("open")),r&&(document.getElementById("adminPenandatanganModalTitle").textContent="Tambah Penandatangan",document.getElementById("penandatanganId").value="",document.getElementById("penandatanganNama").value="",document.getElementById("penandatanganJabatan").value="",document.getElementById("penandatanganNip").value="",document.getElementById("penandatanganStatus").value="1",(E=document.getElementById("adminPenandatanganModal"))==null||E.classList.add("open")),l){const g=l.dataset.id;try{const p=await b(`/api/admin/master-penandatangan/${g}`);if(!p.ok)throw new Error("Gagal mengambil data penandatangan");const f=await p.json();document.getElementById("adminPenandatanganModalTitle").textContent="Edit Penandatangan",document.getElementById("penandatanganId").value=f.id,document.getElementById("penandatanganNama").value=f.nama,document.getElementById("penandatanganJabatan").value=f.jabatan,document.getElementById("penandatanganNip").value=f.nip,document.getElementById("penandatanganStatus").value=f.status_aktif?"1":"0",(I=document.getElementById("adminPenandatanganModal"))==null||I.classList.add("open")}catch(p){alert(p.message)}}if(c){const g=c.dataset.id;if(!confirm("Apakah Anda yakin ingin menghapus pejabat penandatangan ini?"))return;const p=(u=document.querySelector('meta[name="csrf-token"]'))==null?void 0:u.content;try{if(!(await b(`/api/admin/master-penandatangan/${g}`,{method:"DELETE",headers:{"X-CSRF-TOKEN":p,Accept:"application/json"}})).ok)throw new Error("Gagal menghapus data");await n()}catch(f){alert(f.message)}}})}window.addEventListener("page:loaded",t=>{var d;const a=((d=t.detail)==null?void 0:d.name)||"",i=a.startsWith("admin/");if(ha(i),!i){document.body.classList.remove("admin-menu-open");return}na.requireAdmin()&&(Ta(),Ia("#"+a),wa(),Ba("#"+a),Sa(),La(),a==="admin/dashboard"&&Aa(),a==="admin/berita"&&X(),a==="admin/agenda"&&ua(),a==="admin/galeri"&&Da(),a==="admin/pengumuman"&&ma(),a==="admin/pengaturan"&&pa(),a==="admin/profil-kelurahan"&&ja(),a==="admin/pengaduan"&&Pa(),a==="admin/surat"&&Ka(),a==="admin/rt-rw"&&_a(),a==="admin/faq"&&Ma(),a==="admin/lembaga"&&Ca(),a==="admin/unit-kerja"&&Na(),a==="admin/pelayanan"&&Ra(),a==="admin/master-penandatangan"&&qa(),a==="admin/users"&&Fa(),a==="admin/struktur-organisasi"&&xa(),a==="admin/laporan"&&$a())})})();

