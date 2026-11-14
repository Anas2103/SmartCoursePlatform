<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate of Completion</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'DejaVu Serif', Georgia, serif;
      background: #fff;
      color: #1a1a2e;
      width: 297mm;
      height: 210mm;
      overflow: hidden;
    }

    .certificate {
      width: 100%;
      height: 100%;
      position: relative;
      padding: 20mm 25mm;
      background: linear-gradient(135deg, #fefefe 0%, #f8f6ff 100%);
    }

    /* Decorative borders */
    .border-outer {
      position: absolute;
      inset: 6mm;
      border: 3px solid #6366f1;
    }
    .border-inner {
      position: absolute;
      inset: 9mm;
      border: 1px solid #a5b4fc;
    }

    /* Corner ornaments */
    .corner {
      position: absolute;
      width: 20mm;
      height: 20mm;
      border-color: #6366f1;
      border-style: solid;
    }
    .corner-tl { top: 5mm; left: 5mm; border-width: 3px 0 0 3px; }
    .corner-tr { top: 5mm; right: 5mm; border-width: 3px 3px 0 0; }
    .corner-bl { bottom: 5mm; left: 5mm; border-width: 0 0 3px 3px; }
    .corner-br { bottom: 5mm; right: 5mm; border-width: 0 3px 3px 0; }

    .content {
      position: relative;
      z-index: 1;
      text-align: center;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .logo-area {
      margin-bottom: 6mm;
    }

    .platform-name {
      font-family: 'DejaVu Sans', Arial, sans-serif;
      font-size: 14pt;
      font-weight: bold;
      color: #6366f1;
      letter-spacing: 3px;
      text-transform: uppercase;
    }

    .certificate-label {
      font-size: 10pt;
      letter-spacing: 6px;
      text-transform: uppercase;
      color: #6b7280;
      margin-top: 2mm;
      margin-bottom: 6mm;
      font-family: 'DejaVu Sans', Arial, sans-serif;
    }

    .divider {
      width: 60mm;
      height: 1px;
      background: linear-gradient(to right, transparent, #6366f1, transparent);
      margin: 4mm auto;
    }

    .presented-to {
      font-size: 9pt;
      color: #9ca3af;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-family: 'DejaVu Sans', Arial, sans-serif;
      margin-bottom: 4mm;
    }

    .student-name {
      font-size: 32pt;
      color: #1e1b4b;
      font-style: italic;
      letter-spacing: 1px;
      margin-bottom: 6mm;
      line-height: 1.2;
    }

    .completion-text {
      font-size: 10pt;
      color: #4b5563;
      font-family: 'DejaVu Sans', Arial, sans-serif;
      margin-bottom: 3mm;
    }

    .course-title {
      font-size: 18pt;
      color: #6366f1;
      font-weight: bold;
      font-family: 'DejaVu Sans', Arial, sans-serif;
      margin-bottom: 8mm;
      max-width: 200mm;
      line-height: 1.3;
    }

    .signatures {
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-top: 8mm;
    }

    .signature-block {
      text-align: center;
      width: 55mm;
    }

    .signature-line {
      border-top: 1px solid #9ca3af;
      margin-bottom: 2mm;
    }

    .signature-name {
      font-size: 9pt;
      font-weight: bold;
      color: #374151;
      font-family: 'DejaVu Sans', Arial, sans-serif;
    }

    .signature-title {
      font-size: 7pt;
      color: #9ca3af;
      font-family: 'DejaVu Sans', Arial, sans-serif;
    }

    .meta-row {
      display: flex;
      justify-content: center;
      gap: 12mm;
      margin-top: 6mm;
    }

    .meta-item {
      text-align: center;
    }

    .meta-label {
      font-size: 7pt;
      color: #9ca3af;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-family: 'DejaVu Sans', Arial, sans-serif;
    }

    .meta-value {
      font-size: 9pt;
      color: #374151;
      font-family: 'DejaVu Sans', Arial, sans-serif;
      margin-top: 1mm;
    }

    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 80pt;
      color: #6366f1;
      opacity: 0.03;
      font-family: 'DejaVu Serif', Georgia, serif;
      white-space: nowrap;
      pointer-events: none;
    }

    .seal {
      position: absolute;
      right: 28mm;
      bottom: 18mm;
      width: 28mm;
      height: 28mm;
      border: 3px solid #6366f1;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }

    .seal-inner {
      border: 1px solid #a5b4fc;
      border-radius: 50%;
      width: 22mm;
      height: 22mm;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }

    .seal-text {
      font-size: 5.5pt;
      color: #6366f1;
      text-align: center;
      font-family: 'DejaVu Sans', Arial, sans-serif;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <!-- Decorative borders -->
    <div class="border-outer"></div>
    <div class="border-inner"></div>

    <!-- Corner ornaments -->
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <!-- Watermark -->
    <div class="watermark">SmartCourse</div>

    <!-- Seal -->
    <div class="seal">
      <div class="seal-inner">
        <div class="seal-text">Verified<br>Certificate<br>of Completion</div>
      </div>
    </div>

    <div class="content">
      <div class="logo-area">
        <div class="platform-name">SmartCourse</div>
        <div class="certificate-label">Certificate of Completion</div>
      </div>

      <div class="divider"></div>

      <div class="presented-to">This certificate is proudly presented to</div>

      <div class="student-name">{{ $certificate->user->name }}</div>

      <div class="completion-text">for successfully completing the course</div>

      <div class="course-title">{{ $certificate->course->title }}</div>

      <div class="divider"></div>

      <div class="meta-row">
        <div class="meta-item">
          <div class="meta-label">Date of Issue</div>
          <div class="meta-value">{{ \Carbon\Carbon::parse($certificate->issued_at)->format('F d, Y') }}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Instructor</div>
          <div class="meta-value">{{ $certificate->course->teacher->name }}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Credential ID</div>
          <div class="meta-value">{{ $certificate->certificate_number ?? strtoupper(substr(md5($certificate->id), 0, 12)) }}</div>
        </div>
      </div>

      <div class="signatures">
        <div class="signature-block">
          <div class="signature-line"></div>
          <div class="signature-name">{{ $certificate->course->teacher->name }}</div>
          <div class="signature-title">Course Instructor</div>
        </div>
        <div class="signature-block">
          <div class="signature-line"></div>
          <div class="signature-name">SmartCourse Platform</div>
          <div class="signature-title">CEO & Co-Founder</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
