<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Certificate — {{ $cert->certificate_number }}</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; color: #111; text-align: center; }
  .frame { border: 12px solid #0B5ED7; padding: 60px; margin: 40px; }
  h1 { color: #0B5ED7; font-size: 32px; margin: 0; }
  h2 { font-size: 18px; margin: 16px 0; letter-spacing: 4px; color: #333; }
  .name { font-size: 28px; margin: 30px 0; font-weight: bold; }
  .course { font-size: 18px; margin: 10px 0; font-style: italic; }
  .number { margin-top: 60px; font-size: 11px; color: #666; }
</style>
</head>
<body>
  <div class="frame">
    <h1>KENYA EDUCATION MANAGEMENT INSTITUTE</h1>
    <h2>CERTIFICATE OF COMPLETION</h2>
    <p>This is to certify that</p>
    <div class="name">{{ $cert->student_profile->full_name ?? '' }}</div>
    <p>has successfully completed the programme</p>
    <div class="course">{{ optional($cert->course)->title }}</div>
    <p>on {{ optional($cert->issued_date)->format('d F Y') }}</p>
    <div class="number">
      Certificate No: <strong>{{ $cert->certificate_number }}</strong>
    </div>
  </div>
</body>
</html>
