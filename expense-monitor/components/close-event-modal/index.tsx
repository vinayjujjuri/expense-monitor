export function CloseEventModal({ eventId, onClose }: any) {
  async function closeEvent() {
    await fetch(`/api/events/${eventId}/close`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endDate: new Date() }),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-2">Close Event</h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to close this event?
        </p>

        <div className="flex justify-end gap-3">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={closeEvent}
            className="bg-rose-600 text-white px-4 py-2 rounded"
          >
            Close Event
          </button>
        </div>
      </div>
    </div>
  );
}
