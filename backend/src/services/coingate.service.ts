const COINGATE_API_KEY = process.env.COINGATE_API_KEY || '';
const COINGATE_ENV = process.env.COINGATE_ENV || 'sandbox';

const BASE_URL =
  COINGATE_ENV === 'live'
    ? 'https://api.coingate.com/api/v2'
    : 'https://api-sandbox.coingate.com/api/v2';

async function coingateRequest<T = Record<string, unknown>>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Token ${COINGATE_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = (await response.json()) as T & { message?: string };

  if (!response.ok) {
    throw new Error(data.message || `CoinGate API error: ${response.status}`);
  }

  return data;
}

export interface CreateOrderParams {
  orderId: string;
  priceAmount: number;
  priceCurrency: string;
  receiveCurrency: string;
  title: string;
  description: string;
  callbackUrl: string;
  successUrl: string;
  cancelUrl: string;
  purchaserEmail?: string;
}

export interface CoinGateOrder {
  id: number;
  status: string;
  price_amount: string;
  price_currency: string;
  receive_currency: string;
  receive_amount: string;
  payment_url: string;
  token: string;
  order_id: string;
  created_at: string;
  pay_currency?: string;
  pay_amount?: string;
}

export async function createOrder(params: CreateOrderParams): Promise<CoinGateOrder> {
  const body: Record<string, unknown> = {
    order_id: params.orderId,
    price_amount: params.priceAmount,
    price_currency: params.priceCurrency,
    receive_currency: params.receiveCurrency,
    title: params.title,
    description: params.description,
    callback_url: params.callbackUrl,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  };

  if (params.purchaserEmail) {
    body.shopper = { email: params.purchaserEmail };
  }

  return coingateRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getOrder(coingateOrderId: number): Promise<CoinGateOrder> {
  return coingateRequest(`/orders/${coingateOrderId}`);
}

export interface CreatePayoutParams {
  amount: number;
  currency: string;
  address: string;
  description?: string;
  platformId?: string;
}

export interface CoinGatePayout {
  id: number;
  status: string;
  amount: string;
  currency: string;
  address: string;
  created_at: string;
}

export async function createPayout(params: CreatePayoutParams): Promise<CoinGatePayout> {
  return coingateRequest('/withdrawals', {
    method: 'POST',
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      address: params.address,
      description: params.description || '',
      platform_id: params.platformId,
    }),
  });
}

export function isConfigured(): boolean {
  return !!COINGATE_API_KEY;
}
