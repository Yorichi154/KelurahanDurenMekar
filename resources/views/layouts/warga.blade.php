<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Dashboard Warga</title>

    <link rel="stylesheet" href="{{ asset('assets/css/warga.css') }}">
</head>
<body>

@include('partials.sidebar')

<div class="content">
    @yield('content')
</div>

</body>
</html>
