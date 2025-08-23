
import { AppraiseeDetailView } from "@/app/shared/AppraiseeDetailView";

// This page is now a Server Component to align with modern Next.js practices.
// It awaits the params promise implicitly and passes the id to the client component.
export default function AppraiserAppraiseePage({ params }: { params: { id: string } }) {
  // The 'params' object is automatically awaited by Next.js in Server Components.
  // We can safely access params.id here.
  return <AppraiseeDetailView userId={params.id} />;
}
