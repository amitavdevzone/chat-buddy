<?php

namespace App\Enums;

enum ProviderType: string
{
    use EnumTrait;

    case OPENAI = 'openai';

    case LLAMA = 'llama';
}
