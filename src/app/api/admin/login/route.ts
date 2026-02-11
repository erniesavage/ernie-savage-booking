import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    var body = await request.json();
    var { password } = body;

    var adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json({ success: false, error: 'Admin password not configured' }, { status: 500 });
    }

    if (password === adminPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
