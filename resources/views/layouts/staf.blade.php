<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Dashboard Staf</title>

    <link rel="stylesheet" href="{{ asset('assets/css/staf.css') }}">
</head>
<body>

@include('partials.sidebar')

<div class="content">
    @yield('content')
</div>

</body>
</html>
