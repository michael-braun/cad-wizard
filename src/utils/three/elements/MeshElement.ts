import { IMeshElement } from "@/utils/three/interfaces/IMeshElement";
import { Object3D } from "three";

export abstract class MeshElement implements IMeshElement {
  protected events = new EventTarget();

  abstract getObject3D(): Object3D | undefined;

  protected id = crypto.randomUUID();

  getId(): string {
    return this.id;
  }

  update() {
    this.events.dispatchEvent(new CustomEvent('update'));
  }

  addEventListener(type: 'update' | 'updateSelected' | string, cb: (event: Event) => void) {
    this.events.addEventListener(type, cb);
  }

  removeEventListener(type: 'update' | 'updateSelected' | string, cb: (event: Event) => void) {
    this.events.removeEventListener(type, cb);
  }

  dispatchEvent(event: Event) {
    this.events.dispatchEvent(event);
  }

  on(type: 'update' | 'updateSelected' | string, cb: (event: Event) => void) {
    this.addEventListener(type, cb);

    return () => {
      this.removeEventListener(type, cb);
    }
  }
}
