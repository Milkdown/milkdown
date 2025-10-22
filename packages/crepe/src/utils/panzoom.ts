type PanZoomOptions = {
  transformElement: HTMLElement;
  width: number;
  height: number;
  scaleFactor?: number;
  scaleMax?: number;
  scaleMin?: number;
  scale?: number;
  scaleOld?: number;
  wheelScale?: boolean;
  canDrag?: boolean;
  isDragging?: boolean;
  canPinch?: boolean;
  isPinching?: boolean;
  pinchDistance?: number;
  offsetX?: number;
  offsetY?: number;
  padding?: number;
  panStep?: number;
  fitOnInit?: boolean;
  transitionDuration?: number;
  beforeWheel?: (e: WheelEvent) => boolean;
  onPanStart?: (e: PointerEvent) => void;
  onPanEnd?: () => void;
  onPan?: () => void;
  onScale?: () => void;
};

const noop = () => { };
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
const pointsDistance = (x1: number, x2: number, y1: number, y2: number) => Math.hypot(x2 - x1, y2 - y1);

export class PanZoom {
  el?: HTMLElement | null;
  transformEl?: HTMLElement | null;
  transformElement?: HTMLElement | string;
  scaleFactor: number = 0.5;
  scaleMax: number = 10;
  scaleMin: number = 0.05;
  scale: number = 1;
  scaleOld: number = 1;
  wheelScale?: boolean = true;
  canDrag: boolean = true;
  isDragging: boolean = false;
  canPinch: boolean = true;
  isPinching: boolean = false;
  pinchDistance: number = 0;
  offsetX: number = 0;
  offsetY: number = 0;
  padding: number = 40;
  panStep: number = 50;
  fitOnInit: boolean = true;
  transitionDuration: number = 250;
  width: number = 0;
  height: number = 0;
  beforeWheel: (e: WheelEvent) => boolean = () => false;
  onPanStart: (e: PointerEvent) => void = noop;
  onPanEnd: () => void = noop;
  onPan: () => void = noop;
  onScale: () => void = noop;

  constructor(selector: HTMLElement | string, options: PanZoomOptions) {
    
    Object.assign(this, {
      width: 0,
      height: 0,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
      scaleOld: 1,
      scaleMax: 10,
      scaleMin: 0.05,
      scaleFactor: 0.5,
      wheelScale: true,
      transitionDuration: 250,
      padding: 40,
      panStep: 50,
      fitOnInit: true,
      canDrag: true,
      canPinch: true,
      onPan: noop,
      onPanStart: noop,
      onPanEnd: noop,
      onScale: noop,
    }, 
    options, 
    {
      el: typeof selector === 'string' ? document.querySelector(selector) : selector,
      isDragging: false,
      isPinching: false,
    });

    if (!this.el) {
      throw new Error('Container-element not found for PanZoom');
    }

    if (typeof this.transformElement === 'string') {
      this.transformEl = document.querySelector(this.transformElement);
    } else {
      this.transformEl = this.transformElement as HTMLElement;
    }
    if (!this.transformEl) {
      throw new Error('Transform element not found for PanZoom');
    }

    this.init();
  }

  init() {
    if (!this.el) {
      return;
    }

    const pointers: { [key: string]: Map<number, PointerEvent> } = {
      'mouse': new Map(),
      'touch': new Map(),
    };

    const pointersUpdate = (e: PointerEvent) => {
      const map = pointers[e.pointerType];
      map && map.set(e.pointerId, e)
    };
    const pointersDelete = (e: PointerEvent) => {
      const map = pointers[e.pointerType];
      map && map.delete(e.pointerId);
    };

    const handlePointer = (e: PointerEvent) => {
      const pointersType = pointers[e.pointerType];
      if (!pointersType) {
        return;
      }

      const pointsEvts = pointersType.values();
      const pointersTot = pointersType.size;
      this.isPinching = pointersTot === 2;

      const pointer1 = pointsEvts.next().value;
      const pointer2 = pointsEvts.next().value;

      if (!pointer1 && !pointer2) {
        return;
      }

      let movementX = 0;
      let movementY = 0;

      if (!this.isPinching) {
        movementX = pointer1?.movementX || 0;
        movementY = pointer1?.movementY || 0;
      }
      else if (this.canPinch && e === pointer2) {
        movementX = ((pointer1?.movementX || 0) + (pointer2?.movementX || 0)) / 2;
        movementY = ((pointer1?.movementY || 0) + (pointer2?.movementY || 0)) / 2;

        const pointM = { // Get XY of pinch center point
          x: pointer1!.x + (pointer2.x - pointer1!.x) * 0.5,
          y: pointer1!.y + (pointer2.y - pointer1!.y) * 0.5,
        };

        const pinchDistanceNew = pointsDistance(pointer2.x, pointer1!.x, pointer2.y, pointer1!.y);
        const pinchDistanceOld = this.pinchDistance || pinchDistanceNew;
        const pinchDistanceDiff = pinchDistanceNew - pinchDistanceOld;
        this.pinchDistance = pinchDistanceNew;
        const delta = pinchDistanceDiff * 0.025;
        const newScale = this.calcScaleDelta(delta);
        const { originX, originY } = this.getPointerOrigin(pointM);

        this.scaleTo(newScale, originX, originY);
      }

      // PS: canDrag is default to true, but if one wants to use i.e: Ctrl key
      // in order to drag the area, set the default to false and than manually
      // change it to true on Ctrl key press.
      if (this.canDrag) {
        this.panTo(this.offsetX + movementX, this.offsetY + movementY);
      }
    };

    const onStart = (e: PointerEvent) => {
      // 必须是鼠标左键按下
      if ('mouse' === e.pointerType && e.button !== 0) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      pointersUpdate(e);

      this.isDragging = true;

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onEnd);
      document.addEventListener("pointercancel", onEnd);

      this.el!.style.cursor = 'grabbing';
      this.el!.style.userSelect = 'none';

      this.onPanStart(e);
    };

    const onMove = (e: PointerEvent) => {
      pointersUpdate(e);
      handlePointer(e);
    };

    const onEnd = (e: PointerEvent) => {
      pointersDelete(e);

      const pointersType = pointers[e.pointerType];
      const pointersTot = pointersType ? pointersType.size : 0;

      if (pointersTot < 2) {
        this.pinchDistance = 0;
      }

      if (pointersTot === 0) {
        this.isDragging = false;
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onEnd);
        document.removeEventListener("pointercancel", onEnd);

        this.el!.style.cursor = '';
        this.el!.style.userSelect = '';
      }

      this.onPanEnd();
    };

    this.el.addEventListener("pointerdown", onStart, { passive: false });

    if (this.wheelScale) {
      this.el.addEventListener("wheel", this.scaleWheel.bind(this));
    }

    if (this.fitOnInit) {
      this.fit();
    }

    return this;
  }

  getViewport() {
    const { width, height, x, y } = this.el!.getBoundingClientRect();
    return { width, height, x, y };
  }

  setWidthAndHeight(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  setTranformElement(selector: HTMLElement | string) {
    if (!selector) {
      return;
    }

    if (typeof selector === 'string') {
      this.transformEl = document.querySelector(selector) as HTMLElement;
    } else {
      this.transformEl = selector as HTMLElement;
    }

    if (!this.transformEl) {
      throw new Error('Transform element not found for PanZoom');
    }
  }

  /**
   * Get pointer origin XY from pointer position
   * relative to canvas center
   * @param {PointerEvent|Object} ev Event with x,y pointer coordinates of Object {x,y}
   * @return {object} {originX, originY} offsets from canvas center
   */
  getPointerOrigin({ x, y }: { x: number; y: number } | PointerEvent) {
    const vpt = this.getViewport();
    const cvs = this.getCanvas();
    const originX = x - vpt.x - cvs.x - cvs.width / 2;
    const originY = y - vpt.y - cvs.y - cvs.height / 2;
    return { originX, originY };
  }

  getCanvas() {
    const vpt = this.getViewport();
    const width = this.width * this.scale;
    const height = this.height * this.scale;
    const x = (vpt.width - width) / 2 + this.offsetX;
    const y = (vpt.height - height) / 2 + this.offsetY;
    return { width, height, x, y };
  }

  /**
   * Get -1 or +1 integer delta from mousewheel 
   * @param {PointerEvent|Object} ev Event with deltaY of Object with the same deltaY property
   * @return {number} -1 | +1
   */
  getWheelDelta(deltaY: number) {
    return Math.sign(-deltaY);
  }

  /**
   * Calculate the new scale value by a given delta.
   * @param {number} delta positive or negative integer 
   * @returns {number} new scale value calmped by the defined scaleMin/Max options
   */
  calcScaleDelta(delta: number) {
    const scale = this.scale * Math.exp(delta * this.scaleFactor);
    const scaleNew = clamp(scale, this.scaleMin, this.scaleMax);
    return scaleNew;
  }

  fit() {
    if (!this.el) {
      return;
    }

    const wRatio = this.el.clientWidth / (this.width + this.padding * 1);
    const hRatio = this.el.clientHeight / (this.height + this.padding * 1);
    const fitRatio = parseFloat(Math.min(1, wRatio, hRatio).toFixed(2));
    this.scaleTo(fitRatio);
    this.panTo(0, 0);
    return this;
  }

  /**
   * Apply canvas new scale by a given delta value (i.e: +1, -1, +2, ...)
   * @param {number} delta 
   * @return {this} instance
   */
  scaleDelta(delta: number) {
    const scaleNew = this.calcScaleDelta(delta);
    this.scaleTo(scaleNew);
    return this;
  }

  /**
   * Scale canvas element up
   * Alias for scaling by delta +1
   * @return {this} instance
   */
  scaleUp() {
    this.scaleDelta(1);
    return this;
  }

  /**
   * Scale canvas element down
   * Alias for scaling by delta -1
   * @return {this} instance
   */
  scaleDown() {
    this.scaleDelta(-1);
    return this;
  }

  /**
   * Apply a new scale at a given origin point relative from canvas center
   * Useful when zooming in/out at a specific "anchor" point.
   * @param {number} scaleNew 
   * @param {number} originX Scale to X point (relative to canvas center)
   * @param {number} originY Scale to Y point (relative to canvas center)
   * @return {this} instance
   */
  scaleTo(scaleNew = 1, originX?: number, originY?: number) {
    this.scaleOld = this.scale;
    this.scale = clamp(scaleNew, this.scaleMin, this.scaleMax);

    // The default XY origin is in the canvas center, 
    // If the origin changed (i.e: by mouse wheel at
    // coordinates-from-center) use the new scaling origin:
    if (originX !== undefined && originY !== undefined) {
      // Calculate the XY as if the element is in its
      // original, non-scaled size: 
      const xOrg = originX / this.scaleOld;
      const yOrg = originY / this.scaleOld;

      // Calculate the scaled XY 
      const xNew = xOrg * scaleNew;
      const yNew = yOrg * scaleNew;

      // Retrieve the XY difference to be used as the change in offset:
      const xDiff = originX - xNew;
      const yDiff = originY - yNew;

      this.panTo(this.offsetX + xDiff, this.offsetY + yDiff, false);
    }

    this.transform();
    this.onScale();
    return this;
  }

  /**
   * Apply scale from the mouse wheel Event at the given
   * pointer origin relative to canvas center.
   * @param {WheelEvent} ev 
   * @return {this} instance
   */
  scaleWheel(e: WheelEvent) {
    if (this.beforeWheel?.(e) === true) {
      return this;
    }
    e.preventDefault();
    const delta = this.getWheelDelta(e.deltaY);
    const scaleNew = this.calcScaleDelta(delta);
    const { originX, originY } = this.getPointerOrigin(e);
    this.scaleTo(scaleNew, originX, originY);
    return this;
  }

  /**
   * Pan the canvas element to the new XY offset values
   * PS: offsets are relative to the canvas center.
   * @param {number} offsetX 
   * @param {number} offsetY 
   * @param {boolean} isTransform Set to false if you're already applying transformations from the scaleTo function
   * @return {this} instance
   */
  panTo(offsetX: number, offsetY: number, isTransform: boolean = true) {
    const vpt = this.getViewport();
    const width = this.width * this.scale;
    const height = this.height * this.scale;
    // Clamp offsets to prevent canvas exit viewport
    const spaceX = vpt.width / 2 + width / 2 - this.padding;
    const spaceY = vpt.height / 2 + height / 2 - this.padding;
    this.offsetX = clamp(offsetX, -spaceX, spaceX);
    this.offsetY = clamp(offsetY, -spaceY, spaceY);

    if (isTransform) {
      this.transform();
    }

    this.onPan();
    return this;
  }

  transform() {
    if (!this.transformEl) {
      return this;
    }

    const translateDuration = (this.isPinching || this.isDragging) ? 0 : this.transitionDuration;

    const ele = this.transformEl;
    ele.style.transition = `transform ${translateDuration}ms`;

    ele.addEventListener("transitionend", () => {
      ele.style.transition = `scale 0, translate 0`;
    }, { once: true });
    
    ele.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`

    return this;
  }

  /**
   * 上下左右平移
   */
  panUp() {
    this.panTo(this.offsetX, this.offsetY - this.panStep);
    return this;
  }
  panDown() {
    this.panTo(this.offsetX, this.offsetY + this.panStep);
    return this;
  }
  panLeft() {
    this.panTo(this.offsetX - this.panStep, this.offsetY);
    return this;
  }
  panRight() {
    this.panTo(this.offsetX + this.panStep, this.offsetY);
    return this;
  }


}