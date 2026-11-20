export type Mood = 'idle' | 'correct' | 'wrong';

/** Fundo com manchas de cor em movimento; muda de cor no acerto e no erro. */
export function Aurora({ mood }: { mood: Mood }) {
  return (
    <div className="aurora" data-mood={mood} aria-hidden="true">
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
    </div>
  );
}
