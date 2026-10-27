<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Http\Requests\StoreClienteRequest;
use App\Http\Requests\UpdateClienteRequest;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;


class ClienteController extends Controller
{

    public function index() //ponte entre o backend e o frontend
    {
        return Inertia::render('Clientes/Index', [
            'clientes' => Cliente::latest()->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Clientes/Form');
    }

    public function store(StoreClienteRequest $request): RedirectResponse
    {
        Cliente::create($request->validated()); // validated(): só os campos que passaram pelas regras

        return redirect()->route('clientes.index')
            ->with('success', 'Cliente cadastrado com sucesso.'); // flash: vive uma requisição só
    }


    public function edit(Cliente $cliente): Response
    {
        //Route model binding: o Laravel viu o tipo Cliente e o {cliente} da URL
        //buscou no banco e devolve 404 sozinho se nao achar
        return Inertia::render('Clientes/Form', [
           'cliente' => $cliente, // com prop "cliente" no modo edição
        ]);
    }

    public function update(UpdateClienteRequest $request, Cliente $cliente): RedirectResponse
    {
        $cliente->update($request->validated());

        return redirect()->route('clientes.index')
            ->with('success', 'Cliente atualizado');
    }

    public function destroy(Cliente $cliente)
    {
        $cliente->delete();

        return redirect()->route('clientes.index')
        ->with('success', 'Cliente Exlcuido');

    }
}
