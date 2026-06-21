const surat=JSON.parse(localStorage.getItem("surat"))||[],pengaduan=JSON.parse(localStorage.getItem("pengaduan"))||[];document.getElementById("totalSurat").innerText=surat.length,document.getElementById("totalPengaduan").innerText=pengaduan.length;const tbody=document.getElementById("tableSurat");surat.forEach((t,e)=>{const a=document.createElement("tr");a.innerHTML=`
    <td>${t.nama}</td>
    <td>${t.jenis}</td>
    <td>${t.status}</td>
    <td>
      <button onclick="updateStatus(${e}, 'diproses')">Proses</button>
      <button onclick="updateStatus(${e}, 'selesai')">Selesai</button>
    </td>
  `,tbody.appendChild(a)});function updateStatus(t,e){surat[t].status=e,localStorage.setItem("surat",JSON.stringify(surat)),location.reload()}

