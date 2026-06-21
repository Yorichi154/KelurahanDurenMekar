(function(){
const form=document.getElementById("formBerita"),list=document.getElementById("listBerita");if(!form||!list)return;let berita=JSON.parse(localStorage.getItem("berita"))||[];function render(){list.innerHTML="",berita.forEach((t,e)=>{list.innerHTML+=`
      <li>
        <strong>${t.judul}</strong> (${t.kategori})
        <button onclick="hapus(${e})">Hapus</button>
      </li>`})}render(),form.addEventListener("submit",t=>{t.preventDefault(),berita.push({judul:form.judul.value,isi:form.isi.value,kategori:form.kategori.value,tanggal:new Date().toLocaleDateString()}),localStorage.setItem("berita",JSON.stringify(berita)),form.reset(),render()});function hapus(t){berita.splice(t,1),localStorage.setItem("berita",JSON.stringify(berita)),render()}window.hapus=hapus;
})();
