'use client';

import { ErrorPage } from '@/components/ui/error-page';

export default function NotFound() {
    return (
        <ErrorPage
            code="404"
            title="查無此頁面"
            message={`您似乎來到了一個尚未被設計的空間。\n此頁面可能已搬遷，或我們正在重新佈置。`}
            errorCodeLabel="Page_Not_Found"
        />
    );
}
