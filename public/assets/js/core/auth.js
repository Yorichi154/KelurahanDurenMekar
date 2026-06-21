(function () {
  "use strict";

  const guard = window.KelurahanGuard;

  async function refreshCsrfToken() {
    try {
      const res = await fetch("/csrf-token?t=" + Date.now(), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta && data.token) {
          meta.setAttribute("content", data.token);
          return data.token;
        }
      }
    } catch (err) {
      console.error("[Auth] Failed to refresh CSRF token:", err);
    }

    return document.querySelector('meta[name="csrf-token"]')?.content || "";
  }

  async function getCurrentUser() {
    try {
      const res = await fetch("/current-user?t=" + Date.now(), {
        cache: "no-store",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error("[Auth] getCurrentUser error:", err);
      return null;
    }
  }

  function showError(el, message) {
    if (!el) return;
    el.textContent = message;
    el.style.display = "block";
  }

  function hideError(el) {
    if (!el) return;
    el.style.display = "none";
  }

  function setFieldError(input, errorEl, message) {
    if (errorEl) {
      errorEl.textContent = message || "";
      errorEl.style.display = message ? "block" : "none";
    }

    if (input) {
      if (message) {
        input.style.borderColor = "#ef4444";
        input.style.boxShadow = "0 0 0 4px rgba(239, 68, 68, .12)";
        input.setAttribute("aria-invalid", "true");
      } else {
        input.style.borderColor = "";
        input.style.boxShadow = "";
        input.removeAttribute("aria-invalid");
      }
    }
  }

  function getHashParams() {
    const hash = window.location.hash || "";
    if (!hash.includes("?")) return new URLSearchParams();
    return new URLSearchParams(hash.split("?")[1]);
  }

  function translateAuthMessage(message) {
    const raw = String(message || "").trim();
    const lower = raw.toLowerCase();

    const exact = {
      "the email field must be a valid email address.": "Format email tidak valid. Gunakan format seperti nama@email.com.",
      "these credentials do not match our records.": "Email atau password yang Anda masukkan salah.",
      "the email field is required.": "Email wajib diisi.",
      "the password field is required.": "Password wajib diisi.",
      "the name field is required.": "Nama lengkap wajib diisi.",
      "the nik field is required.": "NIK wajib diisi.",
      "the telp field is required.": "Nomor telepon wajib diisi.",
      "the alamat field is required.": "Alamat lengkap wajib diisi.",
      "the rt field is required.": "RT wajib diisi.",
      "the rw field is required.": "RW wajib diisi.",
      "the password confirmation does not match.": "Konfirmasi password tidak cocok.",
      "the selected email is invalid.": "Email tidak ditemukan atau tidak valid.",
      "unauthenticated.": "Sesi login berakhir. Silakan login kembali.",
      "forbidden - akses tidak diizinkan": "Akses tidak diizinkan.",
    };

    if (exact[lower]) return exact[lower];

    if (lower.includes("valid email address")) return "Format email tidak valid. Gunakan format seperti nama@email.com.";
    if (lower.includes("credentials do not match")) return "Email atau password yang Anda masukkan salah.";
    if (lower.includes("email has already been taken") || lower.includes("email sudah")) return "Email sudah terdaftar. Silakan gunakan email lain atau login.";
    if (lower.includes("nik has already been taken") || lower.includes("nik sudah")) return "NIK sudah terdaftar. Silakan login atau gunakan NIK yang benar.";
    if (lower.includes("password must be at least")) return "Password minimal harus 8 karakter.";
    if (lower.includes("password confirmation")) return "Konfirmasi password tidak cocok.";
    if (lower.includes("too many attempts")) return "Terlalu banyak percobaan. Silakan tunggu beberapa saat lalu coba lagi.";
    if (lower.includes("csrf") || lower.includes("token mismatch")) return "Sesi halaman sudah kedaluwarsa. Silakan muat ulang halaman lalu coba lagi.";

    return raw || "Terjadi kesalahan. Silakan coba lagi.";
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  }

  function installPasswordToggles(root = document) {
    root.querySelectorAll('input[type="password"][id]').forEach((input) => {
      if (input.dataset.passwordToggleReady === "1") return;
      input.dataset.passwordToggleReady = "1";

      const wrapper = document.createElement("div");
      wrapper.className = "password-toggle-wrap";
      wrapper.style.position = "relative";
      wrapper.style.display = "block";

      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
      input.style.paddingRight = "48px";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "password-toggle-btn";
      button.setAttribute("aria-label", "Lihat password");
      button.title = "Lihat password";
      button.innerHTML = '<i class="fa-regular fa-eye" aria-hidden="true"></i>';
      button.style.position = "absolute";
      button.style.right = "12px";
      button.style.top = "50%";
      button.style.transform = "translateY(-50%)";
      button.style.width = "34px";
      button.style.height = "34px";
      button.style.border = "0";
      button.style.borderRadius = "10px";
      button.style.background = "transparent";
      button.style.color = "#1d4ed8";
      button.style.cursor = "pointer";
      button.style.display = "inline-flex";
      button.style.alignItems = "center";
      button.style.justifyContent = "center";
      button.style.fontSize = "16px";

      button.addEventListener("click", () => {
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        button.innerHTML = show
          ? '<i class="fa-regular fa-eye-slash" aria-hidden="true"></i>'
          : '<i class="fa-regular fa-eye" aria-hidden="true"></i>';
        button.setAttribute("aria-label", show ? "Sembunyikan password" : "Lihat password");
        button.title = show ? "Sembunyikan password" : "Lihat password";
        input.focus();
      });

      wrapper.appendChild(button);
    });
  }

  function redirectByRole(user) {
    if (!user || !user.role) {
      window.location.replace("/#login");
      return;
    }

    if (guard && typeof guard.setSession === "function") {
      guard.setSession(user);
    }

    if (user.role === "admin") {
      window.location.replace("/#admin/dashboard");
    } else if (user.role === "staf") {
      window.location.replace("/#staf/dashboard");
    } else {
      window.location.replace("/#warga/dashboard");
    }
  }

  async function postForm(url, formData) {
    const csrf = await refreshCsrfToken();
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "X-CSRF-TOKEN": csrf,
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
      },
      body: formData,
      credentials: "include",
    });

    let data = {};
    try {
      data = await res.json();
    } catch (_) {}

    if (!res.ok) {
      let message = data.message || "Terjadi kesalahan. Silakan coba lagi.";
      if (data.errors) {
        const firstKey = Object.keys(data.errors)[0];
        if (firstKey && data.errors[firstKey] && data.errors[firstKey][0]) {
          message = data.errors[firstKey][0];
        }
      }
      throw new Error(translateAuthMessage(message));
    }

    return data;
  }

  /**
   * Validasi NIK Indonesia di sisi browser.
   * Format NIK: PPKKCC DDMMYY NNNN
   * - 16 digit angka.
   * - 2 digit provinsi umumnya 11-94.
   * - 2 digit kab/kota dan 2 digit kecamatan tidak boleh 00.
   * - Tanggal lahir valid; untuk perempuan tanggal ditambah 40.
   * - Bulan 01-12.
   * - Nomor urut tidak boleh 0000.
   */
  function isValidIndonesianNIK(nik) {
    nik = String(nik || "").replace(/\D/g, "");

    if (!/^\d{16}$/.test(nik)) return false;

    const province = parseInt(nik.slice(0, 2), 10);
    const city = parseInt(nik.slice(2, 4), 10);
    const district = parseInt(nik.slice(4, 6), 10);
    const rawDay = parseInt(nik.slice(6, 8), 10);
    const month = parseInt(nik.slice(8, 10), 10);
    const year2 = parseInt(nik.slice(10, 12), 10);
    const serial = nik.slice(12, 16);

    if (province < 11 || province > 94) return false;
    if (city < 1 || city > 99) return false;
    if (district < 1 || district > 99) return false;
    if (month < 1 || month > 12) return false;
    if (serial === "0000") return false;

    const day = rawDay > 40 ? rawDay - 40 : rawDay;
    if (day < 1 || day > 31) return false;

    const currentYear2 = new Date().getFullYear() % 100;
    const fullYear = year2 <= currentYear2 ? 2000 + year2 : 1900 + year2;
    const birthDate = new Date(fullYear, month - 1, day);

    if (
      birthDate.getFullYear() !== fullYear ||
      birthDate.getMonth() !== month - 1 ||
      birthDate.getDate() !== day
    ) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return birthDate <= today;
  }

  function getNikValidationMessage(nik) {
    nik = String(nik || "").replace(/\D/g, "");

    if (!nik) return "NIK wajib diisi.";
    if (!/^\d+$/.test(nik)) return "NIK hanya boleh berisi angka.";
    if (nik.length < 16) return `NIK harus 16 digit. Saat ini baru ${nik.length} digit.`;
    if (nik.length > 16) return "NIK tidak boleh lebih dari 16 digit.";

    const province = parseInt(nik.slice(0, 2), 10);
    const city = parseInt(nik.slice(2, 4), 10);
    const district = parseInt(nik.slice(4, 6), 10);
    const rawDay = parseInt(nik.slice(6, 8), 10);
    const month = parseInt(nik.slice(8, 10), 10);
    const year2 = parseInt(nik.slice(10, 12), 10);
    const serial = nik.slice(12, 16);

    if (province < 11 || province > 94) return "Kode provinsi pada 2 digit pertama NIK tidak valid.";
    if (city < 1 || city > 99) return "Kode kabupaten/kota pada digit ke-3 dan ke-4 tidak valid.";
    if (district < 1 || district > 99) return "Kode kecamatan pada digit ke-5 dan ke-6 tidak valid.";
    if (month < 1 || month > 12) return "Bulan lahir pada NIK tidak valid. Digit ke-9 dan ke-10 harus 01 sampai 12.";
    if (serial === "0000") return "Nomor urut 4 digit terakhir NIK tidak boleh 0000.";

    const day = rawDay > 40 ? rawDay - 40 : rawDay;
    if (day < 1 || day > 31) return "Tanggal lahir pada NIK tidak valid. Untuk perempuan, tanggal lahir ditambah 40 tetap diperbolehkan.";

    const currentYear2 = new Date().getFullYear() % 100;
    const fullYear = year2 <= currentYear2 ? 2000 + year2 : 1900 + year2;
    const birthDate = new Date(fullYear, month - 1, day);

    if (
      birthDate.getFullYear() !== fullYear ||
      birthDate.getMonth() !== month - 1 ||
      birthDate.getDate() !== day
    ) {
      return "Tanggal lahir pada NIK tidak valid. Contoh: tanggal 31 tidak valid untuk bulan tertentu.";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (birthDate > today) return "Tanggal lahir pada NIK tidak boleh berada di masa depan.";

    return "";
  }

  function normalizeNumericInput(input, maxLength) {
    if (!input) return;
    input.value = input.value.replace(/\D/g, "").slice(0, maxLength);
  }

  async function login(email, password) {
    const form = new FormData();
    form.append("email", email);
    form.append("password", password);

    try {
      await postForm("/login", form);
      const user = await getCurrentUser();
      if (!user || !user.id) throw new Error("Login gagal - data user tidak ditemukan");
      redirectByRole(user);
      return { success: true };
    } catch (err) {
      return { success: false, message: translateAuthMessage(err.message) };
    }
  }

  async function logout() {
    const csrf = await refreshCsrfToken();
    try {
      await fetch("/logout", {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": csrf,
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json",
        },
        credentials: "include",
      });
    } catch (err) {
      console.error("[Auth] Logout API error:", err);
    }

    if (guard && typeof guard.clearSession === "function") guard.clearSession();
    else sessionStorage.clear();

    window.location.hash = "#login";
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail")?.value.trim();
    const password = document.getElementById("loginPassword")?.value;
    const error = document.getElementById("loginError");
    const button = document.querySelector('#loginForm button[type="submit"]');
    const originalText = button?.textContent;

    if (!email || !password) {
      showError(error, "Email dan password wajib diisi");
      return;
    }

    if (!isValidEmail(email)) {
      showError(error, "Format email tidak valid. Gunakan format seperti nama@email.com.");
      return;
    }

    hideError(error);
    if (button) {
      button.disabled = true;
      button.textContent = "Memproses...";
    }

    const result = await login(email, password);
    if (!result.success) {
      showError(error, result.message || "Terjadi kesalahan saat login");
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
    }
  }

  function initLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;
    form.removeEventListener("submit", handleLoginSubmit);
    form.addEventListener("submit", handleLoginSubmit);
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();

    const name = document.getElementById("regName")?.value.trim();
    const nikInput = document.getElementById("regNik");
    const nik = nikInput?.value.replace(/\D/g, "") || "";
    const email = document.getElementById("regEmail")?.value.trim();
    const telp = document.getElementById("regTelp")?.value.trim();
    const alamat = document.getElementById("regAlamat")?.value.trim();
    const rt = document.getElementById("regRt")?.value.trim();
    const rw = document.getElementById("regRw")?.value.trim();
    const password = document.getElementById("regPass")?.value;
    const passwordConfirmation = document.getElementById("regPass2")?.value;
    const error = document.getElementById("registerError");
    const button = document.querySelector('#registerForm button[type="submit"]');
    const originalText = button?.textContent;

    if (!name || !nik || !email || !telp || !alamat || !rt || !rw || !password || !passwordConfirmation) {
      showError(error, "Semua field bertanda * wajib diisi");
      return;
    }

    if (!isValidEmail(email)) {
      showError(error, "Format email tidak valid. Gunakan format seperti nama@email.com.");
      return;
    }

    const nikErrorEl = document.getElementById("regNikError");
    const nikMessage = getNikValidationMessage(nik);
    if (nikMessage) {
      setFieldError(nikInput, nikErrorEl, nikMessage);
      showError(error, "Periksa kembali kolom NIK. " + nikMessage);
      nikInput?.focus();
      return;
    }
    setFieldError(nikInput, nikErrorEl, "");

    if (password !== passwordConfirmation) {
      showError(error, "Konfirmasi password tidak cocok");
      return;
    }

    hideError(error);
    if (button) {
      button.disabled = true;
      button.textContent = "Mengirim OTP...";
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("nik", nik);
    formData.append("email", email);
    formData.append("telp", telp);
    formData.append("alamat", alamat);
    formData.append("rt", rt);
    formData.append("rw", rw);
    formData.append("password", password);
    formData.append("password_confirmation", passwordConfirmation);

    try {
      const data = await postForm("/register", formData);
      sessionStorage.setItem("register_email", data.email || email);
      sessionStorage.setItem("otp_purpose", "register");
      window.location.hash = `#verify-otp?email=${encodeURIComponent(data.email || email)}&purpose=register`;
    } catch (err) {
      showError(error, translateAuthMessage(err.message));
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
    }
  }

  function initRegisterForm() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    const nikInput = document.getElementById("regNik");
    const nikErrorEl = document.getElementById("regNikError");
    if (nikInput) {
      nikInput.setAttribute("inputmode", "numeric");
      nikInput.setAttribute("maxlength", "16");

      nikInput.addEventListener("input", () => {
        normalizeNumericInput(nikInput, 16);

        // Jangan munculkan popup bawaan browser. Tampilkan pesan yang jelas di bawah kolom.
        if (!nikInput.value) {
          setFieldError(nikInput, nikErrorEl, "");
          return;
        }

        if (nikInput.value.length < 16) {
          setFieldError(nikInput, nikErrorEl, `NIK harus 16 digit. Saat ini baru ${nikInput.value.length} digit.`);
          return;
        }

        const message = getNikValidationMessage(nikInput.value);
        setFieldError(nikInput, nikErrorEl, message);
      });

      nikInput.addEventListener("blur", () => {
        const message = getNikValidationMessage(nikInput.value);
        setFieldError(nikInput, nikErrorEl, message);
      });
    }

    const telpInput = document.getElementById("regTelp");
    if (telpInput) {
      telpInput.setAttribute("inputmode", "tel");
      telpInput.addEventListener("input", () => {
        telpInput.value = telpInput.value.replace(/[^0-9+]/g, "").slice(0, 20);
      });
    }

    form.removeEventListener("submit", handleRegisterSubmit);
    form.addEventListener("submit", handleRegisterSubmit);
  }

  async function handleForgotPasswordSubmit(event) {
    event.preventDefault();

    const email = document.getElementById("forgotEmail")?.value.trim();
    const error = document.getElementById("forgotError");
    const info = document.getElementById("forgotInfo");
    const button = document.querySelector('#forgotPasswordForm button[type="submit"]');
    const originalHtml = button?.innerHTML;

    if (!email) {
      showError(error, "Email wajib diisi");
      return;
    }

    if (!isValidEmail(email)) {
      showError(error, "Format email tidak valid. Gunakan format seperti nama@email.com.");
      return;
    }

    hideError(error);
    if (info) info.style.display = "none";
    if (button) {
      button.disabled = true;
      button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';
    }

    const formData = new FormData();
    formData.append("email", email);

    try {
      await postForm("/forgot-password", formData);
      sessionStorage.setItem("reset_email", email);
      sessionStorage.setItem("otp_purpose", "reset");
      if (info) info.style.display = "block";
      setTimeout(() => {
        window.location.hash = `#verify-otp?email=${encodeURIComponent(email)}&purpose=reset`;
      }, 800);
    } catch (err) {
      showError(error, translateAuthMessage(err.message));
      if (button) {
        button.disabled = false;
        button.innerHTML = originalHtml;
      }
    }
  }

  function initForgotPasswordForm() {
    const form = document.getElementById("forgotPasswordForm");
    if (!form) return;
    form.removeEventListener("submit", handleForgotPasswordSubmit);
    form.addEventListener("submit", handleForgotPasswordSubmit);
  }

  async function handleVerifyOtpSubmit(event) {
    event.preventDefault();

    const params = getHashParams();
    const purpose = params.get("purpose") || sessionStorage.getItem("otp_purpose") || "reset";
    const email = document.getElementById("otpEmail")?.value.trim();
    const otp = document.getElementById("otpCode")?.value.replace(/\D/g, "") || "";
    const error = document.getElementById("otpError");
    const button = document.querySelector('#verifyOtpForm button[type="submit"]');
    const originalHtml = button?.innerHTML;

    if (!email || !otp) {
      showError(error, "Email dan kode OTP wajib diisi");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      showError(error, "Kode OTP harus 6 digit angka");
      return;
    }

    hideError(error);
    if (button) {
      button.disabled = true;
      button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memverifikasi...';
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("otp", otp);

    try {
      if (purpose === "register") {
        const data = await postForm("/verify-register-otp", formData);
        const user = data.user || (await getCurrentUser());
        sessionStorage.removeItem("register_email");
        sessionStorage.removeItem("otp_purpose");
        redirectByRole(user);
      } else {
        await postForm("/verify-otp", formData);
        sessionStorage.setItem("reset_otp_token", otp);
        window.location.hash = `#reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`;
      }
    } catch (err) {
      showError(error, translateAuthMessage(err.message));
      if (button) {
        button.disabled = false;
        button.innerHTML = originalHtml;
      }
    }
  }

  async function resendRegisterOtp() {
    const email = document.getElementById("otpEmail")?.value.trim();
    const error = document.getElementById("otpError");
    const button = document.getElementById("resendRegisterOtpBtn");
    const originalText = button?.textContent;

    if (!email) {
      showError(error, "Email tidak ditemukan. Silakan daftar ulang.");
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent = "Mengirim ulang...";
    }

    const formData = new FormData();
    formData.append("email", email);

    try {
      const data = await postForm("/resend-register-otp", formData);
      showError(error, data.message || "Kode OTP baru sudah dikirim.");
      if (error) {
        error.style.background = "#dcfce7";
        error.style.color = "#166534";
      }
    } catch (err) {
      if (error) {
        error.style.background = "#fee2e2";
        error.style.color = "#991b1b";
      }
      showError(error, translateAuthMessage(err.message));
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
    }
  }

  function initVerifyOtpForm() {
    const form = document.getElementById("verifyOtpForm");
    if (!form) return;

    const params = getHashParams();
    const purpose = params.get("purpose") || sessionStorage.getItem("otp_purpose") || "reset";
    let email = params.get("email") || "";
    if (!email) email = purpose === "register" ? (sessionStorage.getItem("register_email") || "") : (sessionStorage.getItem("reset_email") || "");

    const emailInput = document.getElementById("otpEmail");
    if (emailInput) emailInput.value = email;

    const otpInput = document.getElementById("otpCode");
    if (otpInput) {
      otpInput.addEventListener("input", () => normalizeNumericInput(otpInput, 6));
    }

    const subtitle = document.querySelector("#verifyOtpSubtitle");
    if (subtitle) {
      subtitle.textContent = purpose === "register"
        ? "Masukkan 6 digit kode OTP yang telah dikirim ke email Anda untuk mengaktifkan akun warga."
        : "Masukkan 6 digit kode OTP yang telah dikirim ke alamat email Anda.";
    }

    const backLink = document.getElementById("otpBackLink");
    if (backLink) {
      if (purpose === "register") {
        backLink.setAttribute("data-page", "register");
        backLink.setAttribute("href", "#register");
        backLink.textContent = "← Kembali ke Daftar Akun";
      } else {
        backLink.setAttribute("data-page", "forgot-password");
        backLink.setAttribute("href", "#forgot-password");
        backLink.textContent = "← Kembali ke Lupa Password";
      }
    }

    const resendBtn = document.getElementById("resendRegisterOtpBtn");
    if (resendBtn) {
      resendBtn.style.display = purpose === "register" ? "inline-flex" : "none";
      resendBtn.removeEventListener("click", resendRegisterOtp);
      resendBtn.addEventListener("click", resendRegisterOtp);
    }

    form.removeEventListener("submit", handleVerifyOtpSubmit);
    form.addEventListener("submit", handleVerifyOtpSubmit);
  }

  async function handleResetPasswordSubmit(event) {
    event.preventDefault();

    const email = document.getElementById("resetEmail")?.value.trim();
    const token = document.getElementById("resetToken")?.value.trim();
    const password = document.getElementById("newPassword")?.value;
    const passwordConfirmation = document.getElementById("confirmPassword")?.value;
    const error = document.getElementById("resetError");
    const ok = document.getElementById("resetOk");
    const button = document.querySelector('#resetPasswordForm button[type="submit"]');
    const originalHtml = button?.innerHTML;

    if (!email || !token || !password || !passwordConfirmation) {
      showError(error, "Semua field wajib diisi");
      return;
    }

    if (password !== passwordConfirmation) {
      showError(error, "Konfirmasi password tidak cocok");
      return;
    }

    hideError(error);
    if (ok) ok.style.display = "none";
    if (button) {
      button.disabled = true;
      button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("token", token);
    formData.append("password", password);
    formData.append("password_confirmation", passwordConfirmation);

    try {
      await postForm("/reset-password", formData);
      if (ok) ok.style.display = "block";
      const form = document.getElementById("resetPasswordForm");
      if (form) form.querySelectorAll("input, button, p, label").forEach((el) => (el.style.display = "none"));
    } catch (err) {
      showError(error, translateAuthMessage(err.message));
      if (button) {
        button.disabled = false;
        button.innerHTML = originalHtml;
      }
    }
  }

  function initResetPasswordForm() {
    const form = document.getElementById("resetPasswordForm");
    if (!form) return;

    const params = getHashParams();
    const email = params.get("email") || sessionStorage.getItem("reset_email") || "";
    const otp = params.get("otp") || sessionStorage.getItem("reset_otp_token") || "";

    const emailInput = document.getElementById("resetEmail");
    if (emailInput) emailInput.value = email;

    const tokenInput = document.getElementById("resetToken");
    if (tokenInput) tokenInput.value = otp;

    form.removeEventListener("submit", handleResetPasswordSubmit);
    form.addEventListener("submit", handleResetPasswordSubmit);
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest('[data-action="logout"]')) {
      event.preventDefault();
      logout();
    }
  });

  function initAuthForms() {
    installPasswordToggles(document);
    initLoginForm();
    initRegisterForm();
    initForgotPasswordForm();
    initVerifyOtpForm();
    initResetPasswordForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAuthForms);
  } else {
    initAuthForms();
  }

  window.addEventListener("page:loaded", initAuthForms);

  window.Auth = {
    login,
    logout,
    getCurrentUser,
    isValidIndonesianNIK,
  };

  console.log("[Auth] Module loaded");
})();
