
"use client";

import { AppraiseeDetailView } from "@/app/shared/AppraiseeDetailView";
import { useDataContext } from "@/context/DataContext";
import * as React from "react";

export default function AppraiseeReportDetail() {
    const { loggedInUser } = useDataContext();

    if (!loggedInUser) {
        return <div>Carregando...</div>;
    }

    // We pass the logged-in user's ID to the generic detail view component
    return <AppraiseeDetailView userId={loggedInUser.id} />;
}
