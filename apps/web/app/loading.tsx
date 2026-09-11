export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      <span className="text-xs font-semibold text-deck-500 uppercase tracking-widest font-display">
        Loading PlayDeck...
      </span>
    </div>
  );
}
