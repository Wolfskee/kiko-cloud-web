import { NextResponse } from 'next/server';
import { backendFetch, getAuthInfo } from '@/api-lib/backend-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileId, objectKey } = body;
    const { userId } = await getAuthInfo(request);

    if (!fileId) {
      return NextResponse.json({ error: 'Missing fileId' }, { status: 400 });
    }

    console.log(`[BFF Callback Step 9] Confirming fileId: ${fileId}, objectKey: ${objectKey || 'none'} for user: ${userId}`);

    const path = `/api/v1/files/callback?file_id=${encodeURIComponent(fileId)}${objectKey ? `&object_key=${encodeURIComponent(objectKey)}` : ''}`;

    const { data, error, status } = await backendFetch(
      path,
      {
        method: 'POST',
        body: JSON.stringify({
          file_id: fileId,
          fileId: fileId,
          id: fileId,
          object_key: objectKey || undefined,
          objectKey: objectKey || undefined,
          key: objectKey || undefined,
          user_id: userId || undefined,
          userId: userId || undefined,
          status: 'ACTIVE',
        }),
      },
      request
    );

    if (error) {
      console.error(`[BFF Callback Step 10 Failed] status ${status}:`, error);
      return NextResponse.json({ error, success: false }, { status: status || 500 });
    }

    console.log(`[BFF Callback Step 10 Success] Lambda confirmed & DB status updated to ACTIVE`, data);
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Callback processing error';
    return NextResponse.json({ error: message, success: false }, { status: 500 });
  }
}
