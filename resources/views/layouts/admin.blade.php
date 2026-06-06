<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Admin Panel</title>

    <link rel="stylesheet" href="{{ asset('assets/css/admin.css') }}">
</head>

<body>

@include('partials.sidebar')

<div style="margin-left:270px;padding:20px;">
    @yield('content')
</div>

</body>
</html>
