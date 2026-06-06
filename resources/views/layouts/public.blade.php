<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelurahan Duren Mekar</title>

    <link rel="stylesheet" href="{{ asset('assets/css/base.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/layout.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/components.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/pages.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/auth.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/admin.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/staf.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/warga.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/responsive.css') }}">

    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body>

    <header id="header"></header>

    <main id="content"></main>

    <footer id="footer"></footer>


    <script src="{{ asset('assets/js/core/store.js') }}" defer></script>
    <script src="{{ asset('assets/js/core/guard.js') }}" defer></script>
    <script src="{{ asset('assets/js/core/auth.js') }}" defer></script>
    <script src="{{ asset('assets/js/core/main.js') }}" defer></script>


    <script src="{{ asset('assets/js/public/public.js') }}" defer></script>
    <script src="{{ asset('assets/js/admin/admin.js') }}" defer></script>
    <script src="{{ asset('assets/js/staf/staf.js') }}" defer></script>
    <script src="{{ asset('assets/js/warga/warga.js') }}" defer></script>


    <script src="{{ asset('assets/js/unit-kerja.js') }}" defer></script>
    <script src="{{ asset('assets/js/lembaga.js') }}" defer></script>
    <script src="{{ asset('assets/js/pelayanan.js') }}" defer></script>
    <script src="{{ asset('assets/js/layanan.js') }}" defer></script>

</body>
</html>
