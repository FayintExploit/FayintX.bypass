// api/bypass.js — Vercel Serverless Function
// FayintzBypass | Powered by BaconBypass + bypass.vip

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

async function tryBacon(url) {
  const params = new URLSearchParams({
    url,
    apikey: 'Bacon-1db972aa217f4ffe58dc-24fa4c1b89cd8a330bad'
  });
  const res = await fetch(`https://baconbypass.online/bypass?${params}`, {
    headers: { 'User-Agent': UA }
  });
  const data = await res.json();
  if (data.status === 'success' && data.result) return data.result;
  throw new Error(data.message || 'BaconBypass: no result');
}

async function tryBypassVip(url) {
  const res = await fetch(`https://bypass.vip/bypass?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': UA, 'Accept': 'application/json' }
  });
  const data = await res.json();
  const result = data.result || data.bypassed || data.url || data.destination;
  if (result && typeof result === 'string') return result;
  throw new Error(data.message || data.error || 'bypass.vip: no result');
}

async function tryBypassCity(url) {
  const res = await fetch(`https://api.bypass.city/bypass?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': UA }
  });
  const data = await res.json();
  const result = data.result || data.bypassed || data.url;
  if (result && typeof result === 'string') return result;
  throw new Error('bypass.city: no result');
}

async function tryBypassBot(url) {
  const res = await fetch(`https://bypass.bot.nu/bypass2?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': UA }
  });
  const data = await res.json();
  const result = data.result || data.bypassed || data.url;
  if (result && typeof result === 'string') return result;
  throw new Error('bypass.bot.nu: no result');
}

const NODES = [
  { name: 'BaconBypass',   fn: tryBacon },
  { name: 'bypass.vip',    fn: tryBypassVip },
  { name: 'bypass.city',   fn: tryBypassCity },
  { name: 'bypass.bot.nu', fn: tryBypassBot }
];

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ status: 'error', message: 'Missing ?url= parameter' });
  }

  try { new URL(url); } catch {
    return res.status(400).json({ status: 'error', message: 'Invalid URL' });
  }

  const errors = [];

  for (const node of NODES) {
    try {
      const result = await node.fn(url);
      return res.status(200).json({ status: 'success', result, node: node.name });
    } catch (e) {
      errors.push(`${node.name}: ${e.message}`);
    }
  }

  return res.status(502).json({
    status: 'error',
    message: 'All bypass nodes failed',
    details: errors
  });
}
