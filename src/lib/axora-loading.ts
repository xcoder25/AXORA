/** Global loading overlay — dispatch from async actions (Paystack, AI, Firestore writes). */

export type AxoraLoadingDetail = { message?: string };

export function startAxoraLoading(message?: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<AxoraLoadingDetail>('axora-loading-start', {
      detail: { message },
    })
  );
}

export function stopAxoraLoading() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('axora-loading-stop'));
}

export async function withAxoraLoading<T>(
  fn: () => Promise<T>,
  message?: string
): Promise<T> {
  startAxoraLoading(message);
  try {
    return await fn();
  } finally {
    stopAxoraLoading();
  }
}
