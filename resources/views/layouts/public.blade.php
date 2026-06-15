<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelurahan Duren Mekar</title>

    <link rel="stylesheet" href="{{ asset('assets/css/base.css') }}?v={{ time() }}">
    <link rel="stylesheet" href="{{ asset('assets/css/layout.css') }}?v={{ time() }}">
    <link rel="stylesheet" href="{{ asset('assets/css/components.css') }}?v={{ time() }}">
    <link rel="stylesheet" href="{{ asset('assets/css/pages.css') }}?v={{ time() }}">
    <link rel="stylesheet" href="{{ asset('assets/css/auth.css') }}?v={{ time() }}">
    <link rel="stylesheet" href="{{ asset('assets/css/admin.css') }}?v={{ time() }}">
    <link rel="stylesheet" href="{{ asset('assets/css/staf.css') }}?v={{ time() }}">
    <link rel="stylesheet" href="{{ asset('assets/css/warga.css') }}?v={{ time() }}">
    <link rel="stylesheet" href="{{ asset('assets/css/responsive.css') }}?v={{ time() }}">
    <link rel="stylesheet" href="{{ asset('assets/css/enhance.css') }}?v={{ time() }}">

    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body>

    <header id="header"></header>

    <main id="content"></main>

    <footer id="footer"></footer>


    <script src="{{ asset('assets/js/core/store.js') }}?v={{ time() }}" defer></script>
    <script src="{{ asset('assets/js/core/guard.js') }}?v={{ time() }}" defer></script>
    <script src="{{ asset('assets/js/core/auth.js') }}?v={{ time() }}" defer></script>
    <script src="{{ asset('assets/js/core/main.js') }}?v={{ time() }}" defer></script>


    <script src="{{ asset('assets/js/public/public.js') }}" defer></script>
    <script src="{{ asset('assets/js/admin/admin.js') }}" defer></script>
    <script src="{{ asset('assets/js/staf/staf.js') }}" defer></script>
    <script src="{{ asset('assets/js/staf/buat-surat.js') }}" defer></script>
    <script src="{{ asset('assets/js/staf/arsip-surat.js') }}" defer></script>
    <script src="{{ asset('assets/js/warga/warga.js') }}" defer></script>


    <script src="{{ asset('assets/js/unit-kerja.js') }}" defer></script>
    <script src="{{ asset('assets/js/lembaga.js') }}" defer></script>
    <script src="{{ asset('assets/js/pelayanan.js') }}" defer></script>
    <script src="{{ asset('assets/js/layanan.js') }}" defer></script>

</body>
</html>
