<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // database/migrations/xxxx_create_clientes_table.php
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('email')->unique();          // unique no banco: a validacao sozinha tem corrida de dois cadastros simultaneos
            $table->string('telefone', 20)->nullable();
            $table->string('empresa')->nullable();
            $table->string('status')->default('prospecto');
            $table->timestamps();        // created_at e updated_at, mantidos pelo Eloquent
        });
    }
};
