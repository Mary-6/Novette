<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $path = database_path('seed/novette.sql');
        if (is_file($path)) {
            DB::unprepared(file_get_contents($path));
        }
    }

    public function down(): void
    {
        //
    }
};
