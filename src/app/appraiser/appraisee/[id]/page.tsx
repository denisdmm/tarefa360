
"use client";

import { AppraiseeDetailView } from "@/app/shared/AppraiseeDetailView";

export default function AppraiserAppraiseePage({ params }: { params: { id: string } }) {
  // This page now simply acts as a wrapper for the shared detail view.
  // It gets the user ID from the URL params and passes it to the component.
  return <AppraiseeDetailView userId={params.id} />;
}
