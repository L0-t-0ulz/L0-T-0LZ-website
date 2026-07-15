/* ============================================================
   T06 — "Explored 100%" achievement. Fires once (ever) when the
   visitor reaches the footer: confetti + success chime + toast.
   ============================================================ */
import { toast } from './toast';
import { confetti } from './burst';
import { audio } from './audio';

const KEY = 'lostsoulz:ach:explored';

export function initAchievements(): void {
  const footer = document.querySelector('#contact');
  if (!footer) return;

  try {
    if (localStorage.getItem(KEY) === '1') return;
  } catch {
    /* ignore */
  }

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        try {
          localStorage.setItem(KEY, '1');
        } catch {
          /* ignore */
        }
        confetti();
        audio.success();
        toast({
          icon: '🏆',
          title: 'ACHIEVEMENT · EXPLORED 100%',
          body: 'You reached the end. Respect.',
        });
      });
    },
    { threshold: 0.6 }
  );
  io.observe(footer);
}
