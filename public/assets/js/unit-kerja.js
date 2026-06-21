(function(){if(!window.KelurahanStore)return;const{Storage:U}=window.KelurahanStore,W=window.KelurahanGuard||{},x="unitKerja";function na(){const u=U.get(x,null);if(Array.isArray(u)&&u.length)return;const o=[{id:"lurah",slug:"lurah",unitName:"Kantor Lurah",name:"Drs. Ahmad Suryanto, M.Si",position:"Lurah Duren Mekar",nip:"197503121998031001",email:"lurah@kelurahan.go.id",phone:"081234567890",photo:"assets/images/staf/lurah.jpg",pendidikan:"S2 Administrasi Publik",riwayat:["Lurah Duren Mekar (2020 - Sekarang)","Sekretaris Kelurahan (2015 - 2020)","Kasi Tata Pemerintahan (2010 - 2015)"],tugas:["Melaksanakan kegiatan pemerintahan kelurahan.","Memberdayakan masyarakat kelurahan.","Melaksanakan pelayanan administrasi kelurahan.","Memelihara ketenteraman dan ketertiban umum.","Memelihara prasarana dan fasilitas pelayanan umum.","Melaksanakan upaya perlindungan masyarakat.","Menyusun perencanaan pembangunan kelurahan.","Mengkoordinasikan pembangunan secara partisipatif."],kewenangan:["Mengkoordinasikan kegiatan pemberdayaan masyarakat.","Mengkoordinasikan penyelenggaraan ketenteraman dan ketertiban umum.","Mengkoordinasikan penerapan dan penegakan Peraturan Daerah dan Peraturan Wali Kota.","Mengkoordinasikan pemeliharaan prasarana dan fasilitas pelayanan umum.","Melaksanakan pelayanan administrasi pemerintahan kepada masyarakat."]},{id:"sekretariat",slug:"sekretariat",unitName:"Sekretariat Kelurahan",name:"Sri Wahyuni, S.Sos, M.AP",position:"Sekretaris Kelurahan",nip:"198205101999032002",email:"sekretaris@kelurahan.go.id",phone:"081234567891",photo:"assets/images/staf/sekretaris.jpg",pendidikan:"S2 Administrasi Publik",riwayat:["Sekretaris Kelurahan (2018 - Sekarang)","Kasi Pemberdayaan Masyarakat (2013 - 2018)"],tugas:["Melaksanakan urusan ketatausahaan.","Melaksanakan urusan kepegawaian.","Melaksanakan urusan keuangan.","Melaksanakan urusan perlengkapan.","Melaksanakan urusan rumah tangga kelurahan.","Menyusun rencana dan laporan."],kewenangan:["Mengelola surat menyurat dan kearsipan.","Mengelola kepegawaian kelurahan.","Mengelola keuangan kelurahan.","Mengelola aset dan inventaris kelurahan."]},{id:"tata-pemerintahan",slug:"tata-pemerintahan",unitName:"Seksi Tata Pemerintahan",name:"Budi Santoso, S.STP",position:"Kepala Seksi Tata Pemerintahan",nip:"198402101999031004",email:"tapem@kelurahan.go.id",phone:"081234567892",photo:"assets/images/staf/tapem.jpg",pendidikan:"S1 Ilmu Pemerintahan",riwayat:["Kasi Tata Pemerintahan (2019 - Sekarang)","Staf Tata Pemerintahan (2013 - 2019)"],tugas:["Menyelenggarakan administrasi kependudukan dan catatan sipil.","Mengolah data pertanahan dan penataan wilayah.","Membina administrasi pemerintahan di tingkat RT/RW.","Menyiapkan bahan laporan penyelenggaraan pemerintahan kelurahan.","Melaksanakan pelayanan surat keterangan administrasi kependudukan."],kewenangan:["Menerbitkan surat keterangan domisili dan keterangan lainnya sesuai kewenangan.","Mengelola data kependudukan dan profil wilayah kelurahan.","Mengkoordinasikan penataan batas wilayah dan administrasi RT/RW.","Melakukan verifikasi administrasi kependudukan untuk keperluan layanan publik."]},{id:"pemberdayaan",slug:"pemberdayaan",unitName:"Seksi Pemberdayaan Masyarakat, Pemuda dan Budaya",name:"Rina Lestari, S.Sos",position:"Kepala Seksi Pemberdayaan Masyarakat, Pemuda dan Budaya",nip:"198703151999032006",email:"pemberdayaan@kelurahan.go.id",phone:"081234567893",photo:"assets/images/staf/pemberdayaan.jpg",pendidikan:"S1 Sosiologi",riwayat:["Kasi Pemberdayaan Masyarakat (2019 - Sekarang)","Staf Pemberdayaan Masyarakat (2012 - 2019)"],tugas:["Mendorong partisipasi masyarakat dalam pembangunan kelurahan.","Membina lembaga kemasyarakatan seperti LPM, PKK, Karang Taruna, dan kelompok masyarakat lainnya.","Memfasilitasi program pemberdayaan ekonomi masyarakat dan UMKM.","Menyusun program pembinaan kepemudaan dan olahraga.","Mengembangkan kegiatan pelestarian adat, seni, dan budaya lokal."],kewenangan:["Menetapkan prioritas kegiatan pemberdayaan masyarakat pada tingkat kelurahan.","Memfasilitasi penyaluran bantuan sosial dan program pemerintah kepada kelompok masyarakat.","Mengkoordinasikan kegiatan kepemudaan dan Karang Taruna.","Menginisiasi dan mempromosikan kegiatan budaya dan kebersamaan warga."]},{id:"ketertiban",slug:"ketertiban",unitName:"Seksi Ketentraman dan Ketertiban Umum",name:"Agus Pratama, S.IP",position:"Kepala Seksi Ketentraman dan Ketertiban Umum",nip:"198305201999031007",email:"trantib@kelurahan.go.id",phone:"081234567894",photo:"assets/images/staf/trantib.jpg",pendidikan:"S1 Ilmu Politik",riwayat:["Kasi Ketentraman dan Ketertiban Umum (2018 - Sekarang)","Staf Penegakan Perda Kecamatan (2012 - 2018)"],tugas:["Menjaga ketentraman dan ketertiban umum di wilayah kelurahan.","Membina dan mengkoordinasikan kegiatan keamanan lingkungan (Siskamling).","Menindaklanjuti laporan/pengaduan masyarakat terkait gangguan ketertiban.","Melakukan sosialisasi peraturan daerah kepada masyarakat.","Berkoordinasi dengan aparat terkait dalam penanganan ketertiban umum."],kewenangan:["Melakukan penertiban terhadap kegiatan masyarakat yang berpotensi mengganggu ketertiban umum sesuai kewenangan kelurahan.","Menyusun rekomendasi penanganan pelanggaran Peraturan Daerah kepada instansi terkait.","Mengkoordinasikan pelaksanaan ronda malam dan kegiatan keamanan lingkungan.","Memfasilitasi mediasi konflik sosial berskala kelurahan."]}];o.forEach(g=>{g.updatedAt||(g.updatedAt=new Date().toISOString())}),U.set(x,o)}function v(){return na(),U.get(x,[])}function G(u){U.set(x,u)}function ia(u){return v().find(o=>o.slug===u)||null}async function ea(u){const g={"unit-lurah":"lurah","unit-sekretariat":"sekretariat","unit-tata-pemerintahan":"tata-pemerintahan","unit-pemberdayaan":"pemberdayaan","unit-ketertiban":"ketertiban"}[u];if(!g)return;let M=[];try{const s=await fetch("/api/public/unit-kerja",{credentials:"include"});s.ok&&(M=await s.json())}catch(s){console.error("Gagal memuat data unit kerja:",s)}const e=M.find(s=>s.jenis===g);if(!e)return;const d={id:e.id,slug:e.jenis,unitName:e.nama_unit,name:e.nama_pimpinan,position:e.jabatan_pimpinan,nip:e.nip_pimpinan||"-",email:e.email,phone:e.kontak,photo:e.foto_pimpinan?"/storage/"+e.foto_pimpinan:"assets/images/avatar-placeholder.svg",pendidikan:e.pendidikan_pimpinan||"-",riwayat:typeof e.riwayat_jabatan=="string"?e.riwayat_jabatan.split(/\r?\n/).map(s=>s.trim()).filter(Boolean):Array.isArray(e.riwayat_jabatan)?e.riwayat_jabatan:[],tugas:typeof e.tugas=="string"?e.tugas.split(/\r?\n/).map(s=>s.trim()).filter(Boolean):Array.isArray(e.tugas)?e.tugas:[],kewenangan:typeof e.kewenangan=="string"?e.kewenangan.split(/\r?\n/).map(s=>s.trim()).filter(Boolean):Array.isArray(e.kewenangan)?e.kewenangan:[],tim_pegawai:Array.isArray(e.tim_pegawai)?e.tim_pegawai:typeof e.tim_pegawai=="string"?JSON.parse(e.tim_pegawai):[]},S=document.getElementById("unitProfil"),D=document.getElementById("unitTugas"),E=document.getElementById("unitKewenangan"),C=document.getElementById("unitTimSection"),z=document.querySelector(".page-title"),O=document.querySelector(".page-lead");if(z&&d.unitName&&(z.textContent=d.unitName),O&&g==="sekretariat"&&(O.textContent="Sekretariat Kelurahan bertugas memberikan pelayanan administratif dan teknis kepada seluruh perangkat kelurahan."),S&&(S.innerHTML=`
        <div class="card unit-card">
          <div class="card-body">
            <div class="unit-leader">
              <div class="unit-leader-photo">
                <img src="${d.photo||"assets/images/avatar-placeholder.svg"}" alt="${d.name||""}">
              </div>
              <div class="unit-leader-main">
                <h3 class="unit-leader-name">${d.name||"-"}</h3>
                <p class="unit-leader-position">${d.position||""}</p>
 
                <div class="unit-leader-meta">
                  <div class="meta-item">
                    <i class="fa-regular fa-id-card" aria-hidden="true"></i>
                    <span>NIP: ${d.nip||"-"}</span>
                  </div>
                  <div class="meta-item">
                    <i class="fa-regular fa-envelope" aria-hidden="true"></i>
                    <span>${d.email||"-"}</span>
                  </div>
                </div>
 
                <div class="unit-leader-meta">
                  <div class="meta-item">
                    <i class="fa-solid fa-graduation-cap" aria-hidden="true"></i>
                    <span>${d.pendidikan||""}</span>
                  </div>
                  <div class="meta-item">
                    <i class="fa-solid fa-phone" aria-hidden="true"></i>
                    <span>${d.phone||"-"}</span>
                  </div>
                </div>
              </div>
            </div>
 
            <div class="unit-history">
              <h4>Riwayat Jabatan:</h4>
              <ul class="bullets">
                ${(d.riwayat||[]).map(s=>`
                  <li>
                    <i class="fa-solid fa-check" aria-hidden="true"></i>
                    <span>${s}</span>
                  </li>`).join("")}
              </ul>
            </div>
          </div>
        </div>`),D&&(D.innerHTML=`
        <div class="card">
          <div class="card-body">
            <h3 class="section-title-sm">Tugas Pokok dan Fungsi</h3>
            <ul class="bullets">
              ${(d.tugas||[]).map(s=>`
                <li>
                  <i class="fa-solid fa-check" aria-hidden="true"></i>
                  <span>${s}</span>
                </li>`).join("")}
            </ul>
          </div>
        </div>`),E&&(E.innerHTML=`
        <div class="card">
          <div class="card-body">
            <h3 class="section-title-sm">Kewenangan</h3>
            <ul class="bullets">
              ${(d.kewenangan||[]).map(s=>`
                <li>
                  <i class="fa-solid fa-check" aria-hidden="true"></i>
                  <span>${s}</span>
                </li>`).join("")}
            </ul>
          </div>
        </div>`),C){const s=Array.isArray(d.tim_pegawai)?d.tim_pegawai:[];s.length>0?C.innerHTML=`
                    <h2 class="section-title">Tim ${d.unitName||""}</h2>
                    <div class="card">
                        <div class="card-body">
                            <div class="table-wrapper">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Nama</th>
                                            <th>Jabatan</th>
                                            <th>NIP</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${s.map(F=>`
                                            <tr>
                                                <td data-label="Nama"><b>${F.nama||"-"}</b></td>
                                                <td data-label="Jabatan">${F.jabatan||"-"}</td>
                                                <td data-label="NIP">${F.nip||"-"}</td>
                                            </tr>
                                        `).join("")}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `:C.innerHTML=""}}function ra(){if(!W.requireAdmin||!W.requireAdmin())return;const u=document.getElementById("ukTable"),o=document.getElementById("ukFormCard");if(u&&o){let J=function(){h&&h.reset(),y&&(y.value=""),c&&(c.textContent="Tambah Unit Kerja");const n=String((i==null?void 0:i.value)||"all");f&&n!=="all"&&(f.value=n)},Y=function(n){n&&(c&&(c.textContent="Update Unit Kerja"),y&&(y.value=n.id||n.slug||""),f&&(f.value=n.slug||""),B&&(B.value=n.unitName||""),A&&(A.value=n.name||""),K&&(K.value=n.position||""),j&&(j.value=n.phone||""),L&&(L.value=n.email||""),N&&(N.value=n.alamat||""),T&&(T.value=Array.isArray(n.tugas)?n.tugas.join(`
`):""),_&&(_.value=Array.isArray(n.kewenangan)?n.kewenangan.join(`
`):""))},P=function(){if(!k)return;const n=String((m==null?void 0:m.value)||"").trim().toLowerCase(),l=String((i==null?void 0:i.value)||"all");let p=v();l!=="all"&&(p=p.filter(t=>String(t.slug)===l)),n&&(p=p.filter(t=>`${t.slug||""} ${t.unitName||""} ${t.name||""} ${t.position||""} ${t.phone||""} ${t.email||""}`.toLowerCase().includes(n))),p=p.slice().sort((t,b)=>String(b.updatedAt||"").localeCompare(String(t.updatedAt||""))),k.innerHTML=p.map(t=>`
              <tr>
                <td>
                  <div style="font-weight:1000">${t.unitName||"-"}</div>
                  <div class="muted" style="font-size:12px">${t.slug||""}</div>
                </td>
                <td>
                  <div style="font-weight:900">${t.name||"-"}</div>
                  <div class="muted" style="font-size:12px">${t.position||""}</div>
                </td>
                <td>
                  <div>${t.phone||"-"}</div>
                  <div class="muted" style="font-size:12px">${t.email||""}</div>
                </td>
                <td>${ta(t.updatedAt)}</td>
                <td class="text-right">
                  <button class="btn btn-ghost btn-sm" type="button" data-action="editUk" data-id="${t.id}">
                    <i class="fa-solid fa-pen" aria-hidden="true"></i> Edit
                  </button>
                </td>
              </tr>`).join("")||'<tr><td colspan="5" class="muted">Belum ada data unit kerja.</td></tr>'},Q=function(){J(),q(!0)},X=function(n){const l=v().find(p=>String(p.id)===String(n))||null;l&&(h&&h.reset(),Y(l),q(!0))},H=function(){q(!1)};var C=J,z=Y,S=P,O=Q,s=X,F=H;const k=u.querySelector("tbody"),r=document.getElementById("ukRefreshBtn"),a=document.getElementById("ukAddBtn"),i=document.getElementById("ukFilterJenis"),m=document.getElementById("ukSearch"),c=document.getElementById("ukFormTitle"),w=document.getElementById("ukFormClose"),I=document.getElementById("ukFormCancel"),h=document.getElementById("ukForm"),y=document.getElementById("ukId"),f=document.getElementById("ukJenis"),B=document.getElementById("ukNamaUnit"),A=document.getElementById("ukNamaPimpinan"),K=document.getElementById("ukJabatanPimpinan"),j=document.getElementById("ukKontak"),L=document.getElementById("ukEmail"),N=document.getElementById("ukAlamat"),T=document.getElementById("ukTugas"),_=document.getElementById("ukKewenangan"),q=n=>{o.hidden=!n,n&&o.scrollIntoView({behavior:"smooth",block:"start"})},V=n=>String(n||"").split(/\r?\n/).map(l=>l.trim()).filter(Boolean),ta=n=>{const l=n?new Date(n):null;return!l||isNaN(l.getTime())?"-":l.toLocaleString("id-ID",{year:"numeric",month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit"})};a==null||a.addEventListener("click",Q),r==null||r.addEventListener("click",P),i==null||i.addEventListener("change",()=>{P();const n=String(i.value||"all");!o.hidden&&f&&n!=="all"&&(f.value=n)}),m==null||m.addEventListener("input",P),w==null||w.addEventListener("click",H),I==null||I.addEventListener("click",H),u.addEventListener("click",n=>{var p,t;const l=(t=(p=n.target).closest)==null?void 0:t.call(p,"[data-action='editUk']");l&&X(l.dataset.id)}),h==null||h.addEventListener("submit",n=>{n.preventDefault();const l=String((f==null?void 0:f.value)||"").trim(),p=String((B==null?void 0:B.value)||"").trim();if(!l||!p){alert("Jenis Unit dan Nama Unit wajib diisi.");return}const t=String((y==null?void 0:y.value)||l).trim()||l,b=v(),R=b.findIndex(aa=>String(aa.id)===t||String(aa.slug)===l),$=R>=0?b[R]:{},Z={...$,id:t,slug:l,unitName:p,name:String((A==null?void 0:A.value)||"").trim(),position:String((K==null?void 0:K.value)||"").trim(),phone:String((j==null?void 0:j.value)||"").trim(),email:String((L==null?void 0:L.value)||"").trim(),alamat:String((N==null?void 0:N.value)||"").trim(),tugas:V(T==null?void 0:T.value),kewenangan:V(_==null?void 0:_.value),riwayat:Array.isArray($.riwayat)?$.riwayat:[],nip:$.nip||"",photo:$.photo||"",pendidikan:$.pendidikan||"",updatedAt:new Date().toISOString()};R>=0?b[R]=Z:b.unshift(Z),G(b),P(),H()}),P(),q(!1);return}const g=document.getElementById("unitSearch"),M=document.getElementById("unitTbody"),e=document.getElementById("unitForm"),d=document.getElementById("unitModal");if(!M||!e||!d)return;function S(){const k=(g&&g.value?g.value:"").toLowerCase();let r=v();k&&(r=r.filter(a=>`${a.name} ${a.unitName} ${a.position}`.toLowerCase().includes(k))),M.innerHTML=r.map(a=>`
          <tr>
            <td>
              <b>${a.name||"-"}</b>
              <div class="muted" style="font-size:12px">${a.position||"-"}</div>
            </td>
            <td>${a.unitName||"-"}</td>
            <td>${a.nip||"-"}</td>
            <td>
              <div>${a.email||"-"}</div>
              <div class="muted" style="font-size:12px">${a.phone||""}</div>
            </td>
            <td>
              <button class="btn btn-ghost" type="button" data-action="edit-unit" data-id="${a.id}">
                <i class="fa-solid fa-pen"></i> Edit
              </button>
            </td>
          </tr>`).join("")||'<tr><td colspan="5" class="empty">Belum ada data unit kerja.</td></tr>'}function D(k){const a=v().find(m=>m.id===k)||null;d.classList.add("open");const i=(m,c)=>{const w=document.getElementById(m);w&&(w.value=c||"")};i("fId",a?a.id:""),i("fSlug",a?a.slug:""),i("fUnitName",a?a.unitName:""),i("fName",a?a.name:""),i("fPosition",a?a.position:""),i("fNip",a?a.nip:""),i("fEmail",a?a.email:""),i("fPhone",a?a.phone:""),i("fPhoto",a?a.photo:""),i("fPendidikan",a?a.pendidikan:"")}function E(){d.classList.remove("open")}g&&g.addEventListener("input",S),M.addEventListener("click",k=>{const r=k.target.closest("[data-action='edit-unit']");if(!r)return;const a=r.dataset.id;D(a)}),e.addEventListener("submit",k=>{k.preventDefault();const r=h=>{const y=document.getElementById(h);return y&&y.value?y.value.trim():""},a=r("fSlug")||r("fId")||"unit-"+Date.now(),i=r("fId")||a,m=v(),c=m.findIndex(h=>h.id===i),I={...c>=0?m[c]:{},id:i,slug:a,unitName:r("fUnitName"),name:r("fName"),position:r("fPosition"),nip:r("fNip"),email:r("fEmail"),phone:r("fPhone"),photo:r("fPhoto"),pendidikan:r("fPendidikan"),updatedAt:new Date().toISOString()};c>=0?m[c]=I:m.push(I),G(m),S(),E()}),document.addEventListener("click",k=>{k.target.closest("[data-action='closeUnitModal']")&&E(),k.target===d&&E()}),S()}window.addEventListener("page:loaded",u=>{const o=u.detail&&u.detail.name?u.detail.name:"";o!=="admin/unit-kerja"&&(o==="unit-lurah"||o==="unit-sekretariat"||o==="unit-tata-pemerintahan"||o==="unit-pemberdayaan"||o==="unit-ketertiban")&&ea(o)})})();

