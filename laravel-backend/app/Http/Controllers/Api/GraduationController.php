<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Graduation;
use App\Models\Profile;

class GraduationController extends Controller
{
    public function index()
    {
        $rows = Graduation::with(['course', 'application'])->orderByDesc('created_at')->get();
        $profiles = Profile::whereIn('user_id', $rows->pluck('student_id')->unique())->get()->keyBy('user_id');
        return $rows->map(function ($g) use ($profiles) {
            $row = $g->toArray();
            $row['course_title']  = optional($g->course)->title ?? '';
            $p = $profiles[$g->student_id] ?? null;
            $row['student_name']  = $p->full_name ?? 'Unknown';
            $row['student_email'] = $p->email ?? '';
            return $row;
        });
    }
}
