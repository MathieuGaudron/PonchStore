<?php

namespace App\Enum;

enum TypeMouvementEnum: string
{
    case ENTREE = 'ENTREE';
    case SORTIE_AJUSTEMENT = 'SORTIE_AJUSTEMENT';
    case SORTIE_COMMANDE = 'SORTIE_COMMANDE';
}
