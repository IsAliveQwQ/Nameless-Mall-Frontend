import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Result, BusinessError } from '@/shared/types/api';
import { ResultCode } from '@/shared/types/enums';
import { useAuthStore } from '@/features/auth/stores/auth-store';

// 建立 Axios 實例
const axiosInstance = axios.create({
    // [Engineering Discipline] 優先讀取環境變數，若無則回退至 /api 確保所有請求皆經過 Gateway
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor (附加 Token)
axiosInstance.interceptors.request.use(
    (config) => {
        // 僅在客戶端執行時添加 Token
        if (typeof window !== 'undefined') {
            const { token } = useAuthStore.getState();
            // [Engineering Discipline] 嚴格檢查 Token 有效性，避免發送 "null" 或 "undefined" 字串到後端觸發 401
            if (token && token !== 'null' && token !== 'undefined') {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor (處理 Result結構)
axiosInstance.interceptors.response.use(
    (response): Promise<any> => {
        // 若後端回傳 200，檢查 body 中的 code
        const result = response.data as Result<unknown>;

        // 1. 若 ResultCode 為 OK，回傳 data (剝離外殼)
        if (result.code === ResultCode.OK) {
            return result.data as any;
        }

        // 2. 認證失效處理 (Token 過期/無效/或帶了錯誤 Token)
        if (isAuthError(result.code)) {
            console.warn(`[API] Auth Code ${result.code} detected. Cleaning local session...`);
            handleAuthError();
            throw new BusinessError(result.code, result.message);
        }

        // 3. 其他業務錯誤 (如庫存不足)，拋出 BusinessError 供 UI 處理
        throw new BusinessError(result.code, result.message);
    },
    (error: AxiosError) => {
        // [DEBUG] 詳細錯誤日誌 - 幫助診斷部署環境 401/404 問題
        const status = error.response?.status;
        const config = error.config;

        console.error("🔥 API Error Detail:", {
            url: config?.url,
            status: status,
            message: status === 401 ? '❌ 認證失敗：後端拒絕了此請求，可能是該 API 需登入或 Token 已失效。' : 'API 異常'
        });

        if (status === 401) {
            console.error("📍 401 Unauthorized Detected! 請檢查後端 Gateway 的 PermitAll 配置，或是清除瀏覽器 LocalStorage 後再試。");
        }

        if (error.response?.status === 404) {
            console.error("📍 404 Detected! Check if the URL above matches your backend spec.");
        }

        // 處理 HTTP 4xx/5xx 錯誤
        if (error.response) {
            const data = error.response.data;
            const isJson = data && typeof data === 'object';
            const result = isJson ? (data as Result<unknown>) : null;

            // 提取 Result 結構或根據狀態碼 fallback
            const code = result?.code || (
                error.response.status === 503 ? 'SERVICE_UNAVAILABLE' :
                    error.response.status === 401 ? ResultCode.UNAUTHORIZED :
                        ResultCode.INTERNAL_ERROR
            );

            // 針對 503 提供更明確的指示
            let message = result?.message || error.message;
            if (error.response.status === 503) {
                message = '授權服務 (Auth-Service) 暫時不可用，請檢查後端容器狀態或 Nacos 註冊列表';
            }

            // [Engineering Discipline] 凡是 401 或是業務認證代碼，皆清理本地 session 防止死循環
            if (isAuthError(code as string) || error.response.status === 401) {
                console.warn(`[API] 🕵️ Unauthorized detected (status ${error.response.status}). Performing auto-reset...`);
                handleAuthError();
            }

            // 拋出 BusinessError，強制攜帶 code 與 message
            throw new BusinessError(code as string, message);
        } else if (error.request) {
            // 請求發出但無回應 (Network Error / Timeout)
            throw new BusinessError(ResultCode.SERVICE_UNAVAILABLE, '網路連線異常，請檢查您的網路連線或伺服器狀態');
        }

        throw new BusinessError(ResultCode.INTERNAL_ERROR, error.message);
    }
);

// 輔助函數: 檢查是否為認證錯誤
function isAuthError(code: string): boolean {
    return [
        ResultCode.UNAUTHORIZED,
        ResultCode.TOKEN_EXPIRED,
        ResultCode.TOKEN_INVALID,
        ResultCode.TOKEN_MISSING,
        ResultCode.SESSION_EXPIRED
    ].includes(code as ResultCode);
}

// 輔助函數: 處理認證錯誤動作
function handleAuthError() {
    if (typeof window !== 'undefined') {
        useAuthStore.getState().clearAuth();
        // 可選擇是否要 redirect: window.location.href = '/login';
        // 建議由 useAuth Hook 監聽事件或 Error Boundary 處理跳轉
    }
}

// Type-Safe API Wrapper
// 由於 Interceptor 會自動剝離 Result 外殼，這裡強制轉型 Promise<T>
const api = {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
        axiosInstance.get<T>(url, config) as unknown as Promise<T>,

    post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
        axiosInstance.post<T>(url, data, config) as unknown as Promise<T>,

    put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
        axiosInstance.put<T>(url, data, config) as unknown as Promise<T>,

    delete: <T>(url: string, config?: AxiosRequestConfig) =>
        axiosInstance.delete<T>(url, config) as unknown as Promise<T>,
};

export default api;
