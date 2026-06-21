(function(){
const form=document.getElementById("formPengaduan");form==null||form.addEventListener("submit",async e=>{e.preventDefault();const n=document.querySelector('meta[name="csrf-token"]').content,a={judul:form.judul.value,isi:form.isi.value};if(!(await fetch("/api/warga/pengaduan",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":n,Accept:"application/json"},body:JSON.stringify(a)})).ok){alert("Gagal mengirim pengaduan");return}alert("Pengaduan berhasil dikirim"),form.reset()});
})();
