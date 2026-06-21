(function(){"use strict";const n={logo:"/assets/images/Lambang_Kota_Depok.png",name:"Kelurahan Duren Mekar",address:"Jl. Duren Mekar No.59, Bojongsari, Kota Depok",loginTitle:"Selamat Datang di Portal Kelurahan",loginDesc:"Gunakan akun resmi untuk mengakses layanan digital, memantau pengajuan surat, menyampaikan pengaduan, dan memperoleh informasi pelayanan warga.",registerTitle:"Bergabung Bersama Kami",registerDesc:"Daftarkan akun warga untuk menggunakan layanan surat online, pengaduan, dan fitur pelayanan digital Kelurahan Duren Mekar."};function o(){const e=(window.location.hash||"").toLowerCase(),a=(window.location.pathname||"").toLowerCase(),t=(document.title||"").toLowerCase(),s=document.body?document.body.innerText.toLowerCase():"";return e.includes("register")||e.includes("daftar")||a.includes("register")||a.includes("daftar")||t.includes("daftar")||s.includes("pendaftaran akun")||s.includes("daftar akun")?"register":"login"}function u(){return document.querySelector(".auth-page .auth-card")||document.querySelector(".auth-card")||document.querySelector(".login-card")||document.querySelector(".register-card")}function l(e){if(!e)return!1;const a=e.innerText.toLowerCase();return e.closest(".auth-page")||a.includes("login")||a.includes("masuk")||a.includes("password")||a.includes("daftar")||a.includes("nik")||a.includes("email")}function c(e){const a=e==="register",t=document.createElement("aside");return t.className="auth-blue-side",t.innerHTML=`
            <div class="auth-blue-brand">
                <div class="auth-blue-logo">
                    <img src="${n.logo}" alt="Logo ${n.name}" onerror="this.style.display='none';this.parentElement.innerHTML='<i class=&quot;fa-solid fa-building-columns&quot;></i>';">
                </div>
                <div>
                    <div class="auth-blue-name">${n.name}</div>
                    <div class="auth-blue-address">${n.address}</div>
                </div>
            </div>

            <div class="auth-blue-copy">
                <div class="auth-blue-kicker">${a?"Pendaftaran Warga":"Portal Pelayanan"}</div>
                <h2 class="auth-blue-title">${a?n.registerTitle:n.loginTitle}</h2>
                <p class="auth-blue-desc">${a?n.registerDesc:n.loginDesc}</p>
            </div>

            <div class="auth-blue-security">
                <div class="auth-blue-sec-item">
                    <i class="fa-solid fa-shield-halved"></i>
                    <span><strong>Sistem Aman</strong><small>Data warga terlindungi</small></span>
                </div>
                <div class="auth-blue-sec-item">
                    <i class="fa-solid fa-lock"></i>
                    <span><strong>Akses Resmi</strong><small>Layanan digital kelurahan</small></span>
                </div>
            </div>
        `,t}function r(){const e=u();if(!l(e)||e.classList.contains("auth-blue-ready"))return;const a=o();e.classList.add("auth-blue-ready"),a==="register"&&e.classList.add("auth-blue-register");const t=Array.from(e.childNodes),s=document.createElement("div");s.className="auth-blue-form-wrap";const d=document.createElement("div");d.className="auth-blue-form-inner",s.appendChild(d),t.forEach(m=>{d.appendChild(m)}),e.appendChild(c(a)),e.appendChild(s)}function i(){requestAnimationFrame(()=>{r(),setTimeout(r,120),setTimeout(r,450)})}document.addEventListener("DOMContentLoaded",i),document.addEventListener("page:loaded",i),window.addEventListener("hashchange",i),window.addEventListener("popstate",i),document.addEventListener("DOMContentLoaded",()=>{if(!document.body)return;new MutationObserver(()=>i()).observe(document.body,{childList:!0,subtree:!0})})})();

