// assets/js/core/auth.js
(function () {
    "use strict";
    const Guard = window.KelurahanGuard;

    async function refreshCsrfToken() {
        try {
            const response = await fetch("/csrf-token?t=" + Date.now(), { cache: "no-store" });
            if (response.ok) {
                const data = await response.json();
                const meta = document.querySelector('meta[name="csrf-token"]');
                if (meta && data.token) {
                    meta.setAttribute("content", data.token);
                    console.log("[Auth] CSRF token refreshed");
                    return data.token;
                }
            }
        } catch (error) {
            console.error("[Auth] Failed to refresh CSRF token:", error);
        }
        return document.querySelector('meta[name="csrf-token"]')?.content;
    }

    async function getCurrentUser() {
        try {
            const response = await fetch("/current-user?t=" + Date.now(), {
                cache: "no-store",
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
        const csrf = await refreshCsrfToken();
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
        const csrf = await refreshCsrfToken();
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
        window.location.href = "/#login";
        window.location.reload();
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

    async function handleRegisterSubmit(e) {
        e.preventDefault();
        console.log("[Auth] Register form submitted - START");

        const name = document.getElementById("regName")?.value.trim();
        const nik = document.getElementById("regNik")?.value.trim();
        const email = document.getElementById("regEmail")?.value.trim();
        const telp = document.getElementById("regTelp")?.value.trim();
        const alamat = document.getElementById("regAlamat")?.value.trim();
        const rt = document.getElementById("regRt")?.value.trim();
        const rw = document.getElementById("regRw")?.value.trim();
        const password = document.getElementById("regPass")?.value;
        const password_confirmation = document.getElementById("regPass2")?.value;

        const errorDiv = document.getElementById("registerError");
        const btn = document.querySelector('#registerForm button[type="submit"]');
        const originalText = btn?.textContent;

        if (!name || !nik || !email || !telp || !alamat || !rt || !rw || !password || !password_confirmation) {
            if (errorDiv) {
                errorDiv.textContent = "Semua field bertanda * wajib diisi";
                errorDiv.style.display = "block";
            }
            return;
        }

        if (password !== password_confirmation) {
            if (errorDiv) {
                errorDiv.textContent = "Konfirmasi password tidak cocok";
                errorDiv.style.display = "block";
            }
            return;
        }

        if (errorDiv) errorDiv.style.display = "none";
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Memproses...";
        }

        const csrf = await refreshCsrfToken();
        const formData = new FormData();
        formData.append("name", name);
        formData.append("nik", nik);
        formData.append("email", email);
        formData.append("telp", telp);
        formData.append("alamat", alamat);
        formData.append("rt", rt);
        formData.append("rw", rw);
        formData.append("password", password);
        formData.append("password_confirmation", password_confirmation);

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": csrf,
                    "X-Requested-With": "XMLHttpRequest",
                    Accept: "application/json",
                },
                body: formData,
                credentials: "include",
            });

            const result = await response.json();

            if (!response.ok) {
                let errMsg = result.message || "Pendaftaran gagal";
                if (result.errors) {
                    const firstErrorKey = Object.keys(result.errors)[0];
                    errMsg = result.errors[firstErrorKey][0];
                }
                throw new Error(errMsg);
            }

            const user = await getCurrentUser();
            if (user && user.id) {
                if (Guard && typeof Guard.setSession === "function") {
                    Guard.setSession(user);
                }
                window.location.replace("/#warga/dashboard");
            } else {
                window.location.replace("/#login");
            }
        } catch (error) {
            console.error("[Auth] Register error:", error);
            if (errorDiv) {
                errorDiv.textContent = error.message;
                errorDiv.style.display = "block";
            }
            if (btn) {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }
    }

    function initRegisterForm() {
        const form = document.getElementById("registerForm");
        console.log("[Auth] REGISTER FORM FOUND:", !!form);
        if (!form) return;
        form.removeEventListener("submit", handleRegisterSubmit);
        form.addEventListener("submit", handleRegisterSubmit);
    }

    async function handleForgotPasswordSubmit(e) {
        e.preventDefault();
        console.log("[Auth] Forgot password form submitted - START");

        const email = document.getElementById("forgotEmail")?.value.trim();
        const errorDiv = document.getElementById("forgotError");
        const infoDiv = document.getElementById("forgotInfo");
        const btn = document.querySelector('#forgotPasswordForm button[type="submit"]');
        const originalText = btn?.innerHTML;

        if (!email) {
            if (errorDiv) {
                errorDiv.textContent = "Email wajib diisi";
                errorDiv.style.display = "block";
            }
            return;
        }

        if (errorDiv) errorDiv.style.display = "none";
        if (infoDiv) infoDiv.style.display = "none";

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';
        }

        const csrf = await refreshCsrfToken();
        const formData = new FormData();
        formData.append("email", email);

        try {
            const response = await fetch("/forgot-password", {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": csrf,
                    "X-Requested-With": "XMLHttpRequest",
                    Accept: "application/json",
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                let errMsg = result.message || "Gagal mengirim kode OTP reset password";
                if (result.errors) {
                    const firstErrorKey = Object.keys(result.errors)[0];
                    errMsg = result.errors[firstErrorKey][0];
                }
                throw new Error(errMsg);
            }

            if (infoDiv) {
                infoDiv.style.display = "block";
                const resetLink = infoDiv.querySelector('[data-page="reset-password"]');
                if (resetLink) {
                    resetLink.href = `#verify-otp?email=${encodeURIComponent(email)}`;
                    resetLink.innerHTML = '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i> Masukkan Kode OTP';
                    resetLink.setAttribute('data-page', 'verify-otp');
                }
            }
            const form = document.getElementById("forgotPasswordForm");
            if (form) {
                const inputs = form.querySelectorAll("input, button");
                inputs.forEach(el => el.style.display = "none");
                const labels = form.querySelectorAll("label, p.muted, .divider, .info-reset-card");
                labels.forEach(el => el.style.display = "none");
            }
            
            // Auto redirect to verify-otp page after 1.5 seconds
            setTimeout(() => {
                window.location.hash = `#verify-otp?email=${encodeURIComponent(email)}`;
            }, 1500);
        } catch (error) {
            console.error("[Auth] Forgot Password error:", error);
            if (errorDiv) {
                errorDiv.textContent = error.message;
                errorDiv.style.display = "block";
            }
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }
    }

    function initForgotPasswordForm() {
        const form = document.getElementById("forgotPasswordForm");
        console.log("[Auth] FORGOT PASSWORD FORM FOUND:", !!form);
        if (!form) return;
        form.removeEventListener("submit", handleForgotPasswordSubmit);
        form.addEventListener("submit", handleForgotPasswordSubmit);
    }

    async function handleResetPasswordSubmit(e) {
        e.preventDefault();
        console.log("[Auth] Reset password form submitted - START");

        const email = document.getElementById("resetEmail")?.value.trim();
        const token = document.getElementById("resetToken")?.value.trim();
        const password = document.getElementById("newPassword")?.value;
        const password_confirmation = document.getElementById("confirmPassword")?.value;

        const errorDiv = document.getElementById("resetError");
        const successDiv = document.getElementById("resetOk");
        const btn = document.querySelector('#resetPasswordForm button[type="submit"]');
        const originalText = btn?.innerHTML;

        if (!email || !token || !password || !password_confirmation) {
            if (errorDiv) {
                errorDiv.textContent = "Semua field wajib diisi";
                errorDiv.style.display = "block";
            }
            return;
        }

        if (password !== password_confirmation) {
            if (errorDiv) {
                errorDiv.textContent = "Konfirmasi password tidak cocok";
                errorDiv.style.display = "block";
            }
            return;
        }

        if (errorDiv) errorDiv.style.display = "none";
        if (successDiv) successDiv.style.display = "none";

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
        }

        const csrf = await refreshCsrfToken();
        const formData = new FormData();
        formData.append("email", email);
        formData.append("token", token);
        formData.append("password", password);
        formData.append("password_confirmation", password_confirmation);

        try {
            const response = await fetch("/reset-password", {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": csrf,
                    "X-Requested-With": "XMLHttpRequest",
                    Accept: "application/json",
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                let errMsg = result.message || "Gagal mengatur ulang password";
                if (result.errors) {
                    const firstErrorKey = Object.keys(result.errors)[0];
                    errMsg = result.errors[firstErrorKey][0];
                }
                throw new Error(errMsg);
            }

            if (successDiv) {
                successDiv.style.display = "block";
            }
            const form = document.getElementById("resetPasswordForm");
            if (form) {
                const inputs = form.querySelectorAll("input, button, p, label");
                inputs.forEach(el => el.style.display = "none");
            }
        } catch (error) {
            console.error("[Auth] Reset Password error:", error);
            if (errorDiv) {
                errorDiv.textContent = error.message;
                errorDiv.style.display = "block";
            }
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }
    }

    function initResetPasswordForm() {
        const form = document.getElementById("resetPasswordForm");
        console.log("[Auth] RESET PASSWORD FORM FOUND:", !!form);
        if (!form) return;

        // Parse email and otp from hash query params (e.g. #reset-password?email=...&otp=...)
        let email = '';
        let token = '';
        const hash = window.location.hash;
        if (hash.includes('?')) {
            const searchPart = hash.split('?')[1];
            const hashParams = new URLSearchParams(searchPart);
            email = hashParams.get('email') || '';
            token = hashParams.get('otp') || '';
        }
        if (!email) {
            const urlParams = new URLSearchParams(window.location.search);
            email = urlParams.get('email') || '';
        }

        const emailInput = document.getElementById("resetEmail");
        if (emailInput && email) {
            emailInput.value = email;
        }

        const tokenInput = document.getElementById("resetToken");
        if (tokenInput && token) {
            tokenInput.value = token;
        }

        const path = window.location.pathname;
        if (!token && path.includes('/reset-password/')) {
            const parts = path.split('/reset-password/');
            if (parts.length > 1) {
                const urlToken = parts[1].split('/')[0];
                if (tokenInput && urlToken) {
                    tokenInput.value = urlToken;
                }
            }
        }

        form.removeEventListener("submit", handleResetPasswordSubmit);
        form.addEventListener("submit", handleResetPasswordSubmit);
    }

    async function handleVerifyOtpSubmit(e) {
        e.preventDefault();
        console.log("[Auth] Verify OTP form submitted - START");

        const email = document.getElementById("otpEmail")?.value.trim();
        const otp = document.getElementById("otpCode")?.value.trim();
        const errorDiv = document.getElementById("otpError");
        const btn = document.querySelector('#verifyOtpForm button[type="submit"]');
        const originalText = btn?.innerHTML;

        if (!email || !otp) {
            if (errorDiv) {
                errorDiv.textContent = "Semua field wajib diisi";
                errorDiv.style.display = "block";
            }
            return;
        }

        if (otp.length !== 6) {
            if (errorDiv) {
                errorDiv.textContent = "Kode OTP harus 6 digit angka";
                errorDiv.style.display = "block";
            }
            return;
        }

        if (errorDiv) errorDiv.style.display = "none";

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memverifikasi...';
        }

        const csrf = await refreshCsrfToken();
        const formData = new FormData();
        formData.append("email", email);
        formData.append("otp", otp);

        try {
            const response = await fetch("/verify-otp", {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": csrf,
                    "X-Requested-With": "XMLHttpRequest",
                    Accept: "application/json",
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                let errMsg = result.message || "Kode OTP tidak valid atau sudah kedaluwarsa";
                if (result.errors) {
                    const firstErrorKey = Object.keys(result.errors)[0];
                    errMsg = result.errors[firstErrorKey][0];
                }
                throw new Error(errMsg);
            }

            // If valid, redirect to reset-password with email and OTP code
            window.location.hash = `#reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`;
        } catch (error) {
            console.error("[Auth] Verify OTP error:", error);
            if (errorDiv) {
                errorDiv.textContent = error.message;
                errorDiv.style.display = "block";
            }
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }
    }

    function initVerifyOtpForm() {
        const form = document.getElementById("verifyOtpForm");
        console.log("[Auth] VERIFY OTP FORM FOUND:", !!form);
        if (!form) return;

        // Parse email from hash query params
        let email = '';
        const hash = window.location.hash;
        if (hash.includes('?')) {
            const searchPart = hash.split('?')[1];
            const hashParams = new URLSearchParams(searchPart);
            email = hashParams.get('email') || '';
        }
        if (!email) {
            const urlParams = new URLSearchParams(window.location.search);
            email = urlParams.get('email') || '';
        }

        const emailInput = document.getElementById("otpEmail");
        if (emailInput && email) {
            emailInput.value = email;
        }

        form.removeEventListener("submit", handleVerifyOtpSubmit);
        form.addEventListener("submit", handleVerifyOtpSubmit);
    }

    document.addEventListener("click", (e) => {
        const logoutBtn = e.target.closest('[data-action="logout"]');
        if (logoutBtn) {
            e.preventDefault();
            logout();
        }
    });

    const initAllForms = () => {
        initLoginForm();
        initRegisterForm();
        initForgotPasswordForm();
        initVerifyOtpForm();
        initResetPasswordForm();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAllForms);
    } else {
        initAllForms();
    }

    window.addEventListener("page:loaded", (e) => {
        console.log("[Auth] page:loaded", e.detail?.name);

        if (e.detail?.name === "login" || e.detail?.name === "auth/login") {
            initLoginForm();
        } else if (e.detail?.name === "register" || e.detail?.name === "auth/register") {
            initRegisterForm();
        } else if (e.detail?.name === "forgot-password" || e.detail?.name === "auth/forgot-password") {
            initForgotPasswordForm();
        } else if (e.detail?.name === "verify-otp" || e.detail?.name === "auth/verify-otp") {
            initVerifyOtpForm();
        } else if (e.detail?.name === "reset-password" || e.detail?.name === "auth/reset-password") {
            initResetPasswordForm();
        }
    });

    window.Auth = { login, logout, getCurrentUser };
    console.log("[Auth] Module loaded");
})();
