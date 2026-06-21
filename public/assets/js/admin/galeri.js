let galeriAdminData=JSON.parse(localStorage.getItem("galeri"))||[];function renderAdminGaleri(){const t=document.getElementById("adminGaleriList");t.innerHTML="",galeriAdminData.forEach((e,n)=>{t.innerHTML+=`
      <tr>
        <td>${e.title}</td>
        <td>${e.category}</td>
        <td>${e.date}</td>
        <td>
          <button onclick="editGaleri(${n})">Edit</button>
          <button onclick="deleteGaleri(${n})">Hapus</button>
        </td>
      </tr>
    `})}function deleteGaleri(t){galeriAdminData.splice(t,1),localStorage.setItem("galeri",JSON.stringify(galeriAdminData)),renderAdminGaleri()}document.addEventListener("DOMContentLoaded",renderAdminGaleri);

