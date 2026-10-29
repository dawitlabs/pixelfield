export type Mode = 'night' | 'day';

class ModeStore {
  current = $state<Mode>('night');

  sync(): void {
    if (typeof document === 'undefined') return;
    this.current = document.documentElement.dataset.theme === 'day' ? 'day' : 'night';
  }

  toggle(): void {
    this.current = this.current === 'night' ? 'day' : 'night';
    document.documentElement.dataset.theme = this.current;
    try {
      localStorage.setItem('pf-mode', this.current);
    } catch {}
  }
}

export const mode = new ModeStore();

export function fieldTint(current: Mode): string {
  return current === 'day' ? '#000000' : '#ffffff';
}

export function fieldTheme(current: Mode): 'light' | 'dark' {
  return current === 'day' ? 'light' : 'dark';
}
