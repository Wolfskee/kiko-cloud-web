import { NextResponse } from 'next/server';
import { backendFetch, getAuthInfo } from '@/api-lib/backend-client';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { headers: authHeaders, token } = await getAuthInfo(request);

    if (!id) {
      return NextResponse.json({ error: 'Missing file id' }, { status: 400 });
    }

    const incomingAuth = request.headers.get('Authorization') || request.headers.get('authorization') || '';
    const rawToken = token || (incomingAuth.startsWith('Bearer ') ? incomingAuth.substring(7) : incomingAuth);
    const bearerAuth = rawToken ? `Bearer ${rawToken}` : authHeaders.Authorization || '';

    // Standard HTTP DELETE without body matching API Gateway & Go Lambda spec
    let res = await backendFetch(
      `/api/v1/files/${id}`,
      {
        method: 'DELETE',
        headers: {
          ...(bearerAuth ? { Authorization: bearerAuth } : {}),
        },
      },
      request
    );

    // Fallback: Retry with raw token if 401
    if (res.status === 401 && rawToken) {
      res = await backendFetch(
        `/api/v1/files/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: rawToken,
          },
        },
        request
      );
    }

    if (res.error) {
      return NextResponse.json({ error: res.error, success: false }, { status: res.status || 500 });
    }

    return NextResponse.json({ success: true, data: res.data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Delete file error';
    return NextResponse.json({ error: message, success: false }, { status: 500 });
  }
}
