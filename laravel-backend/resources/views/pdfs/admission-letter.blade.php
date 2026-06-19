<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Admission Letter — {{ $app->id }}</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; color: #111; }
  .header { background: #0B5ED7; color: #fff; padding: 24px; }
  .header h1 { margin: 0; font-size: 22px; letter-spacing: 1px; }
  .header p { margin: 4px 0 0; font-size: 12px; opacity: .9; }
  .body { padding: 32px 40px; line-height: 1.6; font-size: 13px; }
  .meta { margin: 16px 0; }
  .meta td { padding: 4px 8px; }
  .sig { margin-top: 60px; }
  .stamp { color: #0B5ED7; font-weight: bold; }
</style>
</head>
<body>
  <div class="header">
    <h1>KENYA EDUCATION MANAGEMENT INSTITUTE</h1>
    <p>Official Admission Letter</p>
  </div>
  <div class="body">
    <p>Date: {{ now()->format('d M Y') }}</p>
    <p>Dear <strong>{{ $app->student->profile->full_name ?? $app->student->email }}</strong>,</p>

    <p>We are pleased to inform you that your application has been
    <span class="stamp">APPROVED</span> and you have been admitted to the following programme:</p>

    <table class="meta" cellpadding="0" cellspacing="0">
      <tr><td><strong>Programme:</strong></td><td>{{ $app->course->title }}</td></tr>
      <tr><td><strong>Duration:</strong></td><td>{{ $app->course->duration }}</td></tr>
      <tr><td><strong>Application ID:</strong></td><td>{{ $app->id }}</td></tr>
    </table>

    <p>Please report on the indicated commencement date with this letter and a national ID.</p>

    <div class="sig">
      <p>____________________________<br>
      Director, Academic & Examinations Council<br>
      <span class="stamp">KEMI</span></p>
    </div>
  </div>
</body>
</html>
