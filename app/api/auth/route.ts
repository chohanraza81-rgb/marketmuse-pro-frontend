import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const correct = process.env.SITE_PASSWORD || 'MarketMuse2026!';

  if (password === correct) {
    const response = NextResponse.json({ success: true });
    // 30 days cookie
    response.cookies.set('site_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    });
    return response;
  }

  return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
}
