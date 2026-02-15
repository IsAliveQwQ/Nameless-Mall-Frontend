'use client';

import { Search, ChevronLeft, ChevronRight, Package2, Package, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { orderApi } from '@/features/order/api/order-api';
import { OrderVO, OrderStatus } from '@/features/order/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

const TABS: { label: string; value: OrderStatus | 'ALL' }[] = [
    { label: "全部訂單", value: 'ALL' },
    { label: "待付款", value: 0 },
    { label: "已付款", value: 1 },
    { label: "已完成", value: 3 },
    { label: "已取消", value: 4 }
];

export default function OrderHistoryPage() {
    const [activeTab, setActiveTab] = useState<OrderStatus | 'ALL'>('ALL');
    const [orders, setOrders] = useState<OrderVO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const status = activeTab === 'ALL' ? undefined : activeTab;
                const res = await orderApi.getList({ pageNum: page, pageSize: 10, status });
                setOrders(res.records);
                setTotal(res.total);
            } catch (error: any) {
                console.error('Failed to fetch orders', error);
                toast.error('無法獲取訂單列表');
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [activeTab, page]);

    const getStatusConfig = (status: number) => {
        switch (status) {
            case 0: return { label: '待付款', dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50/50', border: 'border-amber-100' };
            case 1: return { label: '已付款', dot: 'bg-blue-400', text: 'text-blue-700', bg: 'bg-blue-50/50', border: 'border-blue-100' };
            case 2: return { label: '已出貨', dot: 'bg-indigo-400', text: 'text-indigo-700', bg: 'bg-indigo-50/50', border: 'border-indigo-100' };
            case 3: return { label: '已完成', dot: 'bg-emerald-500', text: 'text-zinc-900', bg: 'bg-zinc-50', border: 'border-zinc-200' };
            case 4: return { label: '已取消', dot: 'bg-zinc-300', text: 'text-zinc-400', bg: 'bg-zinc-50/30', border: 'border-zinc-100' };
            default: return { label: '未知', dot: 'bg-zinc-200', text: 'text-zinc-500', bg: 'bg-zinc-50', border: 'border-zinc-100' };
        }
    };

    return (
        <div className="flex flex-col w-full">
            <div className="flex items-end justify-between border-b border-zinc-200 mb-6">
                <div className="flex flex-col gap-1 px-1">
                    <div className="flex items-center gap-2.5">
                        <Package2 className="size-5 text-zinc-400" />
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">訂單管理</h1>
                    </div>
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] px-1">Purchase History & Tracking</p>
                </div>
            </div>

            <div className="flex items-center gap-8 border-b border-zinc-100 px-1 mb-6">
                {TABS.map((tab) => (
                    <button
                        key={tab.label}
                        onClick={() => {
                            setActiveTab(tab.value);
                            setPage(1);
                        }}
                        className={cn(
                            "pb-4 text-[13px] font-bold transition-all relative tracking-widest uppercase",
                            activeTab === tab.value
                                ? "text-zinc-900"
                                : "text-zinc-400 hover:text-zinc-600"
                        )}
                    >
                        {tab.label}
                        {activeTab === tab.value && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
                        )}
                    </button>
                ))}
            </div>

            <div className="flex flex-col bg-white border border-zinc-200/50 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden min-h-[500px]">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
                        <Loader2 className="animate-spin text-zinc-200 size-10" />
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Loading...</span>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
                        <Package2 className="size-12 text-zinc-100 mb-4" />
                        <h3 className="text-zinc-900 font-bold mb-1">尚未有任何足跡</h3>
                        <p className="text-xs text-zinc-400">開始您的首趟探索，讓這空間填滿屬於您的驚喜。</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-50">
                        {orders.map((order) => {
                            const config = getStatusConfig(order.status);
                            return (
                                <div
                                    key={order.orderSn}
                                    onClick={() => router.push(`/orders/${order.orderSn}`)}
                                    className="group relative flex flex-col md:flex-row items-center gap-8 p-6 hover:bg-zinc-50/30 transition-all duration-500 cursor-pointer"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-zinc-900 scale-y-0 group-hover:scale-y-100 transition-all duration-500 origin-center" />

                                    <div className="size-14 rounded-lg bg-zinc-50/50 ring-1 ring-zinc-100 flex items-center justify-center text-zinc-300 group-hover:bg-white group-hover:ring-zinc-900/5 group-hover:shadow-sm transition-all duration-500 shrink-0">
                                        <Package className="size-6 group-hover:text-zinc-900 transition-colors" />
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_1.3fr_0.7fr] gap-0 w-full items-stretch">
                                        {/* Column 1: Reference */}
                                        <div className="flex flex-col gap-1.5 pr-4 py-1">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Reference</span>
                                            <span className="font-mono text-[14px] font-bold text-zinc-900 truncate max-w-[200px]" title={order.orderSn}>
                                                #{order.orderSn}
                                            </span>
                                            <span className="text-[12px] text-zinc-400 font-medium">
                                                {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                                            </span>
                                        </div>

                                        {/* Column 2: Detail - 縮短 20% 分隔線 */}
                                        <div className="relative flex flex-col gap-1.5 px-6 py-1">
                                            <div className="absolute left-0 top-[10%] bottom-[10%] w-px bg-zinc-200/80" />
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-left">Detail</span>
                                            <span className="text-[14px] font-bold text-zinc-700 text-left">
                                                {order.shippingMethod === 1 ? '宅配到府' : '店址取貨'}
                                            </span>
                                            <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-tight text-left">
                                                {order.payTypeName}
                                            </span>
                                        </div>

                                        {/* Column 3: Status - 縮短 20% 分隔線 */}
                                        <div className="relative flex flex-col gap-1.5 px-6 py-1">
                                            <div className="absolute left-0 top-[10%] bottom-[10%] w-px bg-zinc-200/80" />
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest opacity-0 select-none">Status</span>
                                            <div className="flex items-center">
                                                <div className={cn(
                                                    "inline-flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm transition-all duration-500",
                                                    config.bg, config.border
                                                )}>
                                                    <div className={cn("size-1.5 rounded-full", config.dot)} />
                                                    <span className={cn("text-[11px] font-bold uppercase tracking-widest px-0.5", config.text)}>
                                                        {config.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 4: Amount - 縮短 20% 分隔線 */}
                                    <div className="relative flex flex-col items-end gap-1.5 w-full md:w-[160px] shrink-0 pl-6 py-1">
                                        <div className="absolute left-0 top-[10%] bottom-[10%] w-px bg-zinc-100" />
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Amount</span>
                                        <span className={cn(
                                            "text-xl font-bold tracking-tighter text-zinc-900",
                                            order.status === 4 && "text-zinc-200 line-through"
                                        )}>
                                            NT$ {order.payAmount.toLocaleString()}
                                        </span>
                                        <div className="text-[11px] font-bold text-zinc-300 group-hover:text-zinc-900 transition-colors uppercase tracking-[0.2em] mt-0.5 flex items-center gap-1.5">
                                            VIEW <ChevronRight className="size-3.5" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="flex justify-center items-center gap-3 pb-16 pt-4">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="size-10 border border-zinc-200 flex items-center justify-center rounded-sm hover:border-zinc-900 transition-all text-zinc-400 hover:text-zinc-900 disabled:opacity-20 active:scale-90"
                >
                    <ChevronLeft className="size-4" />
                </button>

                <div className="flex items-center gap-1.5">
                    {[...Array(Math.ceil(total / 10) || 1)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={cn(
                                "size-10 border-b-2 transition-all text-xs font-mono font-bold",
                                page === i + 1
                                    ? "border-zinc-900 text-zinc-900"
                                    : "border-transparent text-zinc-300 hover:text-zinc-600 hover:border-zinc-200"
                            )}
                        >
                            {(i + 1).toString().padStart(2, '0')}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * 10 >= total}
                    className="size-10 border border-zinc-200 flex items-center justify-center rounded-sm hover:border-zinc-900 transition-all text-zinc-400 hover:text-zinc-900 disabled:opacity-20 active:scale-90"
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>
        </div>
    );
}
