<?php

namespace App\Http\Controllers;

use App\Services\AiBot\AiBotInterface;

class ModelFetchController extends Controller
{
    public function __invoke(AiBotInterface $aiBot)
    {
        $models = $aiBot->getModels();

        return $models;
    }
}
