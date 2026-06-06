/* =========================================================
   store.js
   - wrapper localStorage (JSON)
   - seed data demo
   - CRUD helper
========================================================= */
console.log("✅ STORE.JS VERSI BARU SUDAH TERPASANG!");

(function () {
    const PREFIX = "kelurahan.";

    const Storage = {
        get(key, fallback) {
            try {
                const raw = localStorage.getItem(PREFIX + key);
                return raw ? JSON.parse(raw) : fallback;
            } catch (_) {
                return fallback;
            }
        },
        set(key, value) {
            localStorage.setItem(PREFIX + key, JSON.stringify(value));
        },
        del(key) {
            localStorage.removeItem(PREFIX + key);
        },
    };

    const uid = () => {
        if (window.crypto?.randomUUID) return crypto.randomUUID();
        return (
            "id_" +
            Math.random().toString(16).slice(2) +
            Date.now().toString(16)
        );
    };

    const nowISO = () => new Date().toISOString().slice(0, 10);

    const Data = {
        list(type) {
            return Storage.get(type, []);
        },
        get(type, id) {
            return Data.list(type).find((x) => x.id === id) || null;
        },
        upsert(type, item) {
            const items = Data.list(type);
            const idx = items.findIndex((x) => x.id === item.id);
            if (idx >= 0) items[idx] = item;
            else items.unshift(item);
            Storage.set(type, items);
            return item;
        },
        remove(type, id) {
            const items = Data.list(type).filter((x) => x.id !== id);
            Storage.set(type, items);
        },
        settings() {
            return Storage.get("settings", {
                siteName: "Kelurahan Duren Mekar",
                email: "info@kelurahandurenmekar.go.id",
                phone: "(021) 1234-5678",
                address: "Jl. Duren Mekar No.59, Bojongsari, Kota Depok",
                instagram: "@kelurahandurenmekar",
                note: "Website resmi Kelurahan Duren Mekar.",
                lurahName: "",
                kecamatan: "Bojongsari",
                kota: "Kota Depok",
                provinsi: "Jawa Barat",
                kodepos: "16517",
                profil: "",
                maps: "",
                jamPelayanan: "",
            });
        },
        saveSettings(s) {
            Storage.set("settings", s);
        },
    };

    function seedOnce() {
        const seeded = Storage.get("seeded", false);
        if (seeded) return;

        // ✅ HAPUS SEEDING USERS DI SINI
        // Users sekarang sepenuhnya dikelola oleh Laravel Database & Auth

        // Berita (Tetap dipertahankan sementara)
        Storage.set("berita", [
            // ... (isi berita tetap sama) ...
        ]);

        // Agenda (Tetap dipertahankan sementara)
        Storage.set("agenda", [
            // ... (isi agenda tetap sama) ...
        ]);

        // Galeri (Tetap dipertahankan sementara)
        Storage.set("galeri", [
            // ... (isi galeri tetap sama) ...
        ]);

        // Pengumuman (Tetap dipertahankan sementara)
        Storage.set("pengumuman", [
            // ... (isi pengumuman tetap sama) ...
        ]);

        Storage.set("seeded", true);
    }

    window.KelurahanStore = {
        Storage,
        Data,
        uid,
    };
})();
// ==== Helper data Pengumuman (sharing via localStorage) ====
const PENGUMUMAN_STORAGE_KEY = "kelurahan_pengumuman";

function loadPengumuman() {
    try {
        const raw = localStorage.getItem(PENGUMUMAN_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error("Gagal parse pengumuman:", e);
        return [];
    }
}

function savePengumuman(list) {
    localStorage.setItem(PENGUMUMAN_STORAGE_KEY, JSON.stringify(list));
}
