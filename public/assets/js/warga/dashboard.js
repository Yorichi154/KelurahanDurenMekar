// warga/dashboard.js
// PENTING: File ini sebelumnya dieksekusi secara GLOBAL di SETIAP halaman
// (karena dimuat di layouts/public.blade.php) dan baris teratasnya langsung
// melakukan redirect ke #login ketika tidak ada sesi. Akibatnya halaman publik
// (home) ikut terlempar ke login saat pertama kali dibuka.
//
// Sekarang logikanya HANYA berjalan ketika halaman warga/dashboard benar-benar
// dimuat oleh SPA router, dan menggunakan sumber sesi yang konsisten
// (KelurahanGuard / sessionStorage), bukan localStorage.
(function () {
	"use strict";

	function getUser() {
		if (window.KelurahanGuard && typeof window.KelurahanGuard.getSession === "function") {
			return window.KelurahanGuard.getSession();
		}
		try {
			return JSON.parse(sessionStorage.getItem("user"));
		} catch (e) {
			return null;
		}
	}

	function fillWargaDashboard() {
		const user = getUser();
		// Pengaman halaman: hanya untuk warga. Guard.requireWarga() di warga.js
		// sudah menangani redirect ke #login bila belum login, jadi di sini cukup
		// keluar diam-diam tanpa memaksa redirect global.
		if (!user || user.role !== "warga") return;

		const setText = (id, value) => {
			const el = document.getElementById(id);
			if (el) el.innerText = value;
		};

		const nama = user.name || user.nama || "";
		setText("namaWarga", nama);
		setText("namaHeader", nama);

		const rt = user.rt != null ? user.rt : "-";
		const rw = user.rw != null ? user.rw : "-";
		const rtRwEl = document.getElementById("rtRw");
		if (rtRwEl) rtRwEl.innerText = `RT ${rt} / RW ${rw}`;
	}

	// Logout warga: bersihkan sesi lewat Guard (sessionStorage), lalu kembali ke
	// halaman home publik.
	window.logoutWarga = function () {
		if (window.KelurahanGuard && typeof window.KelurahanGuard.clearSession === "function") {
			window.KelurahanGuard.clearSession();
		} else {
			sessionStorage.removeItem("user");
		}
		if (typeof window.navigateTo === "function") {
			window.navigateTo("home");
		} else {
			window.location.hash = "#home";
		}
	};

	// Jalankan HANYA saat halaman warga/dashboard dimuat oleh SPA router.
	window.addEventListener("page:loaded", (e) => {
		const name = (e && e.detail && e.detail.name) || "";
		if (name === "warga/dashboard") fillWargaDashboard();
	});
})();
