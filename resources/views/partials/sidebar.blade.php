<div style="width:250px;background:#2c3e50;color:white;height:100vh;padding:20px;position:fixed;">

    <h2>Admin</h2>

    <hr>

    <p>
        <a href="{{ route('admin.dashboard') }}" style="color:white">
            Dashboard
        </a>
    </p>

    <p>
        <a href="#" style="color:white">
            Berita
        </a>
    </p>

    <p>
        <a href="#" style="color:white">
            Pengaduan
        </a>
    </p>

    <p>
        <a href="#" style="color:white">
            Surat
        </a>
    </p>

    <hr>

    <form method="POST" action="{{ route('logout') }}">
        @csrf
        <button type="submit">
            Logout
        </button>
    </form>

</div>
