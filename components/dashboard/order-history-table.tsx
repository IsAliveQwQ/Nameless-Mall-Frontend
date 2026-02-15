import { ClipboardList, ChevronRight, Loader2, Package2, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { orderApi } from '@/features/order/api/order-api';
import { OrderVO } from '@/features/order/types';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export function OrderHistoryTable() {
    const [orders, setOrders] = useState<OrderVO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchRecentOrders = async () => {
            try {
                const res = await orderApi.getList({ pageNum: 1, pageSize: 5 });
                setOrders(res.records);
            } catch (error) {
                console.error('Failed to fetch recent orders', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecentOrders();
    }, []);

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
        <div className="w-full flex flex-col gap-6">
            {/* Header Section - Refined */}
            <div className="flex items-end justify-between px-1">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2.5">
                        <Package className="size-5 text-zinc-400" />
                        近期訂單回顧
                    </h2>
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-px">Recent Activities</p>
                </div>
                <Link
                    href="/profile/orders"
                    className="group flex items-center gap-2 text-[13px] font-bold text-zinc-400 hover:text-zinc-900 transition-all duration-300"
                >
                    查看完整歷史
                    <div className="size-6 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                        <ChevronRight className="size-3.5" />
                    </div>
                </Link>
            </div>

            {/* List Body */}
            <div className="bg-white border border-zinc-200/60 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] overflow-hidden">
                {isLoading ? (
                    <div className="h-[400px] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-zinc-200 size-10" />
                            <span className="text-xs font-bold text-zinc-300 tracking-widest uppercase">Fetching Orders</span>
                        </div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="h-[400px] flex flex-col items-center justify-center text-center">
                        <div className="size-16 rounded-2xl bg-zinc-50 flex items-center justify-center mb-6">
                            <Package2 className="size-8 text-zinc-200" />
                        </div>
                        <h4 className="text-zinc-900 font-bold mb-1">尚未有任何足跡</h4>
                        <p className="text-sm text-zinc-400 px-12">開始您的首趟探索，讓這空間填滿屬於您的驚喜。</p>
                        <Link href="/products" className="mt-8 text-xs font-bold underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-900 transition-all">
                            立即前往購物
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100">
                        {orders.map((order) => {
                            const config = getStatusConfig(order.status);
                            return (
                                <div
                                    key={order.orderSn}
                                    onClick={() => router.push(`/orders/${order.orderSn}`)}
                                    className="group relative flex flex-col md:flex-row items-center gap-6 p-6 hover:bg-zinc-50/50 transition-all duration-500 cursor-pointer"
                                >
                                    {/* Selection Indicator */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-900 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center" />

                                    {/* Product Visual */}
                                    <div className="size-16 rounded-lg bg-zinc-50 ring-1 ring-zinc-200/50 flex items-center justify-center text-zinc-300 group-hover:ring-zinc-900/10 group-hover:bg-white group-hover:shadow-md transition-all duration-500">
                                        <Package className="size-7 group-hover:text-zinc-900 transition-colors" />
                                    </div>

                                    {/* Info Grid */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                                        <div className="md:col-span-1 border-r border-zinc-100 pr-4">
                                            <span className="block text-[11px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">Order Ref</span>
                                            <span className="block font-mono text-[13px] font-bold text-zinc-900">
                                                #{order.orderSn.substring(0, 12)}
                                            </span>
                                        </div>

                                        <div className="md:col-span-1 border-r border-zinc-100 pr-4">
                                            <span className="block text-[11px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">Transaction Date</span>
                                            <span className="block font-medium text-sm text-zinc-600">
                                                {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                                            </span>
                                        </div>

                                        <div className="md:col-span-1 border-r border-zinc-100 pr-4 flex flex-col justify-center">
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border self-start transition-all duration-500",
                                                config.bg, config.border
                                            )}>
                                                <div className={cn("size-1.5 rounded-full animate-pulse", config.dot)} />
                                                <span className={cn("text-[11px] font-bold uppercase tracking-widest", config.text)}>
                                                    {config.label}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="md:col-span-1 flex flex-col items-end justify-center">
                                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-tighter mb-0.5">Total Amount</span>
                                            <span className="text-lg font-bold text-zinc-900 tracking-tight">
                                                NT$ {order.payAmount.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Arrow */}
                                    <div className="shrink-0 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                                        <ChevronRight className="size-5 text-zinc-300 group-hover:text-zinc-900" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
