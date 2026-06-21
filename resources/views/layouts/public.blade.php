<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Kelurahan Duren Mekar</title>

    <link rel="icon" href="/assets/images/Lambang_Kota_Depok.png">

    <!-- FONT AWESOME -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <!-- OPTIMIZED CSS -->
    <link rel="stylesheet" href="/assets/css/app.min.css?v=20260621-fix19">
    <link rel="stylesheet" href="/assets/css/app-auth-split.css?v=20260621-fix19">
</head>

<body>
    <!-- HEADER AKAN DIISI OLEH core/main.js DARI pages/partials/header.html -->
    <header id="header"></header>

    <!-- KONTEN HALAMAN AKAN DIISI OLEH ROUTER SPA -->
    <main id="content">
        @yield('content')
    </main>

    <!-- FOOTER AKAN DIISI OLEH core/main.js DARI pages/partials/footer.html -->
    <div id="footer"></div>

    <!-- CORE JS -->
    <script src="/assets/js/core/utils.js?v=20260621-fix" defer></script>
    <script src="/assets/js/core/store.js?v=20260621-fix" defer></script>
    <script src="/assets/js/core/guard.js?v=20260621-fix" defer></script>
    <script src="/assets/js/core/auth.js?v=20260621-otp" defer></script>
    <script src="/assets/js/core/main.js?v=20260621-fix19" defer></script>

    <!-- PUBLIC JS -->
    <script src="/assets/js/public/public.js?v=20260621-fix10" defer></script>
    <script src="/assets/js/public/home_sections.js?v=20260621-fix" defer></script>
    <script src="/assets/js/integrated-pages-sidebar.js?v=20260621-fix" defer></script>

    <!-- FEATURE JS -->
    <script src="/assets/js/pelayanan.js?v=20260621-fix" defer></script>
    <script src="/assets/js/layanan.js?v=20260621-fix" defer></script>
    <script src="/assets/js/lembaga.js?v=20260621-fix" defer></script>
    <script src="/assets/js/unit-kerja.js?v=20260621-fix" defer></script>

<<<<<<< HEAD
    <!-- ADMIN JS -->
    <script src="/assets/js/admin/admin.js?v=20260621-fix19" defer></script>
    <script src="/assets/js/admin/admin_pagination_fix.js?v=20260621-fix" defer></script>
    <script src="/assets/js/admin/admin-enhance.js?v=20260621-fix13" defer></script>
=======
    <script src="{{ asset('assets/js/public/public.js') }}" defer></script>
    <script src="/assets/js/public/home_sections.js" defer></script>
    <script src="{{ asset('assets/js/admin/admin.js') }}" defer></script>
    <script src="{{ asset('assets/js/staf/staf.js') }}" defer></script>
    <script src="{{ asset('assets/js/staf/buat-surat.js') }}" defer></script>
    <script src="{{ asset('assets/js/staf/arsip-surat.js') }}" defer></script>
    <script src="{{ asset('assets/js/warga/warga.js') }}" defer></script>
>>>>>>> f095065e321e32c52ed71452dd74841c27579e72

    <!-- STAF JS -->
    <script src="/assets/js/staf/staf.js?v=20260621-fix19" defer></script>
    <script src="/assets/js/staf/buat-surat.js?v=20260621-fix" defer></script>
    <script src="/assets/js/staf/arsip-surat.js?v=20260621-fix" defer></script>

    <!-- WARGA JS -->
    <script src="/assets/js/warga/warga.js?v=20260621-fix19" defer></script>
    <script src="/assets/js/warga/dashboard.js?v=20260621-fix" defer></script>
    <script src="/assets/js/warga/pengaduan.js?v=20260621-fix" defer></script>
    <script src="/assets/js/warga/surat.js?v=20260621-fix" defer></script>
</body>
</html>
