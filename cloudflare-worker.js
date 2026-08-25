/**
 * Cloudflare Worker – Option C CMS publish, image upload, file delete
 * Secrets: GITHUB_TOKEN, GH_OWNER, GH_REPO, GH_BRANCH, GH_PATH, ADMIN_KEY
 *
 * POST types:
 *   { type:"data", content:"..." }
 *   { type:"image"|"file", path:"...", contentBase64:"..." }
 *   { type:"delete", path:"name.html" }
 */
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
        },
      });
    }
    if (request.method !== 'POST') {
      return json({ ok: false, message: 'POST only' }, 405);
    }
    const adminKey = request.headers.get('X-Admin-Key') || '';
    if (env.ADMIN_KEY && adminKey !== env.ADMIN_KEY) {
      return json({ ok: false, message: 'Unauthorized' }, 401);
    }
    let body;
    try { body = await request.json(); } catch {
      return json({ ok: false, message: 'Invalid JSON' }, 400);
    }
    const type = body.type || 'data';
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
      // Only allow deleting profile HTML pages or files under images/
      if (!(path.endsWith('.html') || path.startsWith('images/'))) {
        return json({ ok: false, message: 'Delete only allowed for profile HTML or images/' }, 400);
      }
      // Never delete core site pages
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

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
