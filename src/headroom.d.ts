declare module 'headroom.js' {
  interface HeadroomClasses {
    initial?: string;
    pinned?: string;
    unpinned?: string;
    top?: string;
    notTop?: string;
    bottom?: string;
    notBottom?: string;
    frozen?: string;
  }

  interface HeadroomOptions {
    offset?: number;
    tolerance?: number | { up: number; down: number };
    classes?: HeadroomClasses;
    scroller?: Element;
  }

  export default class Headroom {
    constructor(element: Element, options?: HeadroomOptions);
    init(): this;
    destroy(): void;
  }
}
