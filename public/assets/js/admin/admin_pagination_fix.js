(function(){"use strict";const o=new Map;let b=0,c=!1;function h(){if(document.getElementById("adminPaginationFixStyle"))return;const e=document.createElement("style");e.id="adminPaginationFixStyle",e.textContent=`
            .admin-data-pagination {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
                margin-top: 16px;
                flex-wrap: wrap;
            }
            .admin-data-pagination .page-btn {
                border: 1px solid var(--border, #dbe3f0);
                background: var(--surface, #fff);
                color: var(--text, #0f172a);
                padding: 8px 14px;
                border-radius: 999px;
                font-weight: 800;
                cursor: pointer;
                transition: 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
            }
            .admin-data-pagination .page-btn:hover:not(:disabled) {
                background: var(--primary, #2563eb);
                color: #fff;
                border-color: var(--primary, #2563eb);
                transform: translateY(-1px);
            }
            .admin-data-pagination .page-btn:disabled {
                opacity: 0.45;
                cursor: not-allowed;
                box-shadow: none;
            }
            .admin-data-pagination .page-info {
                font-size: 13px;
                font-weight: 800;
                color: var(--muted, #64748b);
            }
        `,document.head.appendChild(e)}function m(){return!!document.querySelector(".admin-shell")||location.hash.startsWith("#admin/")||location.pathname.startsWith("/admin")}function y(e){if(!e.dataset.adminPaginationKey){const n=e.id||`adminTable${++b}`;e.dataset.adminPaginationKey=n}return e.dataset.adminPaginationKey}function v(e){return Array.from(e.querySelectorAll(":scope > tr")).filter(n=>n.dataset.noPaginate!=="true")}function E(e,n){const t=Array.from(e.querySelectorAll(`.admin-data-pagination[data-table-key="${CSS.escape(n)}"]`));return t.slice(1).forEach(a=>a.remove()),t[0]||null}function x(e,n,t){const a=e.closest(".card, .admin-card")||e.parentElement,i=e.closest(".table-wrap")||e.parentElement;if(!a||!i)return null;let r=E(a,t);return r||(r=document.createElement("div"),r.className="admin-data-pagination",r.dataset.tableKey=t,i.insertAdjacentElement("afterend",r)),r}function w(e){const n=e.closest("table"),t=n==null?void 0:n.closest(".card, .admin-card"),a=e.dataset.adminPaginationKey;!t||!a||t.querySelectorAll(`.admin-data-pagination[data-table-key="${CSS.escape(a)}"]`).forEach(i=>i.remove())}function P(e,n,t,a){e&&(e.innerHTML=n>1?`
                <button class="page-btn" type="button" data-page="${t-1}" ${t===1?"disabled":""}>
                    <i class="fa-solid fa-chevron-left"></i> Sebelumnya
                </button>
                <span class="page-info">Halaman ${t} dari ${n}</span>
                <button class="page-btn" type="button" data-page="${t+1}" ${t===n?"disabled":""}>
                    Berikutnya <i class="fa-solid fa-chevron-right"></i>
                </button>
            `:"",e.onclick=i=>{const r=i.target.closest(".page-btn");!r||r.disabled||a(Number(r.dataset.page)||1)})}function f(e,n=!1){if(!e||!e.closest(".card, .admin-card")||e.closest(".modal"))return;const t=e.closest("table");if(!t)return;const a=v(e),i=y(e);if(!a.length){w(e),o.set(i,1);return}const r=x(t,e,i),d=Math.ceil(a.length/6);let l=n?1:o.get(i)||1;l>d&&(l=d||1),l<1&&(l=1),o.set(i,l);const p=(l-1)*6,T=p+6;a.forEach((u,g)=>{u.style.display=g>=p&&g<T?"":"none"}),P(r,d,l,u=>{o.set(i,u),f(e,!1),t.scrollIntoView({behavior:"smooth",block:"start"})})}function S(e=!1){m()&&(h(),c=!0,document.querySelectorAll(".admin-shell .card tbody, .admin-shell .admin-card tbody").forEach(n=>{f(n,e)}),setTimeout(()=>{c=!1},0))}function s(e=!1,n=80){clearTimeout(window.__adminPaginationFixTimer),window.__adminPaginationFixTimer=setTimeout(()=>S(e),n)}window.addEventListener("page:loaded",e=>{var t;(((t=e.detail)==null?void 0:t.name)||"").startsWith("admin/")&&(o.clear(),s(!0,0),s(!0,150),s(!0,500))}),document.addEventListener("input",e=>{e.target.closest(".admin-shell")&&(o.clear(),s(!0,120))}),document.addEventListener("change",e=>{e.target.closest(".admin-shell")&&(o.clear(),s(!0,120))});const A=new MutationObserver(e=>{if(c||!m())return;e.some(t=>{var i,r,d;if(t.type!=="childList")return!1;const a=t.target;return!a||a.nodeType!==1||(i=a.closest)!=null&&i.call(a,".admin-data-pagination")?!1:((r=a.matches)==null?void 0:r.call(a,"tbody, .card, .admin-card, .admin-shell"))||((d=a.closest)==null?void 0:d.call(a,"tbody, .card, .admin-card, .admin-shell"))})&&s(!1,80)});document.addEventListener("DOMContentLoaded",()=>{A.observe(document.body,{childList:!0,subtree:!0}),s(!1,100)})})();

