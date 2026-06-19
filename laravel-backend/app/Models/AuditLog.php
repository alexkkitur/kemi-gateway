<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasUuids;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = [];
    protected $casts = ['metadata' => 'array'];

    public static function log(string $adminId, string $action, string $table, ?string $recordId = null, ?string $reason = null, array $meta = []): self
    {
        return self::create([
            'admin_id'         => $adminId,
            'action_type'      => $action,
            'target_table'     => $table,
            'target_record_id' => $recordId,
            'reason'           => $reason,
            'metadata'         => $meta ?: null,
        ]);
    }
}
