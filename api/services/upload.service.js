const fetch = global.fetch || require('node-fetch');

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

async function uploadToVercel(name, buffer, mimeType) {
  if (!BLOB_TOKEN) throw new Error('No BLOB_READ_WRITE_TOKEN set in env');
  // NOTE: Vercel Blob API path may vary depending on Vercel API version.
  // This attempts a direct PUT to /v1/blob?name=...
  const url = `https://api.vercel.com/v1/blob?name=${encodeURIComponent(name)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${BLOB_TOKEN}`,
      'Content-Type': mimeType || 'application/octet-stream',
    },
    body: buffer,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  // Return whatever Vercel returns (usually includes url/key)
  return data;
}

module.exports = { uploadToVercel };
