
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
    const HR_TO_EMAIL = Deno.env.get('HR_TO_EMAIL') || 'careers@azzurrohotels.com';
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Azzurro Hiring <onboarding@yourdomain.com>';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase server env vars.');
    }
    if (!RESEND_API_KEY) {
      throw new Error('Missing RESEND_API_KEY.');
    }

    const body = await req.json();

    const candidate = body.candidate || {};
    const files = body.files || {};
    const payload = {
      stage: body.stage || '',
      progress: body.progress || 0,
      deviceScore: body.deviceScore || 0,
      submittedAt: body.submittedAt || new Date().toISOString(),
      candidate,
      files,
    };

    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/marketing_candidates`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        first_name: candidate.firstName || null,
        last_name: candidate.lastName || null,
        email: candidate.email || null,
        whatsapp: candidate.whatsapp || null,
        location: candidate.location || null,
        portfolio_url: candidate.portfolioUrl || null,
        tiktok_url: candidate.tiktokUrl || null,
        instagram_url: candidate.instagramUrl || null,
        current_stage: body.stage || null,
        device_score: body.deviceScore || 0,
        progress: body.progress || 0,
        candidate_payload: payload,
      }),
    });

    if (!insertResponse.ok) {
      const message = await insertResponse.text();
      throw new Error(`Failed to insert candidate: ${message}`);
    }

    const inserted = await insertResponse.json();
    const candidateRow = inserted?.[0];
    const candidateId = candidateRow?.id;

    const fileRows = Object.entries(files).map(([fileKey, fileInfo]) => ({
      candidate_id: candidateId,
      file_key: fileKey,
      file_name: fileInfo?.name || null,
      file_path: fileInfo?.path || null,
      public_url: fileInfo?.publicUrl || null,
      file_type: fileInfo?.type || null,
      file_size: fileInfo?.size || null,
    }));

    if (candidateId && fileRows.length) {
      await fetch(`${SUPABASE_URL}/rest/v1/marketing_candidate_files`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fileRows),
      });
    }

    const name = [candidate.firstName, candidate.lastName].filter(Boolean).join(' ') || 'Unnamed candidate';

    const fileLines = Object.entries(files).length
      ? Object.entries(files)
          .map(([key, value]) => `<li><strong>${key}</strong>: <a href="${value.publicUrl}">${value.name}</a></li>`)
          .join('')
      : '<li>No files uploaded</li>';

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2>New Marketing Candidate Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${candidate.email || '-'}</p>
        <p><strong>WhatsApp:</strong> ${candidate.whatsapp || '-'}</p>
        <p><strong>Location:</strong> ${candidate.location || '-'}</p>
        <p><strong>Stage:</strong> ${body.stage || '-'}</p>
        <p><strong>Progress:</strong> ${body.progress || 0}%</p>
        <p><strong>Device Score:</strong> ${body.deviceScore || 0}/100</p>

        <h3>Social / Content Answers</h3>
        <p><strong>Social usage:</strong><br>${candidate.socialUsage || '-'}</p>
        <p><strong>Current trends:</strong><br>${candidate.currentTrends || '-'}</p>
        <p><strong>Favorite influencer:</strong> ${candidate.favoriteInfluencer || '-'}</p>
        <p><strong>Why:</strong><br>${candidate.influencerReason || '-'}</p>
        <p><strong>Ranking notes:</strong><br>${candidate.rankingNotes || '-'}</p>
        <p><strong>Best performing video:</strong> ${candidate.bestPerformingVideo || '-'}</p>
        <p><strong>Why it will perform best:</strong><br>${candidate.bestVideoWhy || '-'}</p>
        <p><strong>What would you change:</strong><br>${candidate.whatWouldYouChange || '-'}</p>
        <p><strong>Focus notes:</strong><br>${candidate.focusNotes || '-'}</p>
        <p><strong>Remake changes:</strong><br>${candidate.remakeChanges || '-'}</p>
        <p><strong>Questions for Lisa:</strong><br>${candidate.questionsForLisa || '-'}</p>

        <h3>Uploaded files</h3>
        <ul>${fileLines}</ul>
      </div>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [HR_TO_EMAIL],
        subject: `New Marketing Candidate Submission - ${name}`,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const resendText = await resendResponse.text();
      throw new Error(`Resend failed: ${resendText}`);
    }

    return new Response(JSON.stringify({ ok: true, candidateId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Unexpected error' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
