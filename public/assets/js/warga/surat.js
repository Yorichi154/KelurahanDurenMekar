(function(){
const form=document.getElementById("formSurat");form==null||form.addEventListener("submit",async e=>{e.preventDefault();const t={jenis_surat:form.jenis.value,keperluan:form.keperluan.value},a=document.querySelector('meta[name="csrf-token"]').content;if(!(await fetch("/api/warga/surat",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":a,Accept:"application/json"},body:JSON.stringify(t)})).ok){alert("Gagal mengirim surat");return}alert("Pengajuan surat berhasil"),form.reset()});
})();
