'use client';

import { type CSSProperties, createElement, useEffect, useRef } from 'react';
import { createField, type FieldHandle, type FieldOptions } from './field.js';

export interface FieldProps extends FieldOptions {
  className?: string;
  style?: CSSProperties;
}

export function Field({ className, style, ...options }: FieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<FieldHandle | null>(null);
  const serialized = JSON.stringify(options);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handle = createField(canvas);
    handleRef.current = handle;
    return () => {
      handle.destroy();
      handleRef.current = null;
    };
  }, []);

  useEffect(() => {
    handleRef.current?.update(JSON.parse(serialized) as FieldOptions);
  }, [serialized]);

  return createElement('canvas', { ref: canvasRef, className, style, 'aria-hidden': true });
}
