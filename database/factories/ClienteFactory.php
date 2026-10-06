<?php

namespace Database\Factories;

use App\Models\Cliente;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cliente>
 */
class ClienteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nome' => fake()->name(),
            'email'=> fake()->unique()->safeEmail(),
            'telefone'=>fake()->numerify(),
            'empresa'=>fake()->company(),
            'status'=>fake()->randomElement(['ativo', 'inativo', 'prospecto'])
            //
        ];
    }
}
