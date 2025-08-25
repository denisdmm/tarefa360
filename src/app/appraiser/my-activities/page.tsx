
"use client";

// This component is a wrapper around the original AppraiseeDashboard.
// It ensures that when an appraiser views their own activities, they
// remain within the appraiser layout.
import AppraiseeDashboard from "@/app/appraisee/dashboard/page";

export default function AppraiserMyActivities() {
    return <AppraiseeDashboard />;
}
