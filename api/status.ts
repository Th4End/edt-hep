import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
  }

  const data = {
    status: "ok",
    message: "API is running.",
    timestamp: new Date().toISOString(),
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'N/A',
  };
  
  // Set CORS headers to allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'no-cache');

  return res.status(200).json(data);
}
