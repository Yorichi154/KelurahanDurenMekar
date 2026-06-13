<!DOCTYPE html>
<html>
<head>
    <title>Konfirmasi Password</title>
</head>
<body>
    <form method="POST" action="{{ route('password.confirm') }}">
        @csrf
        <input type="password" name="password" required>
        <button type="submit">Konfirmasi</button>
    </form>
</body>
</html>
