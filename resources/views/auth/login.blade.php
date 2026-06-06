<!DOCTYPE html>
<html>
<head>
    <title>Login Kelurahan</title>
</head>
<body>

<h2>Login Kelurahan</h2>

@if ($errors->any())
    <div style="color:red;">
        {{ $errors->first() }}
    </div>
@endif

<form method="POST" action="{{ route('login') }}">
    @csrf

    <div>
        <label>Email</label>
        <input type="email" name="email" required>
    </div>

    <br>

    <div>
        <label>Password</label>
        <input type="password" name="password" required>
    </div>

    <br>

    <button type="submit">
        Login
    </button>

</form>

</body>
</html>
