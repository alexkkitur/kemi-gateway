<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\FeeItem;
use App\Models\Profile;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin accounts
        $accounts = [
            ['Super Admin',        'superadmin@kemi.local', 'super_admin'],
            ['Admission Officer',  'admin@kemi.local',      'admission_officer'],
            ['DD AEC',             'ddaec@kemi.local',      'dd_aec'],
            ['DD CD&T',            'ddcdt@kemi.local',      'dd_cdt'],
            ['Test Student',       'student@kemi.local',    'student'],
        ];

        foreach ($accounts as [$name, $email, $role]) {
            $user = User::firstOrCreate(
                ['email' => $email],
                ['password' => Hash::make('password')]
            );
            Profile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'full_name'        => $name,
                    'email'            => $email,
                    'tsc_number'       => $role === 'student' ? 'TSC/0001/2024' : null,
                    'profile_complete' => $role !== 'student',
                ]
            );
            UserRole::firstOrCreate(['user_id' => $user->id, 'role' => $role]);
        }

        // KEMI training programmes
        $courses = [
            ['Strategic Leadership and Management',       'SLM-101',  '8 weeks',  'Advanced',     'Leadership',  30, 35000],
            ['Public Sector Financial Management',        'PSFM-201', '6 weeks',  'Intermediate', 'Finance',     40, 28000],
            ['Education Policy and Planning',             'EPP-301',  '10 weeks', 'Advanced',     'Policy',      25, 42000],
            ['Procurement and Supply Chain',              'PSC-110',  '4 weeks',  'Beginner',     'Procurement', 50, 18000],
            ['Monitoring and Evaluation',                 'ME-220',   '6 weeks',  'Intermediate', 'Research',    35, 26000],
            ['Digital Transformation for Public Servants','DTP-330',  '5 weeks',  'Intermediate', 'ICT',         45, 22000],
        ];

        foreach ($courses as [$title, $code, $duration, $level, $cat, $cap, $fee]) {
            Course::firstOrCreate(
                ['code' => $code],
                [
                    'title'       => $title,
                    'description' => "$title — KEMI institutional training programme.",
                    'duration'    => $duration,
                    'level'       => $level,
                    'category'    => $cat,
                    'capacity'    => $cap,
                    'fee'         => $fee,
                    'is_active'   => true,
                ]
            );
        }

        // Fee items catalogue
        $feeItems = [
            ['Registration Fee',  'registration', 2000],
            ['Transcript Fee',    'transcript',   1500],
            ['Exam Card Fee',     'exam_card',    1000],
            ['Unit Fee',          'unit',         3000],   // per unit
        ];

        foreach ($feeItems as [$name, $category, $amount]) {
            FeeItem::firstOrCreate(
                ['category' => $category],
                ['name' => $name, 'amount' => $amount, 'is_active' => true]
            );
        }
    }
}
