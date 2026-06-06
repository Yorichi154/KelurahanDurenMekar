{{-- resources/views/admin/dashboard.blade.php --}}
@extends('layouts.admin')

@section('content')

<h1>Dashboard Admin</h1>

<div>
    <p>Total Berita : {{ \App\Models\Berita::count() }}</p>

    <p>Total Pengaduan : {{ \App\Models\Pengaduan::count() }}</p>

    <p>Total Surat : {{ \App\Models\Surat::count() }}</p>

    <p>Total Warga : {{ \App\Models\User::where('role','warga')->count() }}</p>
</div>

@endsection
