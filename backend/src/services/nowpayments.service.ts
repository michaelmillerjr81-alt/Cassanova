import crypto from 'crypto';

const NP_API_KEY = process.env.NOWPAYMENTS_API_KEY || '';
const NP_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || '';
const NP_ENV = process.env.NOWPAYMENTS_ENV || 'sandbox';

const BASE_URL =
  NP_ENV === 'live'
    ? 'https://api.nowpayments.io/v1'
    : 'https://api-sandbox.nowpayments.io/v1';

async function npRequest<T = Record<string, unknown>>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'x-api-key': NP_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = (await response.json()) as T & { message?: string; statusCode?: number };

  if (!response.ok) {
    throw new Error(data.message || `NOWPayments API error: ${response.status}`);
  }

  return data;
}

/* ── Invoices (hosted checkout) ── */

export interface CreateInvoiceParams {
  orderId: string;
  priceAmount: number;
  priceCurrency: string;
  orderDescription: string;
  ipnCallbackUrl: string;
  successUrl: string;
  cancelUrl: string;
}

export interface NowPaymentsInvoice {
  id: string;
  order_id: string;
  order_description: string;
  price_amount: number;
  price_currency: string;
  invoice_url: string;
  created_at: string;
}

export async function createInvoice(params: CreateInvoiceParams): Promise<NowPaymentsInvoice> {
  return npRequest<NowPaymentsInvoice>('/invoice', {
    method: 'POST',
    body: JSON.stringify({
      price_amount: params.priceAmount,
      price_currency: params.priceCurrency,
      order_id: params.orderId,
      order_description: params.orderDescription,
      ipn_callback_url: params.ipnCallbackUrl,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      is_fee_paid_by_user: true,
    }),
  });
}

export async function getPaymentStatus(paymentId: number): Promise<Record<string, unknown>> {
  return npRequest(`/payment/${paymentId}`);
}

/* ── Payouts ── */

const PAYOUT_BASE =
  NP_ENV === 'live'
    ? 'https://api.nowpayments.io/v1'
    : 'https://api-sandbox.nowpayments.io/v1';

async function getPayoutAuthToken(): Promise<string> {
  const response = await fetch(`${PAYOUT_BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.NOWPAYMENTS_EMAIL || '',
      password: process.env.NOWPAYMENTS_PASSWORD || '',
    }),
  });

  const data = (await response.json()) as { token?: string; message?: string };

  if (!response.ok || !data.token) {
    throw new Error(data.message || 'NOWPayments payout auth failed');
  }

  return data.token;
}

export interface CreatePayoutParams {
  amount: number;
  currency: string;
  address: string;
  description?: string;
  platformId?: string;
}

export interface NowPaymentsPayout {
  id: string;
  status: string;
  amount: number;
  currency: string;
  address: string;
}

export async function createPayout(params: CreatePayoutParams): Promise<NowPaymentsPayout> {
  const token = await getPayoutAuthToken();

  const response = await fetch(`${PAYOUT_BASE}/payout`, {
    method: 'POST',
    headers: {
      'x-api-key': NP_API_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      withdrawals: [
        {
          address: params.address,
          currency: params.currency.toLowerCase(),
          amount: params.amount,
          extra_id: params.platformId,
        },
      ],
    }),
  });

  const data = (await response.json()) as { withdrawals?: NowPaymentsPayout[]; message?: string };

  if (!response.ok) {
    throw new Error(data.message || `NOWPayments payout error: ${response.status}`);
  }

  return data.withdrawals?.[0] ?? ({ id: '', status: 'pending', amount: params.amount, currency: params.currency, address: params.address });
}

/* ── IPN Signature Verification ── */

export function verifyIpnSignature(body: Record<string, unknown>, signature: string): boolean {
  if (!NP_IPN_SECRET) return true;

  const sorted = Object.keys(body)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = body[key];
      return acc;
    }, {});

  const hmac = crypto
    .createHmac('sha512', NP_IPN_SECRET)
    .update(JSON.stringify(sorted))
    .digest('hex');

  return hmac === signature;
}

export function isConfigured(): boolean {
  return !!NP_API_KEY;
}
