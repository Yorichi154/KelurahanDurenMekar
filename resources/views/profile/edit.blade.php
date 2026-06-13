<!DOCTYPE html>
<html>
<head>
    <title>Edit Profile</title>
</head>
<body>
    <form method="POST" action="{{ route('profile.update') }}">
        @csrf
        @method('patch')
        <input type="text" name="name" value="{{ $user->name }}" required>
        <input type="email" name="email" value="{{ $user->email }}" required>
        <button type="submit">Save</button>
    </form>
    <form method="POST" action="{{ route('profile.destroy') }}">
        @csrf
        @method('delete')
        <input type="password" name="password" required>
        <button type="submit">Delete Account</button>
    </form>
</body>
</html>
