import EventExpensesDetails from "@/components/events/event-expense-details";

export default async function ExpenseEventsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return <EventExpensesDetails eventId={eventId} />;
}
