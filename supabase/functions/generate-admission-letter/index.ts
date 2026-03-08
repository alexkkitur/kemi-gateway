import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { application_id } = await req.json();

    if (!application_id) {
      return new Response(
        JSON.stringify({ error: "application_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get application details
    const { data: app, error: appError } = await supabase
      .from("applications")
      .select("*, courses(title, duration, fee, start_date)")
      .eq("id", application_id)
      .single();

    if (appError || !app) {
      return new Response(
        JSON.stringify({ error: "Application not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get student profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, id_number")
      .eq("user_id", app.student_id)
      .single();

    const studentName = profile?.full_name || "Student";
    const course = (app as any).courses;
    const today = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Generate HTML admission letter
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Times New Roman', serif; margin: 0; padding: 40px; color: #1a1a2e; }
    .header { text-align: center; border-bottom: 3px solid #0a6bbd; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #0a6bbd; font-size: 24px; margin: 5px 0; }
    .header h2 { color: #333; font-size: 16px; font-weight: normal; margin: 5px 0; }
    .header p { color: #666; font-size: 12px; margin: 3px 0; }
    .ref { text-align: right; margin-bottom: 20px; font-size: 13px; }
    .date { text-align: right; margin-bottom: 20px; font-size: 13px; }
    .body-text { font-size: 14px; line-height: 1.8; margin-bottom: 15px; }
    .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .details-table td { padding: 8px 12px; border: 1px solid #ddd; font-size: 13px; }
    .details-table td:first-child { background: #f0f7ff; font-weight: bold; width: 35%; color: #0a6bbd; }
    .signature { margin-top: 50px; }
    .signature-line { border-top: 1px solid #333; width: 250px; margin-top: 40px; padding-top: 5px; font-size: 13px; }
    .footer { text-align: center; margin-top: 50px; padding-top: 15px; border-top: 2px solid #0a6bbd; font-size: 11px; color: #666; }
    .stamp { display: inline-block; border: 2px solid #0a6bbd; border-radius: 5px; padding: 5px 15px; color: #0a6bbd; font-weight: bold; font-size: 14px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>KENYA EDUCATION MANAGEMENT INSTITUTE</h1>
    <h2>KEMI</h2>
    <p>P.O. Box 62592-00200, Nairobi, Kenya | Tel: +254 20 2710571</p>
    <p>Email: info@kemi.ac.ke | Website: www.kemi.ac.ke</p>
  </div>

  <div class="ref">Ref: KEMI/ADM/${application_id.slice(0, 8).toUpperCase()}/${new Date().getFullYear()}</div>
  <div class="date">${today}</div>

  <div class="body-text">
    <p>Dear <strong>${studentName}</strong>,</p>

    <p><strong>RE: ADMISSION TO ${course?.title?.toUpperCase() || "TRAINING PROGRAMME"}</strong></p>

    <p>Following your application and subsequent approval, we are pleased to inform you that you have been
    admitted to the above-mentioned training programme at the Kenya Education Management Institute (KEMI).</p>

    <p>Please find below the details of your training programme:</p>
  </div>

  <table class="details-table">
    <tr><td>Programme</td><td>${course?.title || "N/A"}</td></tr>
    <tr><td>Duration</td><td>${course?.duration || "N/A"}</td></tr>
    <tr><td>Commencement Date</td><td>${course?.start_date || "To Be Advised"}</td></tr>
    <tr><td>Training Fee</td><td>KES ${course?.fee ? Number(course.fee).toLocaleString() : "N/A"}</td></tr>
    <tr><td>Admission Number</td><td>KEMI/${new Date().getFullYear()}/${application_id.slice(0, 6).toUpperCase()}</td></tr>
    <tr><td>Student Name</td><td>${studentName}</td></tr>
    ${profile?.id_number ? `<tr><td>ID Number</td><td>${profile.id_number}</td></tr>` : ""}
    ${profile?.email ? `<tr><td>Email</td><td>${profile.email}</td></tr>` : ""}
  </table>

  <div class="body-text">
    <p>You are required to report on the commencement date with the following:</p>
    <ol>
      <li>A copy of this admission letter</li>
      <li>Original proof of payment</li>
      <li>A copy of your National ID/Passport</li>
      <li>Two recent passport-size photographs</li>
    </ol>

    <p>Kindly confirm your attendance by responding to this communication within 7 days of receipt.</p>

    <p>We look forward to welcoming you to KEMI.</p>
  </div>

  <div class="signature">
    <p>Yours faithfully,</p>
    <div class="signature-line">
      <strong>Deputy Director, Accreditation, Examinations & Certification</strong><br>
      Kenya Education Management Institute
    </div>
    <div class="stamp">APPROVED</div>
  </div>

  <div class="footer">
    <p>This is a computer-generated letter and is valid without a physical signature.</p>
    <p>Kenya Education Management Institute | ISO 9001:2015 Certified</p>
  </div>
</body>
</html>`;

    // Store the letter as HTML file in storage
    const fileName = `${app.student_id}/${application_id}/admission-letter.html`;
    const encoder = new TextEncoder();
    const htmlBytes = encoder.encode(html);

    const { error: uploadError } = await supabase.storage
      .from("admission-letters")
      .upload(fileName, htmlBytes, {
        contentType: "text/html",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to upload letter: " + uploadError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get signed URL (valid for 7 days)
    const { data: signedUrlData } = await supabase.storage
      .from("admission-letters")
      .createSignedUrl(fileName, 604800); // 7 days

    const fileUrl = signedUrlData?.signedUrl || fileName;

    // Save admission letter record
    await supabase.from("admission_letters").insert({
      application_id,
      file_url: fileUrl,
    });

    return new Response(
      JSON.stringify({ success: true, file_url: fileUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
