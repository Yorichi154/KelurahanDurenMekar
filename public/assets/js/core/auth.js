// assets/js/core/auth.js
(function () {
    "use strict";
    const Guard = window.KelurahanGuard;

    async function getCurrentUser() {
        try {
            const response = await fetch("/current-user", {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            if (response.ok) {
                const user = await response.json();
                console.log("[Auth] getCurrentUser success:", user?.role);
                return user;
            }
            console.log(
                "[Auth] getCurrentUser failed, status:",
                response.status,
            );
            return null;
        } catch (error) {
            console.error("[Auth] getCurrentUser error:", error);
            return null;
        }
    }

    async function login(email, password) {
        const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);

        try {
            console.log("[Auth] Attempting login...");
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": csrf,
                    "X-Requested-With": "XMLHttpRequest",
                    Accept: "application/json",
                },
                body: formData,
                credentials: "include",
            });

            // VALIDASI RESPON SEGERA - TANPA setTimeout
            if (!response.ok) {
                throw new Error("Email atau password salah");
            }

            // LANGSUNG AMBIL USER DATA
            const user = await getCurrentUser();
            console.log("[Auth] User after login:", user);

            if (user && user.id) {
                // SIMPAN SESSION VIA GUARD
                if (Guard && typeof Guard.setSession === "function") {
                    Guard.setSession(user);
                    console.log("[Auth] Session saved, role:", user.role);
                }

                // REDIRECT BERDASARKAN ROLE
                const role = user.role;
                if (role === "admin") {
                    console.log("[Auth] Redirecting to admin dashboard");
                    window.location.replace("/#admin/dashboard");
                } else if (role === "staf") {
                    console.log("[Auth] Redirecting to staf dashboard");
                    window.location.replace("/#staf/dashboard");
                } else {
                    console.log("[Auth] Redirecting to warga dashboard");
                    window.location.replace("/#warga/dashboard");
                }

                return { success: true };
            }

            throw new Error("Login gagal - data user tidak ditemukan");
        } catch (error) {
            console.error("[Auth] Login error:", error);
            return { success: false, message: error.message };
        }
    }

    async function logout() {
        const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
        try {
            console.log(
                "CSRF META:",
                document.querySelector('meta[name="csrf-token"]')?.content,
            );

            console.log("COOKIE:", document.cookie);
            await fetch("/logout", {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": csrf,
                    "X-Requested-With": "XMLHttpRequest",
                    Accept: "application/json",
                },
                credentials: "include",
            });
        } catch (error) {
            console.error("[Auth] Logout API error:", error);
        }

        // CLEAR SESSION
        if (Guard && typeof Guard.clearSession === "function") {
            Guard.clearSession();
        } else {
            sessionStorage.clear();
        }
        window.location.href = "/";
    }

    async function handleLoginSubmit(e) {
        e.preventDefault();
        console.log("[Auth] Form submitted - START");

        const email = document.getElementById("loginEmail")?.value.trim();
        const password = document.getElementById("loginPassword")?.value;
        const errorDiv = document.getElementById("loginError");
        const btn = document.querySelector('#loginForm button[type="submit"]');
        const originalText = btn?.textContent;

        if (!email || !password) {
            if (errorDiv) {
                errorDiv.textContent = "Email dan password wajib diisi";
                errorDiv.style.display = "block";
            }
            return;
        }

        if (errorDiv) errorDiv.style.display = "none";
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Memproses...";
        }

        const result = await login(email, password);

        if (!result.success) {
            if (errorDiv) {
                errorDiv.textContent =
                    result.message || "Terjadi kesalahan saat login";
                errorDiv.style.display = "block";
            }
            if (btn) {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }
    }

    function initLoginForm() {
        const form = document.getElementById("loginForm");

        console.log("[Auth] LOGIN FORM FOUND:", !!form);

        if (!form) {
            return;
        }

        form.removeEventListener("submit", handleLoginSubmit);

        form.addEventListener("submit", handleLoginSubmit);

        console.log("[Auth] Login form initialized");
    }
    // Logout handler global
    document.addEventListener("click", (e) => {
        const logoutBtn = e.target.closest('[data-action="logout"]');
        if (logoutBtn) {
            e.preventDefault();
            logout();
        }
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initLoginForm);
    } else {
        initLoginForm();
    }
    window.addEventListener("page:loaded", (e) => {
        console.log("[Auth] page:loaded", e.detail?.name);

        if (e.detail?.name === "login" || e.detail?.name === "auth/login") {
            initLoginForm();
        }
    });
    window.Auth = { login, logout, getCurrentUser };
    console.log("[Auth] Module loaded");
})();
