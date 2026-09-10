<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'Laravel') }}</title>
    @viteReactRefresh
    @vite('resources/js/app.jsx') {{-- JS + o CSS de vendor (ícones, Poppins) --}}

    {{-- Nosso CSS, compilado pelo Sass CLI (`npm run sass`). Vem depois do @vite
         para vencer o empate de especificidade. O nome do arquivo é fixo, sem
         hash, então o ?v= com o timestamp é o que fura o cache do navegador. --}}
    @php($appCss = public_path('css/app.css'))
    <link rel="stylesheet" href="{{ asset('css/app.css') }}?v={{ file_exists($appCss) ? filemtime($appCss) : 'dev' }}">

    <x-inertia::head />
</head>
<body>
<x-inertia::app />
</body>
</html>
