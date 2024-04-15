import type { Scene } from "three";

export interface IThreeEditor {
  getScene(): Scene;

  update(): void;
}
