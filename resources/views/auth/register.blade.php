<!DOCTYPE html>
<html>
<head>
    <title>Daftar Akun</title>
</head>
<body>
    <form method="POST" action="{{ route('register') }}">
        @csrf
        <input type="text" name="name" required>
        <input type="email" name="email" required>
        <input type="text" name="nik" required>
        <input type="text" name="telp" required>
        <input type="text" name="alamat" required>
        <input type="text" name="rt" required>
        <input type="text" name="rw" required>
        <input type="password" name="password" required>
        <input type="password" name="password_confirmation" required>
        <button type="submit">Daftar</button>
    </form>
</body>
</html>
