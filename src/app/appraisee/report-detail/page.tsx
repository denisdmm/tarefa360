

"use client";

import { AppraiseeDetailView } from "@/app/shared/AppraiseeDetailView";
import { useDataContext } from "@/context/DataContext";
import { useSearchParams } from "next/navigation";
import * as React from "react";

export default function AppraiseeReportDetail() {
    const { loggedInUser } = useDataContext();
    const searchParams = useSearchParams();
    const initialPeriodId = searchParams.get('periodId') || undefined;


    if (!loggedInUser) {
        return <div>Carregando...</div>;
    }

    // We pass the logged-in user's ID to the generic detail view component
    return <AppraiseeDetailView userId={loggedInUser.id} initialPeriodId={initialPeriodId} />;
}
