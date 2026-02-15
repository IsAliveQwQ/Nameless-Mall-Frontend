'use client';

import { OrderHistoryTable } from '@/components/dashboard/order-history-table';
import { AccountHeader } from '@/components/account/account-header';

export default function ProfilePage() {
    return (
        <div className="flex flex-col gap-8">
            <AccountHeader />

            <div className="flex flex-col gap-6">
                <OrderHistoryTable />
            </div>
        </div>
    );
}
