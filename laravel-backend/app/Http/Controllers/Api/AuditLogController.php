<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Profile;

class AuditLogController extends Controller
{
    public function index()
    {
        $logs = AuditLog::orderByDesc('created_at')->limit(200)->get();
        $profiles = Profile::whereIn('user_id', $logs->pluck('admin_id')->unique())->get()->keyBy('user_id');
        return $logs->map(function ($l) use ($profiles) {
            $row = $l->toArray();
            $row['admin_name'] = optional($profiles[$l->admin_id] ?? null)->full_name ?? 'System';
            return $row;
        });
    }
}
