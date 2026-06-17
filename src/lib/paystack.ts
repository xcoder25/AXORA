declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: PaystackSetupOptions) => { openIframe: () => void };
    };
  }
}

export type PaystackSetupOptions = {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  metadata?: Record<string, unknown>;
  callback: (response: { reference: string; status: string }) => void;
  onClose: () => void;
};

const PAYSTACK_SCRIPT = 'https://js.paystack.co/v1/inline.js';

let scriptPromise: Promise<void> | null = null;

export function loadPaystackScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.PaystackPop) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${PAYSTACK_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.src = PAYSTACK_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack'));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export function getPaystackPublicKey(): string {
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
}

/** Paystack expects amount in smallest currency unit (kobo for NGN, cents for USD). */
export function toPaystackAmount(total: number, currency: string): number {
  const c = currency.toUpperCase();
  if (c === 'NGN') return Math.round(total * 100);
  return Math.round(total * 100);
}

export function generatePaymentReference(prefix = 'AXORA'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function openPaystackCheckout(options: Omit<PaystackSetupOptions, 'key'>) {
  await loadPaystackScript();
  const key = getPaystackPublicKey();
  if (!key) throw new Error('Paystack public key not configured (NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY)');
  if (!window.PaystackPop) throw new Error('Paystack SDK unavailable');

  const handler = window.PaystackPop.setup({
    key,
    ...options,
  });
  handler.openIframe();
}
