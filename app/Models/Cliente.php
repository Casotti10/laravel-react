<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    /** @use HasFactory<\Database\Factories\ClienteFactory> */
    use HasFactory;

/**
 * Campos liberados para preenchimento em massa.
 * Sem esta lista, Cliente::create() ignora tudo e salva um registro vazio.
 */
protected $fillable = [

    ];
}
