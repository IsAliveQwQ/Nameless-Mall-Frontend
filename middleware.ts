import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 解決綠界 ECPay 使用 POST 回調導致 Next.js Page 報錯的問題
    // 將 POST 請求轉換為 GET 請求 (HTTP 303 See Other)
    if (request.nextUrl.pathname === '/checkout/callback' && request.method === 'POST') {
        return NextResponse.redirect(request.nextUrl, { status: 303 });
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // 僅匹配回調路徑，避免影響全站效能
        '/checkout/callback',
    ],
};
