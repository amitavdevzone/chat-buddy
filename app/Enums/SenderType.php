<?php

namespace App\Enums;

enum SenderType: string
{
    use EnumTrait;

    case USER = 'user';

    case AGENT = 'agent';
}
