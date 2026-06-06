const form = document.getElementById("formSurat");

form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        jenis_surat: form.jenis.value,

        keperluan: form.keperluan.value,
    };

    const csrf = document.querySelector('meta[name="csrf-token"]').content;

    const response = await fetch("/api/warga/surat", {
        method: "POST",

        headers: {
            "Content-Type": "application/json",

            "X-CSRF-TOKEN": csrf,

            Accept: "application/json",
        },

        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        alert("Gagal mengirim surat");

        return;
    }

    alert("Pengajuan surat berhasil");

    form.reset();
});
