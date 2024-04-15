import { Object3D } from "three";

export interface IElement {
  getObject3D(): Object3D | undefined;

  getId(): string;

  dispatchEvent(event: Event): void;
}
