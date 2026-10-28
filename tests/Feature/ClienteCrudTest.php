<?php

use App\Models\Cliente;
use App\Models\User;

it('cria um cliente', function () {
    $this->actingAs(User::factory()->create())
        ->post('/clientes', [
            'nome' => 'Acme',
            'email' => 'contato@acme.test',
            'status' => 'ativo',
        ])
        ->assertRedirect('/clientes');

    expect(Cliente::where('email', 'contato@acme.test')->exists())->toBeTrue();
});

it('recusa e-mail duplicado', function () {
    $cliente = Cliente::factory()->create();

    $this->actingAs(User::factory()->create())
        ->post('/clientes', ['nome' => 'X', 'email' => $cliente->email, 'status' => 'ativo'])
        ->assertSessionHasErrors('email');
});

it('bloqueia visitante', function () {
    $this->get('/clientes')->assertRedirect('/login');
});
