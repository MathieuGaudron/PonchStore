<?php

namespace App\Enum;

enum StatutCommandeEnum: string
{
    case EN_ATTENTE = 'EN_ATTENTE';
    case EN_PREPARATION = 'EN_PREPARATION';
    case PRETE = 'PRETE';
    case RECUPEREE = 'RECUPEREE';
    case ANNULEE = 'ANNULEE';
}
