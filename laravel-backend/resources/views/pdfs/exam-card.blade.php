<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Exam Card — {{ $card->card_number }}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1a1a1a; background: #fff; }

  .card-wrapper { border: 3px solid #0B5ED7; border-radius: 6px; padding: 0; overflow: hidden; }

  /* Header */
  .header { background: #0B5ED7; color: #fff; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; }
  .header .org { font-size: 13px; font-weight: bold; letter-spacing: 0.5px; }
  .header .sub { font-size: 9px; opacity: 0.85; margin-top: 2px; }
  .header .card-no { font-size: 11px; font-family: monospace; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 3px; }

  /* Student details */
  .student-section { padding: 10px 16px; background: #f0f6ff; border-bottom: 1px solid #cde; display: flex; justify-content: space-between; gap: 16px; }
  .student-section .field { }
  .student-section .label { font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; color: #555; }
  .student-section .value { font-size: 11px; font-weight: bold; color: #0B5ED7; margin-top: 2px; }

  /* Notice strip */
  .notice { background: #fff3cd; border-bottom: 1px solid #ffc107; padding: 5px 16px; font-size: 9px; color: #856404; }

  /* Units table */
  .units-section { padding: 10px 16px; }
  .units-section h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #555; margin-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #0B5ED7; color: #fff; font-size: 9px; text-transform: uppercase; letter-spacing: 0.3px; padding: 5px 8px; text-align: left; }
  td { padding: 5px 8px; font-size: 10px; border-bottom: 1px solid #e8ecf0; }
  tr:nth-child(even) td { background: #f8fafc; }
  .center { text-align: center; }

  /* Footer */
  .footer { padding: 8px 16px; border-top: 1px solid #dde; display: flex; justify-content: space-between; align-items: flex-end; font-size: 9px; color: #666; }
  .sig-line { border-top: 1px solid #333; width: 120px; padding-top: 3px; font-size: 8px; color: #444; }
  .stamp { display: inline-block; border: 2px solid #0B5ED7; color: #0B5ED7; font-weight: bold; font-size: 10px; padding: 3px 10px; border-radius: 3px; letter-spacing: 1px; transform: rotate(-5deg); }
</style>
</head>
<body>
<div class="card-wrapper">

  <!-- Header -->
  <div class="header">
    <div>
      <div class="org">KENYA EDUCATION MANAGEMENT INSTITUTE</div>
      <div class="sub">EXAMINATION CARD &nbsp;|&nbsp; {{ $card->exam_series ?? 'Current Series' }}</div>
    </div>
    <div class="card-no">{{ $card->card_number }}</div>
  </div>

  <!-- Student info -->
  <div class="student-section">
    <div class="field">
      <div class="label">Student Name</div>
      <div class="value">{{ $profile->full_name ?? 'N/A' }}</div>
    </div>
    <div class="field">
      <div class="label">TSC / DELM No.</div>
      <div class="value">{{ $profile->tsc_number ?? $profile->delm_number ?? 'N/A' }}</div>
    </div>
    <div class="field">
      <div class="label">National ID</div>
      <div class="value">{{ $profile->id_number ?? 'N/A' }}</div>
    </div>
    <div class="field">
      <div class="label">Programme</div>
      <div class="value">{{ $card->course->title ?? 'N/A' }}</div>
    </div>
    @if($card->exam_start_date)
    <div class="field">
      <div class="label">Exam Period</div>
      <div class="value">
        {{ $card->exam_start_date->format('d M Y') }}
        @if($card->exam_end_date) — {{ $card->exam_end_date->format('d M Y') }} @endif
      </div>
    </div>
    @endif
  </div>

  <!-- Notice -->
  <div class="notice">
    ⚠ This card must be presented at every examination sitting. It is non-transferable. Report any discrepancy immediately.
  </div>

  <!-- Units -->
  <div class="units-section">
    <h3>Registered Units ({{ $card->units_count }})</h3>
    <table>
      <thead>
        <tr>
          <th style="width:60px">Unit Code</th>
          <th>Unit Name</th>
          <th class="center" style="width:90px">Exam Date</th>
          <th class="center" style="width:60px">Invigilator</th>
        </tr>
      </thead>
      <tbody>
        @foreach($card->units as $unit)
        <tr>
          <td><strong>{{ $unit['code'] }}</strong></td>
          <td>{{ $unit['name'] }}</td>
          <td class="center">{{ isset($unit['exam_date']) ? \Carbon\Carbon::parse($unit['exam_date'])->format('d M Y') : '—' }}</td>
          <td class="center">___________</td>
        </tr>
        @endforeach
      </tbody>
    </table>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div>
      <div class="sig-line">Registrar, Examinations</div>
    </div>
    <div class="stamp">{{ strtoupper($card->status) }}</div>
    <div style="text-align:right">
      <div>Issued: {{ $card->issued_at ? $card->issued_at->format('d M Y') : now()->format('d M Y') }}</div>
      <div>Valid for: {{ $card->exam_series ?? 'Current Examination Series' }}</div>
    </div>
  </div>

</div>
</body>
</html>
