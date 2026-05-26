import { NextResponse } from 'next/server';
import { resolveCameraStreamUrl } from '@/lib/camera-bridge';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const nodeId = body?.nodeId;
  const protocol = body?.protocol;

  if (!nodeId || typeof nodeId !== 'string') {
    return NextResponse.json(
      { error: 'nodeId is required' },
      { status: 400 }
    );
  }

  const streamUrl = resolveCameraStreamUrl({ nodeId, protocol });

  return NextResponse.json({
    streamUrl,
    status: 'mock',
  });
}

