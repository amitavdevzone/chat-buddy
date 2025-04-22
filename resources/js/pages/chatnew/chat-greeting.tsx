export default function ChatGreeting() {
  return (
    <div>
      <div className="mb-40 flex items-center justify-center">
        <h1 className="text-3xl">How many I help you today?</h1>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 rounded-xl border bg-white p-4 shadow">Ask any question and let's have a conversation</div>
        <div className="col-span-1 rounded-xl border bg-white p-4 shadow">Select any model and try out conversation with different flavour</div>
        <div className="col-span-1 rounded-xl border bg-white p-4 shadow">Create different personas for your model</div>
      </div>
    </div>
  );
}
