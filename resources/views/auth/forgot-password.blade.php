<!DOCTYPE html>
<html>
<head>
    <title>Lupa Password</title>
</head>
<body>
    <form method="POST" action="{{ route('password.email') }}">
        @csrf
        <input type="email" name="email" required>
        <button type="submit">Kirim Kode OTP</button>
    </form>
</body>
</html>
