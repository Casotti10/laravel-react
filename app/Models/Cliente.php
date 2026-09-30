<?php

namespace App\Models;

use Database\Factories\ClienteFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Fillable = campos liberados para Cliente::create($dados).
 * Sem a lista, o create() estoura MassAssignmentException; com a lista,
 * um campo que ficou de fora é ignorado em silêncio.
 */
#[Fillable(['nome', 'email', 'telefone', 'empresa', 'status'])]
class Cliente extends Model
{
    /** @use HasFactory<ClienteFactory> */
    use HasFactory;
}
