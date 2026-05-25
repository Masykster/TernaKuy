<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // PostgreSQL: drop old CHECK constraint and add new one with expanded values
        DB::statement("ALTER TABLE farms DROP CONSTRAINT IF EXISTS farms_species_check");
        DB::statement("ALTER TABLE farms ADD CONSTRAINT farms_species_check CHECK (species::text = ANY (ARRAY['broiler'::text, 'bebek'::text, 'lele'::text, 'nila'::text]))");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE farms DROP CONSTRAINT IF EXISTS farms_species_check");
        DB::statement("ALTER TABLE farms ADD CONSTRAINT farms_species_check CHECK (species::text = ANY (ARRAY['broiler'::text]))");
    }
};
