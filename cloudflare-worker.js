/**
 * Cloudflare Worker – CMS publish + employment email
 *
 * Secrets / vars:
 *   GITHUB_TOKEN, GH_OWNER, GH_REPO, GH_BRANCH, GH_PATH, ADMIN_KEY
 *   RESEND_API_KEY  (from https://resend.com – required to send email)
 *   EMAIL_FROM      (verified sender, e.g. "Black Garter <onboarding@resend.dev>" for testing
 *                   or "Black Garter <noreply@yourdomain.com>" after domain verify)
 *   EMAIL_TO        (optional; default jason@ + tyler@ addresses)
 *
 * POST types:
 *   employment – public (no admin key): { type:"employment", name, nationality, age, contact }
 *   data / image / file / delete – require X-Admin-Key
 */
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }
    if (request.method !== 'POST') {
      return json({ ok: false, message: 'POST only' }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, message: 'Invalid JSON' }, 400);
    }

    const type = body.type || 'data';

    // Public employment applications – no admin key
    if (type === 'employment') {
      return handleEmployment(body, env);
    }

    // All other CMS actions require admin key
    const adminKey = request.headers.get('X-Admin-Key') || '';
    if (env.ADMIN_KEY && adminKey !== env.ADMIN_KEY) {
      return json({ ok: false, message: 'Unauthorized' }, 401);
    }

    const owner = env.GH_OWNER;
    const repo = env.GH_REPO;
    const token = env.GITHUB_TOKEN;
    if (!token || !owner || !repo) {
      return json({ ok: false, message: 'Worker secrets not configured' }, 500);
    }

    if (type === 'delete') {
      const path = body.path;
      if (!path || path.includes('..') || path.startsWith('/')) {
        return json({ ok: false, message: 'Invalid path' }, 400);
      }
      if (!(path.endsWith('.html') || path.startsWith('images/'))) {
        return json({ ok: false, message: 'Delete only allowed for profile HTML or images/' }, 400);
      }
      const protectedFiles = [
        'index.html', 'roster.html', 'pricing.html', 'employment.html',
        'contact.html', 'profile.html', 'admin.html', '404.html'
      ];
      if (protectedFiles.includes(path)) {
        return json({ ok: false, message: 'Cannot delete core site page' }, 400);
      }
      const result = await deleteGitHubFile(env, path, body.message || ('Delete ' + path));
      return json(result, result.ok ? 200 : 502);
    }

    if (type === 'image' || type === 'file') {
      const path = body.path;
      const contentBase64 = body.contentBase64;
      if (!path || !contentBase64) {
        return json({ ok: false, message: 'Missing path or contentBase64' }, 400);
      }
      if (path.includes('..') || path.startsWith('/')) {
        return json({ ok: false, message: 'Invalid path' }, 400);
      }
      if (type === 'image' && !path.startsWith('images/')) {
        return json({ ok: false, message: 'Invalid image path' }, 400);
      }
      if (type === 'file' && !(path.endsWith('.html') || path.startsWith('images/') || path.startsWith('js/'))) {
        return json({ ok: false, message: 'Invalid file path' }, 400);
      }
      const result = await putGitHubFile(env, path, contentBase64, body.message || 'Upload CMS file');
      return json(result, result.ok ? 200 : 502);
    }

    const content = body.content;
    if (!content || typeof content !== 'string') {
      return json({ ok: false, message: 'Missing content' }, 400);
    }
    const path = env.GH_PATH || 'js/data.js';
    const base64 = btoa(unescape(encodeURIComponent(content)));
    const result = await putGitHubFile(env, path, base64, 'Update CMS data via admin');
    if (result.ok) result.message = '✓ Pushed to GitHub. Live for everyone in about 1 minute.';
    return json(result, result.ok ? 200 : 502);
  },
};

async function handleEmployment(body, env) {
  const name = String(body.name || '').trim();
  const nationality = String(body.nationality || '').trim();
  const age = String(body.age || '').trim();
  const contact = String(body.contact || '').trim();
  const photosIn = Array.isArray(body.photos) ? body.photos : [];

  if (!name || !nationality || !age || !contact) {
    return json({ ok: false, message: 'All fields are required' }, 400);
  }
  if (name.length > 200 || nationality.length > 200 || contact.length > 200 || age.length > 20) {
    return json({ ok: false, message: 'Field too long' }, 400);
  }
  if (photosIn.length > 5) {
    return json({ ok: false, message: 'Maximum 5 photos allowed' }, 400);
  }

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return json({
      ok: false,
      message: 'Email not configured on server (missing RESEND_API_KEY)'
    }, 500);
  }

  const from = env.EMAIL_FROM || 'Black Garter 7 ways <onboarding@resend.dev>';
  const toRaw = env.EMAIL_TO || 'jason@platformit.com.au,tyler@platformit.com.au';
  const to = toRaw.split(',').map(s => s.trim()).filter(Boolean);

  const attachments = [];
  for (let i = 0; i < photosIn.length; i++) {
    const p = photosIn[i] || {};
    const content = String(p.content || '').replace(/\s/g, '');
    if (!content) continue;
    // rough size check ~3MB binary
    if (content.length > 4 * 1024 * 1024) {
      return json({ ok: false, message: 'A photo is too large' }, 400);
    }
    let filename = String(p.filename || ('photo-' + (i + 1) + '.jpg')).replace(/[^a-zA-Z0-9._-]/g, '_');
    if (filename.length > 100) filename = filename.slice(0, 100);
    attachments.push({
      filename,
      content: content,
    });
  }

  const text =
    'New employment application – Black Garter 7 ways\n\n' +
    'Name: ' + name + '\n' +
    'Nationality: ' + nationality + '\n' +
    'Age: ' + age + '\n' +
    'Contact: ' + contact + '\n' +
    'Photos attached: ' + attachments.length + '\n\n' +
    'Submitted: ' + new Date().toISOString();

  const html =
    '<h2>New employment application</h2>' +
    '<p><strong>Black Garter 7 ways</strong></p>' +
    '<table style="border-collapse:collapse;font-family:sans-serif">' +
    row('Name', name) +
    row('Nationality', nationality) +
    row('Age', age) +
    row('Contact', contact) +
    row('Photos', String(attachments.length)) +
    '</table>' +
    '<p style="color:#666;font-size:12px">Submitted: ' + new Date().toISOString() + '</p>';

  const payload = {
    from,
    to,
    subject: 'Employment application: ' + name,
    text,
    html,
  };
  if (attachments.length) payload.attachments = attachments;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return json({
        ok: false,
        message: 'Email send failed: ' + (data.message || res.status)
      }, 502);
    }
    return json({
      ok: true,
      message: 'Application submitted. We will be in touch.'
    });
  } catch (e) {
    return json({ ok: false, message: 'Email error: ' + e.message }, 502);
  }
}

function row(label, value) {
  const v = String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return (
    '<tr><td style="padding:6px 12px 6px 0;color:#666">' + label +
    '</td><td style="padding:6px 0"><strong>' + v + '</strong></td></tr>'
  );
}

async function putGitHubFile(env, path, contentBase64, message) {
  const owner = env.GH_OWNER;
  const repo = env.GH_REPO;
  const branch = env.GH_BRANCH || 'main';
  const token = env.GITHUB_TOKEN;
  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  let sha = null;
  const getRes = await fetch(`${apiBase}?ref=${encodeURIComponent(branch)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': '7ways-cms-worker',
    },
  });
  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
  } else if (getRes.status !== 404) {
    const err = await getRes.text();
    return { ok: false, message: `GitHub read failed: ${getRes.status} ${err}` };
  }
  const putBody = { message, content: contentBase64, branch };
  if (sha) putBody.sha = sha;
  const putRes = await fetch(apiBase, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': '7ways-cms-worker',
    },
    body: JSON.stringify(putBody),
  });
  if (!putRes.ok) {
    const err = await putRes.text();
    return { ok: false, message: `GitHub push failed: ${putRes.status} ${err}` };
  }
  const data = await putRes.json();
  return {
    ok: true,
    message: '✓ File saved on GitHub',
    path,
    download_url: data.content && data.content.download_url,
  };
}

async function deleteGitHubFile(env, path, message) {
  const owner = env.GH_OWNER;
  const repo = env.GH_REPO;
  const branch = env.GH_BRANCH || 'main';
  const token = env.GITHUB_TOKEN;
  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const getRes = await fetch(`${apiBase}?ref=${encodeURIComponent(branch)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': '7ways-cms-worker',
    },
  });

  if (getRes.status === 404) {
    return { ok: true, message: 'File already absent on GitHub', path };
  }
  if (!getRes.ok) {
    const err = await getRes.text();
    return { ok: false, message: `GitHub read failed: ${getRes.status} ${err}` };
  }

  const file = await getRes.json();
  const delRes = await fetch(apiBase, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': '7ways-cms-worker',
    },
    body: JSON.stringify({
      message: message || ('Delete ' + path),
      sha: file.sha,
      branch,
    }),
  });

  if (!delRes.ok) {
    const err = await delRes.text();
    return { ok: false, message: `GitHub delete failed: ${delRes.status} ${err}` };
  }
  return { ok: true, message: '✓ File deleted from GitHub', path };
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
    },
  });
}
