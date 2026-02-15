'use client';

import { useEffect } from 'react';
import { ErrorPage } from '@/components/ui/error-page';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Runtime Error:', error);
    }, [error]);

    return (
        <ErrorPage
            code="500"
            title="伺服器出了點狀況"
            message={`這不是您的問題，我們的伺服器正遭遇一些小亂流。\n建議您嘗試重新整理頁面，或聯繫我們獲取協助。`}
            errorCodeLabel={error.digest || "Internal_Server_Error"}
            showReset={true}
            onReset={() => reset()}
        />
    );
}
