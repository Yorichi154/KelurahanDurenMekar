let agenda=JSON.parse(localStorage.getItem("agenda"))||[];const list=document.getElementById("agendaList");function render(){list.innerHTML="",agenda.forEach((e,a)=>{list.innerHTML+=`
      <li>${e.tanggal} - ${e.judul}
      <button onclick="hapus(${a})">x</button></li>`})}render(),formAgenda.onsubmit=e=>{e.preventDefault(),agenda.push({judul:formAgenda.judul.value,tanggal:formAgenda.tanggal.value,lokasi:formAgenda.lokasi.value}),localStorage.setItem("agenda",JSON.stringify(agenda)),render(),formAgenda.reset()};function hapus(e){agenda.splice(e,1),localStorage.setItem("agenda",JSON.stringify(agenda)),render()}

