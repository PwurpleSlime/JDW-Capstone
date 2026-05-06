'use client';

import { createContext, useContext } from 'react';
import * as THREE from 'three';

export interface ThreeContextValue {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
}

export const ThreeContext = createContext<ThreeContextValue | null>(null);

export function useThree(): ThreeContextValue | null {
  return useContext(ThreeContext);
}
