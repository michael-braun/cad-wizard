import { MeshElement } from "@/utils/three/elements/MeshElement";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { Mesh, MeshStandardMaterial, Object3D } from "three";

export class ObjElement extends MeshElement {
  private _file: File;
  private _object: Object3D | undefined;

  constructor(file: File) {
    super();

    this._file = file;

    this.addEventListener('updateSelected', (event) => {
      if (!(event instanceof CustomEvent)) {
        return;
      }

      if (!event.detail.elements[this.id]) {
        this.setColor();
      } else {
        this.setColor(0xFF0000);
      }
    });
  }

  async load(): Promise<void> {
    return new Promise<void>( (resolve, reject) => {
      const loader = new OBJLoader();

      const objectUrl = URL.createObjectURL(this._file);

      loader.load(
        objectUrl,
        (object: Object3D) => {
          this._object = object;
          this._object.userData = {
            id: this.id,
          };

          URL.revokeObjectURL(objectUrl);

          this.setColor(0x777777);
          object.castShadow = true;
          object.receiveShadow = true;

          resolve();
        },
        function ( xhr: any ) {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        ( error: unknown ) => {
          reject(error);

          URL.revokeObjectURL(objectUrl);
        }
      );
    });
  }

  setColor(color: number = 0x777777) {
    if (!this._object) {
      return;
    }

    this._object.traverse((child) => {
      if (child instanceof Mesh) {
        const material = new MeshStandardMaterial({ color });
        child.material = material;
      }
    });

    this.update();
  }

  getObject3D(): Object3D | undefined {
    return this._object;
  }
}
