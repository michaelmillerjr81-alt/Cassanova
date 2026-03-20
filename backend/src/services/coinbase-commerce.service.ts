import crypto from 'crypto';

const API_URL = 'https://api.commerce.coinbase.com';

function env() {
  return {
    apiKey: process.env.COINBASE_COMMERCE_API_KEY || '',
    webhookSecret: process.env.COINBASE_COMMERCE_WEBHOOK_SECRET || '',
  };
}

async function cbRequest<T = Record<string, unknown>>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'X-CC-Api-Key': env().apiKey,
      'X-CC-Version': '2018-03-22',
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  });

  const json = (await response.json()) as { data?: T; error?: { type: string; message: string } };

  if (!response.ok || json.error) {
    throw new Error(json.error?.message || `Coinbase Commerce API error: ${response.status}`);
  }

  return json.data as T;
}

/* ── Charges (hosted checkout) ── */

export interface CreateChargeParams {
  name: string;
  description: string;
  amountUsd: number;
  orderId: string;
  redirectUrl: string;
  cancelUrl: string;
}

export interface CoinbaseCharge {
  id: string;
  code: string;
  hosted_url: string;
  pricing_type: string;
  timeline: { status: string; time: string }[];
  metadata: Record<string, string>;
}

export async function createCharge(params: CreateChargeParams): Promise<CoinbaseCharge> {
  return cbRequest<CoinbaseCharge>('/charges', {
    method: 'POST',
    body: JSON.stringify({
      name: params.name,
      description: params.description,
      pricing_type: 'fixed_price',
      local_price: {
        amount: params.amountUsd.toFixed(2),
        currency: 'USD',
      },
      metadata: {
        order_id: params.orderId,
      },
      redirect_url: params.redirectUrl,
      cancel_url: params.cancelUrl,
    }),
  });
}

export async function getCharge(chargeCodeOrId: string): Promise<CoinbaseCharge> {
  return cbRequest<CoinbaseCharge>(`/charges/${chargeCodeOrId}`);
}

/* ── Webhook Signature Verification ── */

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = env().webhookSecret;
  if (!secret) return true;

  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
}

export function isConfigured(): boolean {
  return !!env().apiKey;
}
