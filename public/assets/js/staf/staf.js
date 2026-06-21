var $;const csrfToken=($=document.querySelector('meta[name="csrf-token"]'))==null?void 0:$.content;async function initStafDashboardLaravel(){const t=await(await fetch("/api/staf/dashboard")).json(),i=document.getElementById("metricSuratMenunggu"),n=document.getElementById("metricPengaduanAktif"),l=document.getElementById("metricTotalPengajuan");i&&(i.textContent=t.surat_menunggu),n&&(n.textContent=t.pengaduan_aktif),l&&(l.textContent=t.total_pengajuan);const o=document.getElementById("listSuratMenunggu");o&&(o.innerHTML=t.surat_terbaru.map(d=>{var a,s;return`

                <div class="stack-item">

                    <strong>
                        ${d.jenis_surat}
                    </strong>

                    <div class="muted">

                        ${(s=(a=d.user)==null?void 0:a.name)!=null?s:"-"}

                    </div>

                </div>

            `}).join(""));const r=document.getElementById("listPengaduanTerbaru");r&&(r.innerHTML=t.pengaduan_terbaru.map(d=>{var a,s;return`

                <div class="stack-item">

                    <strong>
                        ${d.judul}
                    </strong>

                    <div class="muted">

                        ${(s=(a=d.user)==null?void 0:a.name)!=null?s:"-"}

                    </div>

                </div>

            `}).join(""))}function fmtDate(e){return e?new Date(e).toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"}):"-"}function statusBadge(e){const t=String(e||"").toLowerCase(),i={menunggu:"badge-wait",diproses:"badge-proses",selesai:"badge-done",siap_diambil:"badge-done",ditolak:"badge-reject"},n={menunggu:"Menunggu",diproses:"Diproses",selesai:"Selesai",ditolak:"Ditolak",siap_diambil:"Siap Diambil"},l=i[t]||"badge-neutral",o=n[t]||e;return`
        <span class="badge ${l}">
            ${o}
        </span>
    `}const esc=e=>String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"),fmtSize=e=>{if(!e)return"0 B";const t=1024,i=["B","KB","MB","GB"],n=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,n)).toFixed(1))+" "+i[n]};let currentDetailSurat=null;async function openStafSuratDetail(e){var t,i,n,l,o,r;try{const a=await(await fetch(`/api/staf/surat/${e}`,{headers:{Accept:"application/json"}})).json();if(!a)return;currentDetailSurat=a;const s=document.getElementById("suratDetailModal"),c=document.getElementById("suratDetailTitle"),m=document.getElementById("suratDetailSub"),h=document.getElementById("suratDetailBody");c&&(c.textContent=a.jenis_surat||"Detail Surat"),m&&(m.textContent=`ID Pengajuan #${a.id}`);const x=Array.isArray(a.berkas)?a.berkas:[];let y="Menunggu Validasi",w="badge-wait";a.status==="diproses"?(y="Sedang Diproses",w="badge-proses"):a.status==="selesai"?(y="Selesai",w="badge-done"):a.status==="siap_diambil"?(y="Siap Diambil",w="badge-done"):a.status==="ditolak"&&(y="Ditolak",w="badge-reject");let f="";const g=a.data_surat&&typeof a.data_surat=="object"?a.data_surat:{},u=["user_id","nama","nik","telp","rt","rw","alamat","keperluan"],b=Object.entries(g).filter(([p])=>!u.includes(p));b.length>0&&(f=`
            <div style="margin-top: 18px; padding-top: 14px; border-top: 1px dashed var(--border);">
              <h5 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 1000; color: var(--primary);">Detail Form Pengajuan</h5>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px;">
                ${b.map(([p,k])=>{const E=p.replace(/_/g," ").replace(/\b\w/g,B=>B.toUpperCase());let v="";return typeof k=="string"&&k.startsWith("data:image/")?v=`<img src="${k}" style="max-width:100%; max-height:150px; border-radius:8px; display:block; margin-top:4px; border:1px solid var(--border);" />`:typeof k=="string"&&k.startsWith("data:application/pdf")?v=`<a href="${k}" target="_blank" class="btn btn-light btn-sm" style="margin-top:4px; font-weight:bold; font-size:11px; padding:4px 8px; border:1px solid var(--border); border-radius:6px; display:inline-flex; align-items:center; gap:4px;"><i class="fa-solid fa-file-pdf" style="color:#ef4444;"></i> Buka Dokumen PDF</a>`:v=`<div style="font-weight: 1000; margin-top: 4px; color: var(--text);">${esc(k)}</div>`,`
                      <div>
                        <label style="font-size: 11px; color: var(--muted); font-weight: 900; text-transform: uppercase;">${esc(E)}</label>
                        ${v}
                      </div>
                    `}).join("")}
              </div>
            </div>
            `);let S=`
<div class="surat-detail-grid" style="display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start;">
  <!-- LEFT COLUMN -->
  <div style="display: flex; flex-direction: column; gap: 20px;">
    <!-- Data Pemohon Card -->
    <div class="card" style="box-shadow: var(--shadow); border: 1px solid var(--border); border-radius: 14px; background: #fff;">
      <div class="card-body" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h4 style="margin: 0; font-size: 16px; font-weight: 1000;">Data Pemohon</h4>
          <span class="badge ${w}">${y}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px 20px;">
          <div>
            <label style="font-size: 11px; color: var(--muted); font-weight: 900; text-transform: uppercase;">Nama Lengkap</label>
            <div style="font-weight: 1000; margin-top: 4px; color: var(--text);">${esc(((t=a.user)==null?void 0:t.name)||"-")}</div>
          </div>
          <div>
            <label style="font-size: 11px; color: var(--muted); font-weight: 900; text-transform: uppercase;">NIK</label>
            <div style="font-weight: 1000; margin-top: 4px; color: var(--text);">${esc(((i=a.user)==null?void 0:i.nik)||"-")}</div>
          </div>
          <div>
            <label style="font-size: 11px; color: var(--muted); font-weight: 900; text-transform: uppercase;">No. Telepon</label>
            <div style="font-weight: 1000; margin-top: 4px; color: var(--text);">${esc(((n=a.user)==null?void 0:n.telp)||"-")}</div>
          </div>
          <div>
            <label style="font-size: 11px; color: var(--muted); font-weight: 900; text-transform: uppercase;">Tanggal Pengajuan</label>
            <div style="font-weight: 1000; margin-top: 4px; color: var(--text);">${fmtDate(a.created_at)}</div>
          </div>
          <div style="grid-column: span 2;">
            <label style="font-size: 11px; color: var(--muted); font-weight: 900; text-transform: uppercase;">Alamat</label>
            <div style="font-weight: 1000; margin-top: 4px; color: var(--text);">${esc(((l=a.user)==null?void 0:l.alamat)||"-")}, RT ${esc(((o=a.user)==null?void 0:o.rt)||"-")}/RW ${esc(((r=a.user)==null?void 0:r.rw)||"-")}</div>
          </div>
          <div style="grid-column: span 2;">
            <label style="font-size: 11px; color: var(--muted); font-weight: 900; text-transform: uppercase;">Keperluan</label>
            <div style="font-weight: 1000; margin-top: 4px; color: var(--text);">${esc(a.keperluan||"-")}</div>
          </div>
        </div>
        ${f}
      </div>
    </div>
    
    <!-- Berkas Lampiran Section -->
    <div>
      <h4 style="margin: 0 0 12px; font-size: 16px; font-weight: 1000;">Berkas Lampiran (${x.length})</h4>
      ${x.length===0?`
        <div class="muted" style="padding: 12px; background: rgba(148, 163, 184, 0.05); border: 1px dashed var(--border); border-radius: 12px;">
          Tidak ada berkas persyaratan yang diunggah.
        </div>
      `:`
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px;">
          ${x.map(p=>{const E=((p.mime||"").startsWith("image/")||(p.fileName||"").match(/\.(jpg|jpeg|png|webp|gif)$/i))&&p.dataUrl?p.dataUrl:"";let v="";E?v=`<img src="${E}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 10px 10px 0 0;" />`:v=`
                <div style="width: 100%; height: 120px; background: rgba(148, 163, 184, 0.1); border-radius: 10px 10px 0 0; display: flex; align-items: center; justify-content: center;">
                  <i class="fa-solid fa-file-pdf" style="font-size: 48px; color: #ef4444;"></i>
                </div>
              `;const B=p.dataUrl?`href="${p.dataUrl}" target="_blank"`:`href="#" onclick="alert('File tidak dapat dibuka karena ukuran melebihi batas demo.'); return false;"`,I=p.dataUrl?`href="${p.dataUrl}" download="${esc(p.fileName)}"`:`href="#" onclick="alert('File tidak dapat didownload karena ukuran melebihi batas demo.'); return false;"`;return`
              <div class="card" style="box-shadow: var(--shadow-sm); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; background: #fff;">
                ${v}
                <div style="padding: 10px; display: flex; flex-direction: column; flex: 1; min-height: 80px;">
                  <div style="font-weight: 1000; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${esc(p.fileName)}">${esc(p.fileName||"-")}</div>
                  <div style="font-size: 11px; color: var(--muted); margin-top: 4px; font-weight: 700;">${esc(p.requirement||"Berkas")}</div>
                  <div style="font-size: 11px; color: var(--muted); margin-top: 2px;">${fmtSize(p.size)}</div>
                  
                  <div style="margin-top: auto; padding-top: 8px; display: flex; gap: 6px; justify-content: flex-end;">
                    <a class="btn btn-light btn-sm" ${B} style="padding: 4px 8px; border-radius: 6px; font-size: 12px; border: 1px solid var(--border); display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px;" title="Lihat">
                      <i class="fa-regular fa-eye"></i>
                    </a>
                    <a class="btn btn-light btn-sm" ${I} style="padding: 4px 8px; border-radius: 6px; font-size: 12px; border: 1px solid var(--border); display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px;" title="Unduh">
                      <i class="fa-solid fa-download"></i>
                    </a>
                  </div>
                </div>
              </div>
            `}).join("")}
        </div>
      `}
    </div>
  </div>
  
  <!-- RIGHT COLUMN -->
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <!-- Status & Timeline Card -->
    <div class="card" style="box-shadow: var(--shadow); border: 1px solid var(--border); border-radius: 14px; background: #fff;">
      <div class="card-body" style="padding: 16px;">
        <h4 style="margin: 0 0 14px; font-size: 14px; font-weight: 1000;">Status & Timeline</h4>
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: #22c55e; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">
            <i class="fa-solid fa-check"></i>
          </div>
          <div>
            <div style="font-weight: 1000; font-size: 13px;">Pengajuan Diterima</div>
            <div style="font-size: 11px; color: var(--muted); margin-top: 2px;">${fmtDate(a.created_at)}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Validasi Berkas Card -->
    <div class="card" style="box-shadow: var(--shadow); border: 1px solid var(--border); border-radius: 14px; background: #fff;">
      <div class="card-body" style="padding: 16px; display: flex; flex-direction: column; gap: 10px;">
        <h4 style="margin: 0 0 4px; font-size: 14px; font-weight: 1000;">Validasi Berkas</h4>
        <button class="btn btn-success accept-surat" data-id="${a.id}" style="width: 100%; border-radius: 12px; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 800; font-size: 13px; background: #22c55e; color: white; border: none; cursor: pointer; transition: transform 0.1s ease;">
          <i class="fa-solid fa-check-double"></i> Setujui & Proses
        </button>
        <button class="btn btn-danger reject-surat" data-id="${a.id}" style="width: 100%; border-radius: 12px; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 800; font-size: 13px; background: #ef4444; color: white; border: none; cursor: pointer; transition: transform 0.1s ease;">
          <i class="fa-solid fa-ban"></i> Tolak Pengajuan
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Chat link at the bottom -->
<div style="margin-top: 20px;">
  <a href="#staf/chat" data-page="staf/chat" class="card" style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); border-radius: 12px; text-decoration: none; font-weight: 800; color: var(--primary); background: #fff; transition: background 0.15s ease;">
    <i class="fa-regular fa-comment-dots" style="font-size: 18px;"></i> Chat dengan Warga
  </a>
</div>

${a.status!=="selesai"&&a.status!=="ditolak"?`
<!-- Upload Surat Button in Detail -->
<div style="margin-top: 12px;">
  <button class="btn btn-success open-kirim-surat-from-detail" data-id="${a.id}" style="width: 100%; border-radius: 12px; padding: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 800; font-size: 13px; background: #16a34a; color: white; border: none; cursor: pointer;">
    <i class="fa-solid fa-paper-plane"></i> Upload & Kirim Surat ke Warga
  </button>
</div>
`:""}

${a.file_surat?`
<!-- Download Link -->
<div style="margin-top: 12px;">
  <a href="/storage/${a.file_surat}" target="_blank" class="card" style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; box-shadow: var(--shadow-sm); border: 2px solid rgba(34,197,94,.22); border-radius: 12px; text-decoration: none; font-weight: 800; color: #16a34a; background: rgba(34,197,94,.04); transition: background 0.15s ease;">
    <i class="fa-solid fa-file-pdf" style="font-size: 18px;"></i> Download Surat (PDF)
  </a>
</div>
`:""}
        `;h&&(h.innerHTML=S),s&&(s.classList.add("open"),s.setAttribute("aria-hidden","false"))}catch(d){console.error("Gagal memuat detail surat:",d)}}async function updateStafSuratStatus(e,t){try{if(!(await fetch(`/api/staf/surat/${e}/status`,{method:"PUT",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":csrfToken,Accept:"application/json"},body:JSON.stringify({status:t})})).ok)throw new Error("Gagal memperbarui status surat");alert(`Status surat berhasil diperbarui ke ${t}`);const n=document.getElementById("suratDetailModal");n&&(n.classList.remove("open"),n.setAttribute("aria-hidden","true")),initStafSuratLaravel()}catch(i){console.error(i),alert("Gagal memperbarui status surat")}}async function initStafSuratLaravel(){const e=document.getElementById("suratTbody"),t=document.getElementById("suratFilter"),i=document.getElementById("suratSearch");if(!e)return;let n=[];async function l(){try{n=await(await fetch("/api/staf/surat")).json(),o()}catch(r){console.error(r)}}function o(){const r=((i==null?void 0:i.value)||"").toLowerCase();let d=n;r&&(d=d.filter(s=>{var m;return`${((m=s.user)==null?void 0:m.name)||""} ${s.jenis_surat||""} ${s.keperluan||""}`.toLowerCase().includes(r)}));const a=document.getElementById("suratEmpty");a&&(a.style.display=d.length?"none":"block"),e.innerHTML=d.map(s=>{var c,m,h,x,y,w;return`
            <tr>
                <td>${fmtDate(s.created_at)}</td>

                <td>${(m=(c=s.user)==null?void 0:c.name)!=null?m:"-"}</td>

                <td>${(x=(h=s.user)==null?void 0:h.rt)!=null?x:"-"}/${(w=(y=s.user)==null?void 0:y.rw)!=null?w:"-"}</td>

                <td>${s.jenis_surat}</td>

                <td>${s.keperluan}</td>

                <td>${statusBadge(s.status)}</td>

                <td>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
                        <button
                            class="btn btn-primary btn-sm view-surat-detail"
                            data-id="${s.id}"
                            style="padding: 6px 10px; border-radius: 8px; font-weight: 800; font-size: 12px; border: none; cursor: pointer; color: white;"
                        >
                            <i class="fa-solid fa-eye"></i> Detail
                        </button>

                        <select
                            class="surat-status"
                            data-id="${s.id}"
                            style="padding: 6px; border-radius: 6px; border: 1px solid var(--border); background: #fff;"
                        >
                            <option value="menunggu" ${s.status==="menunggu"?"selected":""}>Menunggu</option>
                            <option value="diproses" ${s.status==="diproses"?"selected":""}>Diproses</option>
                            <option value="selesai" ${s.status==="selesai"?"selected":""}>Selesai</option>
                            <option value="ditolak" ${s.status==="ditolak"?"selected":""}>Ditolak</option>
                        </select>

                        <button
                            class="btn save-surat"
                            data-id="${s.id}"
                            style="padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 12px; background: var(--primary); color: white; border: none; cursor: pointer;">
                            Simpan
                        </button>

                        <button
                            class="btn btn-success btn-sm open-kirim-surat"
                            data-id="${s.id}"
                            style="padding: 6px 10px; border-radius: 8px; font-weight: 800; font-size: 12px; background: #16a34a; color: #fff; border: none; cursor: pointer;"
                            title="Upload & Kirim Surat ke Warga"
                        >
                            <i class="fa-solid fa-paper-plane"></i> Kirim Surat
                        </button>
                        ${s.file_surat?`
                        <a href="/storage/${s.file_surat}" target="_blank" class="btn btn-primary btn-sm" style="padding: 6px 10px; border-radius: 8px; font-weight: 800; font-size: 12px; text-decoration: none; display: flex; align-items: center; gap: 4px; background: #2563eb; color: white; border: none;">
                            <i class="fa-solid fa-download"></i> Download
                        </a>`:""}
                        <button
                            class="btn btn-danger btn-sm delete-surat"
                            data-id="${s.id}"
                            style="padding: 6px 10px; border-radius: 8px; font-weight: 800; font-size: 12px; background: #dc2626; color: white; border: none; cursor: pointer;"
                            title="Hapus Surat"
                        >
                            <i class="fa-solid fa-trash"></i> Hapus
                        </button>
                    </div>
                </td>
            </tr>
        `}).join("")}i&&i.addEventListener("input",o),await l(),window._refreshStafSurat=l}document.addEventListener("click",async e=>{var a;const t=e.target.closest(".view-surat-detail");if(t){const s=t.dataset.id;openStafSuratDetail(s);return}const i=e.target.closest(".open-kirim-surat");if(i){const s=i.dataset.id;openKirimSuratModal(s);return}const n=e.target.closest(".delete-surat");if(n){const s=n.dataset.id;if(confirm("Hapus surat ini? Aksi ini tidak dapat dibatalkan.")){const c=(a=document.querySelector('meta[name="csrf-token"]'))==null?void 0:a.content;try{if(!(await fetch(`/api/staf/surat/${s}`,{method:"DELETE",headers:{"X-CSRF-TOKEN":c,Accept:"application/json"}})).ok)throw new Error("Gagal menghapus surat");typeof window._refreshStafSurat=="function"&&window._refreshStafSurat()}catch(m){alert(m.message)}}return}const l=e.target.closest(".open-kirim-surat-from-detail");if(l){const s=l.dataset.id,c=document.getElementById("suratDetailModal");c&&(c.classList.remove("open"),c.setAttribute("aria-hidden","true")),openKirimSuratModal(s);return}if(e.target.closest("[data-action='closeModal']")){document.activeElement&&document.activeElement.closest(".modal")&&document.activeElement.blur();const s=document.getElementById("suratDetailModal");s&&(s.classList.remove("open"),s.setAttribute("aria-hidden","true"));const c=document.getElementById("kirimSuratModal");c&&(c.classList.remove("open"),c.setAttribute("aria-hidden","true"));return}const o=e.target.closest(".btn-staf-review");if(o){const s=o.dataset.id;openStafPengaduanDetail(s);return}const r=e.target.closest(".accept-surat");if(r){const s=r.dataset.id;confirm("Setujui dan proses pengajuan surat ini?")&&(await updateStafSuratStatus(s,"diproses"),currentDetailSurat&&String(currentDetailSurat.id)===String(s)&&(sessionStorage.setItem("prefill_surat",JSON.stringify(currentDetailSurat)),window.navigateTo?window.navigateTo("staf/buat-surat"):window.location.hash="#staf/buat-surat"));return}const d=e.target.closest(".reject-surat");if(d){const s=d.dataset.id;confirm("Tolak pengajuan surat ini?")&&await updateStafSuratStatus(s,"ditolak");return}});function openKirimSuratModal(e){const t=document.getElementById("kirimSuratModal"),i=document.getElementById("kirimSuratId"),n=document.getElementById("kirimSuratFile"),l=document.getElementById("kirimSuratNote");!t||!i||(i.value=e,n&&(n.value=""),l&&(l.value=""),t.classList.add("open"),t.setAttribute("aria-hidden","false"))}document.addEventListener("submit",async e=>{var a,s,c;if(!e.target.matches("#kirimSuratForm"))return;e.preventDefault();const t=e.target,i=(a=document.getElementById("kirimSuratId"))==null?void 0:a.value,n=document.getElementById("kirimSuratFile"),l=t.querySelector('button[type="submit"]');if(!i||!((s=n==null?void 0:n.files)!=null&&s.length)){alert("Silakan pilih file PDF terlebih dahulu.");return}const o=(c=document.querySelector('meta[name="csrf-token"]'))==null?void 0:c.content,r=new FormData;r.append("file_surat",n.files[0]);const d=l.innerHTML;l.disabled=!0,l.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Mengunggah...';try{const m=await fetch(`/api/staf/surat/${i}/upload-hasil`,{method:"POST",headers:{"X-CSRF-TOKEN":o,Accept:"application/json"},body:r});if(!m.ok){const x=await m.json().catch(()=>({}));throw new Error(x.message||`HTTP error! status: ${m.status}`)}alert("Surat berhasil dikirim ke warga!");const h=document.getElementById("kirimSuratModal");h&&(h.classList.remove("open"),h.setAttribute("aria-hidden","true")),typeof window._refreshStafSurat=="function"?window._refreshStafSurat():initStafSuratLaravel()}catch(m){console.error("Upload surat gagal:",m),alert("Gagal mengirim surat: "+m.message)}finally{l.disabled=!1,l.innerHTML=d}}),document.addEventListener("click",async e=>{if(!e.target.classList.contains("save-pengumuman"))return;const t=e.target.dataset.id,i=document.querySelector(`.pengumuman-status[data-id="${t}"]`).value;await fetch("/api/public/pengumuman",{method:"GET"}),alert("Fitur manajemen pengumuman hanya untuk admin")}),document.addEventListener("click",async e=>{var l;if(!e.target.classList.contains("save-surat"))return;const t=e.target.dataset.id,i=document.querySelector(`.surat-status[data-id="${t}"]`).value,n=(l=document.querySelector('meta[name="csrf-token"]'))==null?void 0:l.content;try{if(!(await fetch(`/api/staf/surat/${t}/status`,{method:"PUT",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":n,Accept:"application/json"},body:JSON.stringify({status:i})})).ok)throw new Error("Gagal menyimpan status surat");alert("Status surat berhasil diperbarui"),initStafSuratLaravel()}catch(o){console.error(o),alert("Gagal menyimpan status surat")}}),document.addEventListener("click",async e=>{if(!e.target.classList.contains("save-pengaduan"))return;const t=e.target.dataset.id,i=document.querySelector(`.pengaduan-status[data-id="${t}"]`).value;try{if(!(await fetch(`/api/staf/pengaduan/${t}/status`,{method:"PUT",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":csrfToken,Accept:"application/json"},body:JSON.stringify({status:i})})).ok)throw new Error("Gagal menyimpan status pengaduan");alert("Status pengaduan berhasil diperbarui"),initStafPengaduanLaravel()}catch(n){console.error(n),alert("Gagal menyimpan status pengaduan")}});async function openStafPengaduanDetail(e){var t;try{const n=await(await fetch(`/api/staf/pengaduan/${e}`,{headers:{Accept:"application/json"}})).json();if(!n)return;document.getElementById("stafDetailPelapor").textContent=((t=n.user)==null?void 0:t.name)||"-",document.getElementById("stafDetailJudul").textContent=n.judul||"-",document.getElementById("stafDetailKategori").textContent=n.kategori||"-",document.getElementById("stafDetailTanggal").textContent=fmtDate(n.created_at),document.getElementById("stafDetailLokasi").textContent=n.lokasi||"-",document.getElementById("stafDetailIsi").textContent=n.isi||"",document.getElementById("stafDetailStatus").innerHTML=statusBadge(n.status),document.getElementById("stafModalId").value=n.id,document.getElementById("stafModalStatus").value=n.status;const l=document.getElementById("stafModalFotoTindakLanjut");l&&(l.value="");const o=document.getElementById("stafModalFotoPreview");o&&(n.foto_tindak_lanjut?(o.src=n.foto_tindak_lanjut.startsWith("data:")||n.foto_tindak_lanjut.startsWith("http")?n.foto_tindak_lanjut:"/storage/"+n.foto_tindak_lanjut,o.style.display="block"):(o.src="",o.style.display="none"));const r=document.getElementById("stafDetailImg"),d=document.getElementById("stafDetailPdf"),a=document.getElementById("stafDetailNoLampiran");if(r&&d&&a)if(r.style.display="none",d.style.display="none",a.style.display="none",n.lampiran){const s=n.lampiran.startsWith("data:")||n.lampiran.startsWith("http")?n.lampiran:"/storage/"+n.lampiran;n.lampiran.toLowerCase().endsWith(".pdf")?(d.href=s,d.style.display="inline-block"):(r.src=s,r.style.display="block")}else a.style.display="inline";document.getElementById("stafPengaduanDetailModal").classList.add("open")}catch(i){console.error("Gagal memuat detail pengaduan:",i)}}async function initStafPengaduanLaravel(){const e=document.getElementById("pengaduanTbody");if(!e)return;const i=await(await fetch("/api/staf/pengaduan")).json();e.innerHTML=i.map(o=>{var r,d;return`
        <tr>

            <td>${fmtDate(o.created_at)}</td>

            <td>${(d=(r=o.user)==null?void 0:r.name)!=null?d:"-"}</td>

            <td>${o.judul}</td>

            <td>${statusBadge(o.status)}</td>

            <td>

                <select
                    class="pengaduan-status"
                    data-id="${o.id}"
                    style="padding: 6px; border-radius: 6px; border: 1px solid var(--border); background: #fff;"
                >
                    <option value="menunggu" ${o.status==="menunggu"?"selected":""}>Menunggu</option>
                    <option value="diproses" ${o.status==="diproses"?"selected":""}>Diproses</option>
                    <option value="selesai" ${o.status==="selesai"?"selected":""}>Selesai</option>
                    <option value="ditolak" ${o.status==="ditolak"?"selected":""}>Ditolak</option>
                </select>

                <button
                    class="btn btn-primary save-pengaduan"
                    data-id="${o.id}"
                    style="padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 12px; background: var(--primary); color: white; border: none; cursor: pointer;"
                >
                    Simpan
                </button>

                <button
                    class="btn btn-ghost btn-staf-review"
                    data-id="${o.id}"
                    style="margin-left: 5px; min-width: 60px; padding: 6px 12px; font-weight: 800; border-radius: 8px; cursor: pointer;"
                >
                    Review
                </button>

            </td>

        </tr>
    `}).join("");const n=document.getElementById("stafPengaduanStatusForm");n&&!n.dataset.listenerBound&&(n.dataset.listenerBound="true",n.addEventListener("submit",async o=>{var h,x;o.preventDefault();const r=document.getElementById("stafModalId").value,d=document.getElementById("stafModalStatus").value,a=document.getElementById("stafModalFotoTindakLanjut"),s=((h=a==null?void 0:a.files)==null?void 0:h[0])||null,c=n.querySelector("button[type='submit']"),m=c.innerHTML;c.disabled=!0,c.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';try{const y=new FormData;y.append("status",d),y.append("_method","PUT"),s&&y.append("foto_tindak_lanjut",s);const w=await fetch(`/api/staf/pengaduan/${r}/status`,{method:"POST",headers:{"X-CSRF-TOKEN":csrfToken,Accept:"application/json"},body:y});if(!w.ok){const f=await w.json().catch(()=>({}));throw new Error(f.message||"Gagal memperbarui tindak lanjut")}alert("Tindak lanjut pengaduan berhasil disimpan"),(x=document.getElementById("stafPengaduanDetailModal"))==null||x.classList.remove("open"),initStafPengaduanLaravel()}catch(y){console.error(y),alert("Gagal memperbarui tindak lanjut: "+y.message)}finally{c.disabled=!1,c.innerHTML=m}}));const l=document.getElementById("stafModalFotoTindakLanjut");if(l&&!l.dataset.listenerBound&&(l.dataset.listenerBound="true",l.addEventListener("change",o=>{const r=o.target.files[0],d=document.getElementById("stafModalFotoPreview");if(r&&d){const a=new FileReader;a.onload=s=>{d.src=s.target.result,d.style.display="block"},a.readAsDataURL(r)}})),!window._stafModalsBound){window._stafModalsBound=!0,document.addEventListener("click",d=>{var a,s;(d.target.closest("#closeStafPengaduanDetailBtn")||d.target.matches("#stafPengaduanDetailModal"))&&((a=document.getElementById("stafPengaduanDetailModal"))==null||a.classList.remove("open")),(d.target.closest("#closeStafImageZoomBtn")||d.target.matches("#stafImageZoomModal"))&&((s=document.getElementById("stafImageZoomModal"))==null||s.classList.remove("open"))});const o=document.getElementById("stafDetailImg");o&&(o.onclick=()=>{const d=document.getElementById("stafImageZoomModal"),a=document.getElementById("stafZoomedImg");d&&a&&(a.src=o.src,d.classList.add("open"))});const r=document.getElementById("stafModalFotoPreview");r&&(r.onclick=()=>{const d=document.getElementById("stafImageZoomModal"),a=document.getElementById("stafZoomedImg");d&&a&&(a.src=r.src,d.classList.add("open"))})}}function resetStafPengumumanForm(){document.getElementById("staf-pengumuman-id").value="";const e=document.getElementById("staf-pengumuman-form");e&&e.reset(),document.getElementById("staf-pengumuman-form-title").textContent="Tambah Pengumuman"}async function initStafPengumumanLaravel(){var a,s;const e=document.getElementById("staf-pengumuman-table-body");if(!e)return;const i=await(await fetch("/api/staf/pengumuman")).json(),n=(((a=document.getElementById("staf-pengumuman-search"))==null?void 0:a.value)||"").toLowerCase(),l=((s=document.getElementById("staf-pengumuman-status-filter"))==null?void 0:s.value)||"all",o=document.getElementById("staf-pengumuman-search"),r=document.getElementById("staf-pengumuman-status-filter");o&&!o.dataset.listenerBound&&(o.dataset.listenerBound="true",o.addEventListener("input",initStafPengumumanLaravel)),r&&!r.dataset.listenerBound&&(r.dataset.listenerBound="true",r.addEventListener("change",initStafPengumumanLaravel));let d=i;l!=="all"&&(d=d.filter(c=>(c.status||"info")===l)),n&&(d=d.filter(c=>(c.title||"").toLowerCase().includes(n)||(c.content||"").toLowerCase().includes(n))),e.innerHTML=d.map(c=>{var m,h;return`
<tr>
    <td><b>${(m=c.title)!=null?m:"-"}</b></td>
    <td>${fmtDate(c.date)||"-"}</td>
    <td>
        <span class="badge badge-cat-${c.status==="urgent"?"darurat":"info"}">
            ${((h=c.status)!=null?h:"info").toUpperCase()}
        </span>
    </td>
    <td>
        <button
            class="btn btn-warning btn-sm edit-pengumuman"
            data-id="${c.id}">
            Edit
        </button>
    </td>
</tr>
`}).join("")}async function savePengumumanLaravel(){const e=document.getElementById("staf-pengumuman-id").value,t=document.getElementById("staf-pengumuman-judul").value,i=document.getElementById("staf-pengumuman-tanggal").value,n=document.getElementById("staf-pengumuman-status").value,l=document.getElementById("staf-pengumuman-isi").value,o={title:t,date:i,status:n,content:l},r=document.querySelector("#staf-pengumuman-form button[type='submit']"),d=r?r.innerHTML:"Simpan";r&&(r.disabled=!0,r.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...');let a;try{if(e?a=await fetch(`/api/staf/pengumuman/${e}`,{method:"PUT",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":csrfToken,Accept:"application/json"},body:JSON.stringify(o)}):a=await fetch("/api/staf/pengumuman",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":csrfToken,Accept:"application/json"},body:JSON.stringify(o)}),!a.ok){const s=await a.json().catch(()=>({}));throw new Error(s.message||"Gagal menyimpan pengumuman")}alert("Pengumuman berhasil disimpan"),resetStafPengumumanForm(),initStafPengumumanLaravel()}catch(s){console.error(s),alert("Gagal menyimpan pengumuman: "+s.message)}finally{r&&(r.disabled=!1,r.innerHTML=d)}}document.addEventListener("click",async e=>{var i;const t=e.target.closest(".edit-pengumuman");if(t){const n=t.dataset.id;try{const l=await fetch(`/api/staf/pengumuman/${n}`,{headers:{Accept:"application/json"}});if(!l.ok)throw new Error("Gagal mengambil data pengumuman");const o=await l.json();document.getElementById("staf-pengumuman-id").value=o.id,document.getElementById("staf-pengumuman-judul").value=o.title||"",document.getElementById("staf-pengumuman-tanggal").value=o.date||"",document.getElementById("staf-pengumuman-status").value=o.status||"info",document.getElementById("staf-pengumuman-isi").value=o.content||"",document.getElementById("staf-pengumuman-form-title").textContent="Edit Pengumuman",(i=document.getElementById("staf-pengumuman-form"))==null||i.scrollIntoView({behavior:"smooth"})}catch(l){alert(l.message)}}}),document.addEventListener("submit",async e=>{e.target.id==="staf-pengumuman-form"&&(e.preventDefault(),await savePengumumanLaravel())}),document.addEventListener("click",e=>{e.target.closest("#staf-pengumuman-reset")&&resetStafPengumumanForm()});const Guard=window.KelurahanGuard;let _stafMobileMenuBound=!1;function ensureStafMobileMenu(){if(_stafMobileMenuBound)return;if(_stafMobileMenuBound=!0,!document.getElementById("stafMenuBackdrop")){const i=document.createElement("div");i.id="stafMenuBackdrop",document.body.appendChild(i)}const e=()=>document.body.classList.remove("staf-menu-open"),t=()=>document.body.classList.toggle("staf-menu-open");document.addEventListener("click",i=>{var n,l,o,r;if(i.target.id==="stafMenuBackdrop")return e();if((l=(n=i.target).closest)!=null&&l.call(n,"[data-action='toggleStafMenu']"))return t();if((r=(o=i.target).closest)!=null&&r.call(o,".staf-side a[data-page]"))return e()}),document.addEventListener("keydown",i=>{i.key==="Escape"&&e()})}function mountStafMenuButton(){const e=document.querySelector(".staf-top");if(!e)return;let t=e.querySelector(".top-actions");if(!t){const n=Array.from(e.children);n.length>1&&n[1].tagName==="DIV"?(t=n[1],t.classList.add("top-actions")):(t=document.createElement("div"),t.className="top-actions",e.appendChild(t))}if(t.querySelector("[data-action='toggleStafMenu']"))return;const i=document.createElement("button");i.type="button",i.className="btn btn-ghost",i.setAttribute("data-action","toggleStafMenu"),i.innerHTML='<i class="fa-solid fa-bars"></i> Menu';function _updateStafToggle(){i.style.setProperty("display",(Math.max(document.documentElement.clientWidth||0,window.innerWidth||0)>=1024?"none":"inline-flex"),"important")}
_updateStafToggle();window.addEventListener("resize",_updateStafToggle);t.prepend(i)}function setStafSidebarActive(e){document.querySelectorAll(".staf-side a").forEach(t=>{const i=t.getAttribute("href")===e;t.classList.toggle("active",i)})}function fillStafUserLabel(){const e=document.getElementById("stafUserLabel");if(!e)return;const t=Guard==null?void 0:Guard.getSession();e.textContent=t?`Login: ${t.name} (${t.role})`:"-"}window.addEventListener("page:loaded",e=>{var n;const t=((n=e.detail)==null?void 0:n.name)||"",i=t.startsWith("staf/");if(document.body.classList.toggle("is-staf",i),!i){document.body.classList.remove("staf-menu-open");return}Guard!=null&&Guard.requireStaf()&&(fillStafUserLabel(),setStafSidebarActive("#"+t),ensureStafMobileMenu(),mountStafMenuButton(),t==="staf/dashboard"&&initStafDashboardLaravel(),t==="staf/pengumuman"&&initStafPengumumanLaravel(),t==="staf/surat"&&initStafSuratLaravel(),t==="staf/pengaduan"&&initStafPengaduanLaravel(),t==="staf/buat-surat"&&typeof window.initBuatSurat=="function"&&window.initBuatSurat(),t==="staf/arsip-surat"&&typeof window.initArsipSurat=="function"&&window.initArsipSurat(),t==="staf/chat"&&initStafChatLaravel())});let stafChatPollInterval=null,stafWargaPollInterval=null;async function initStafChatLaravel(){const e=document.getElementById("chatThreadList"),t=document.getElementById("chatMessages"),i=document.getElementById("chatInput"),n=document.getElementById("chatSendForm"),l=document.getElementById("chatRoomHead");if(!e||!t)return;let o=null,r=null,d=[],a=null;stafChatPollInterval&&(clearInterval(stafChatPollInterval),stafChatPollInterval=null),stafWargaPollInterval&&(clearInterval(stafWargaPollInterval),stafWargaPollInterval=null),t.innerHTML=`
        <div class="muted" style="padding:40px;text-align:center">
            <i class="fa-solid fa-comments" style="font-size:32px;margin-bottom:10px;color:var(--primary);"></i>
            <p style="font-weight:700">Ruang Obrolan Staf</p>
            <p style="font-size:13px">Pilih salah satu warga di sebelah kiri untuk melihat pesan dan memulai obrolan langsung.</p>
        </div>
    `;async function s(f=!1){try{const g=await fetch("/api/staf/chat/warga",{credentials:"include"});if(!g.ok)throw new Error("Gagal memuat warga");if(d=await g.json(),e.innerHTML=d.map(u=>{const b=u.is_online,S=u.last_message?u.last_message.message:"Belum ada percakapan.";return`
                    <div class="thread-item staf-chat-thread" data-id="${u.id}" style="padding: 12px; border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 8px; cursor: pointer; transition: all 0.2s; position: relative;" id="warga-item-${u.id}">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-weight: 800; font-size: 14px; color: var(--text); display: flex; align-items: center; gap: 8px;">
                                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${b?"#10b981":"#cbd5e1"}; box-shadow: ${b?"0 0 8px #10b981":"none"};"></span>
                                ${u.name}
                            </div>
                        </div>
                        <div style="font-size: 12px; color: var(--muted); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 90%;">
                            ${S}
                        </div>
                        ${u.unread_count>0?`<span class="badge" style="position: absolute; right: 12px; top: 12px; font-size: 10px; background: #ef4444; border: none; color: #fff; border-radius: 50%; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; padding: 0;">${u.unread_count}</span>`:""}
                    </div>
                `}).join("")||'<div class="muted" style="padding: 20px; text-align: center;">Belum ada warga terdaftar.</div>',e.querySelectorAll(".staf-chat-thread").forEach(u=>{u.addEventListener("click",()=>{const b=u.getAttribute("data-id");m(b)})}),o){const u=document.getElementById(`warga-item-${o}`);u&&(u.style.background="rgba(31, 95, 224, 0.08)",u.style.borderColor="var(--primary)")}}catch(g){console.error(g),f||(e.innerHTML='<div class="muted" style="color:red">Gagal memuat daftar warga.</div>')}}async function c(f=!1){if(r){if(!document.getElementById("chatMessages")){w();return}try{const g=await fetch(`/api/chat/room/${r}/messages`,{credentials:"include"});if(!g.ok)throw new Error("Gagal mengambil pesan");const u=await g.json(),b=Guard==null?void 0:Guard.getSession(),S=b?b.id:null,p=t.scrollHeight,E=t.scrollTop+t.clientHeight>=p-60,v=u.map(B=>{const I=String(B.sender_id)===String(S);return`
                    <div style="display: flex; ${I?"justify-content: flex-end;":"justify-content: flex-start;"} width: 100%; margin-bottom: 10px;">
                        <div style="max-width: 75%; padding: 10px 14px; border-radius: 12px; display: flex; flex-direction: column; gap: 4px; box-shadow: var(--shadow-sm); ${I?"align-self: flex-end; background: var(--primary); color: white;":"align-self: flex-start; background: #f1f5f9; color: var(--text);"}">
                            <div style="font-size: 11px; font-weight: 800; opacity: 0.85;">${I?"Anda (Staf)":"Warga"}</div>
                            <div style="font-size: 13px; line-height: 1.4; white-space: pre-wrap;">${B.message}</div>
                            <div style="font-size: 9px; align-self: flex-end; opacity: 0.7;">${fmtDate(B.created_at)}</div>
                        </div>
                    </div>
                `}).join("")||'<div class="muted" style="padding: 40px; text-align: center;">Belum ada pesan. Kirim pesan pertama untuk memulai obrolan.</div>';t.getAttribute("data-content-hash")!==v.length.toString()&&(t.innerHTML=v,t.setAttribute("data-content-hash",v.length.toString()),(!f||E)&&(t.scrollTop=t.scrollHeight))}catch(g){console.error("Gagal memuat pesan:",g),f||(t.innerHTML='<div class="muted" style="color:red; text-align:center; padding:20px;">Gagal memuat pesan.</div>')}}}async function m(f){var g;o=f,e.querySelectorAll(".staf-chat-thread").forEach(u=>{const b=u.getAttribute("data-id");u.style.background=b===String(f)?"rgba(31, 95, 224, 0.08)":"transparent",u.style.borderColor=b===String(f)?"var(--primary)":"var(--border)"}),t.innerHTML='<div class="muted" style="padding:40px; text-align:center;"><i class="fa-solid fa-spinner fa-spin" style="font-size:24px; margin-bottom:10px;"></i><p>Memuat percakapan...</p></div>';try{const u=Guard==null?void 0:Guard.getSession(),b=u?u.id:null,S=(g=document.querySelector('meta[name="csrf-token"]'))==null?void 0:g.content,p=await fetch("/api/chat/room",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":S,Accept:"application/json"},body:JSON.stringify({warga_id:f,staf_id:b})});if(!p.ok)throw new Error("Gagal membuka room");r=(await p.json()).id;const E=d.find(v=>String(v.id)===String(f));if(E&&l){const v=E.is_online?'<span style="color: #10b981; font-weight: 800;">\u25CF Online</span>':'<span style="color: var(--muted);">\u25CF Offline</span>';l.innerHTML=`
                    <div style="font-weight: 1000; font-size: 16px;">${E.name}</div>
                    <div style="font-size: 12px; color: var(--muted); margin-top: 2px;">
                        Status Warga: ${v}
                    </div>
                `}await c(),await s(!0),h()}catch(u){console.error(u),t.innerHTML='<div class="muted" style="color:red; text-align:center; padding:20px;">Gagal memuat percakapan.</div>'}}function h(){stafChatPollInterval&&clearInterval(stafChatPollInterval);try{a&&a.close(),a=new WebSocket("ws://127.0.0.1:8085"),a.onopen=()=>{console.log("[WS Staf] Connected successfully")},a.onmessage=f=>{var g;try{const u=JSON.parse(f.data);String(u.room_id)===String(r)&&c(!0),(u.type==="update_list"||String(u.receiver_id)===String((g=Guard==null?void 0:Guard.getSession())==null?void 0:g.id))&&s(!0)}catch(u){}},a.onclose=()=>{x()},a.onerror=()=>{x()}}catch(f){x()}}function x(){stafChatPollInterval&&clearInterval(stafChatPollInterval),stafChatPollInterval=setInterval(()=>{c(!0)},1e3)}async function y(f){var b,S;if(f&&f.preventDefault(),!r){alert("Pilih warga terlebih dahulu.");return}const g=i.value.trim();if(!g)return;const u=n.querySelector("button[type='submit']");u&&(u.disabled=!0);try{const p=(b=document.querySelector('meta[name="csrf-token"]'))==null?void 0:b.content;if(!(await fetch(`/api/chat/room/${r}/messages`,{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":p,Accept:"application/json"},body:JSON.stringify({message:g})})).ok)throw new Error("Gagal mengirim pesan");i.value="",await c(),a&&a.readyState===WebSocket.OPEN&&a.send(JSON.stringify({room_id:r,sender_id:(S=Guard==null?void 0:Guard.getSession())==null?void 0:S.id,receiver_id:o,message:g})),await s(!0)}catch(p){console.error(p),alert("Gagal mengirim pesan.")}finally{u&&(u.disabled=!1)}}function w(){stafChatPollInterval&&(clearInterval(stafChatPollInterval),stafChatPollInterval=null),stafWargaPollInterval&&(clearInterval(stafWargaPollInterval),stafWargaPollInterval=null),a&&(a.close(),a=null)}n&&(n.onsubmit=y),s(),stafWargaPollInterval=setInterval(()=>{s(!0)},5e3)}

