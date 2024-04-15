import { IElement } from "@/utils/three/interfaces/IElement";

export interface IMeshElement extends IElement {
  addEventListener(type: 'update' | string, cb: (event: Event) => void): void;
  removeEventListener(type: 'update' | string, cb: (event: Event) => void): void;
}
