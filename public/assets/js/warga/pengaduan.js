const form = document.getElementById("formPengaduan");

form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const csrf = document.querySelector('meta[name="csrf-token"]').content;

    const payload = {
        judul: form.judul.value,

        isi: form.isi.value,
    };

    const response = await fetch("/api/warga/pengaduan", {
        method: "POST",

        headers: {
            "Content-Type": "application/json",

            "X-CSRF-TOKEN": csrf,

            Accept: "application/json",
        },

        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        alert("Gagal mengirim pengaduan");

        return;
    }

    alert("Pengaduan berhasil dikirim");

    form.reset();
});
