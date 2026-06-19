<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;

class CourseController extends Controller
{
    public function index()
    {
        return Course::where('is_active', true)->orderByDesc('created_at')->get();
    }
}
