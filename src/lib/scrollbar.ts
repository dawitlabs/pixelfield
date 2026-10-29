import 'overlayscrollbars/overlayscrollbars.css';
import { OverlayScrollbars } from 'overlayscrollbars';

export function initScrollbar(): () => void {
  const instance = OverlayScrollbars(
    { target: document.body, cancel: { nativeScrollbarsOverlaid: false, body: false } },
    {
      scrollbars: {
        theme: 'os-theme-pixelfield',
        autoHide: 'move',
        autoHideDelay: 900,
      },
      overflow: { x: 'hidden', y: 'scroll' },
    },
  );

  return () => instance.destroy();
}
