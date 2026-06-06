// assets/js/core/guard.js
(function () {
    const SESSION_KEY = "user";

    function getSession() {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error("[Guard] getSession error:", e);
            return null;
        }
    }

    function setSession(user) {
        if (!user) return;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
        window.dispatchEvent(
            new CustomEvent("session:changed", { detail: { user } }),
        );
        console.log("[Guard] Session set for role:", user.role);
    }

    function clearSession() {
        sessionStorage.removeItem(SESSION_KEY);
        window.dispatchEvent(new CustomEvent("session:cleared"));
        console.log("[Guard] Session cleared");
    }

    function getRole() {
        const user = getSession();
        return user?.role || null;
    }

    function getUserName() {
        const user = getSession();
        return user?.name || "";
    }

    function isAuthenticated() {
        return getSession() !== null;
    }

    function hasRole(role) {
        return getRole() === role;
    }

    // STRICT: Hanya admin
    function requireAdmin() {
        if (!isAuthenticated()) {
            window.location.hash = "#login";
            return false;
        }
        if (!hasRole("admin")) {
            window.location.hash = "#unauthorized";
            return false;
        }
        return true;
    }

    // STRICT: Hanya staf
    function requireStaf() {
        if (!isAuthenticated()) {
            window.location.hash = "#login";
            return false;
        }
        const role = getRole();
        if (role !== "staf") {
            window.location.hash = "#unauthorized";
            return false;
        }
        return true;
    }

    // STRICT: Hanya warga
    function requireWarga() {
        if (!isAuthenticated()) {
            window.location.hash = "#login";
            return false;
        }
        const role = getRole();
        if (role !== "warga") {
            window.location.hash = "#unauthorized";
            return false;
        }
        return true;
    }

    // Expose API global
    window.KelurahanGuard = {
        getSession,
        setSession,
        clearSession,
        getRole,
        getUserName,
        isAuthenticated,
        hasRole,
        requireAdmin,
        requireStaf,
        requireWarga,
    };

    console.log("[Guard] Module loaded");
})();
