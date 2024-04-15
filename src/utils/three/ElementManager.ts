import { IThreeEditor } from "@/utils/three/interfaces/IThreeEditor";
import { IMeshElement } from "@/utils/three/interfaces/IMeshElement";
import { IElement } from "@/utils/three/interfaces/IElement";

export class ElementManager {
  private readonly _editor: IThreeEditor;
  private readonly _elements: Array<IElement> = [];

  constructor(editor: IThreeEditor) {
    this._editor = editor;
  }

  addMesh(mesh: IMeshElement) {
    this._elements.push(mesh);

    const object3D = mesh.getObject3D();
    if (!object3D) {
      return;
    }

    mesh.addEventListener('update', this._editor.update);

    this._editor.getScene().add(object3D);
    this._editor.update();
  }

  findByElementId(elementId: string) {
    return this._elements.find((element) => element.getId() === elementId);
  }

  findByUuid(uuid: string) {
    return this._elements.find((element) => element.getObject3D()?.uuid === uuid);
  }

  findById(id: number) {
    return this._elements.find((element) => element.getObject3D()?.id === id);
  }

  setSelected(elements: Array<IElement>) {
    const elementMap = Object.fromEntries(elements.map((e) => [e.getId(), true]));

    this._elements.forEach((element) => {
      element.dispatchEvent(new CustomEvent('updateSelected', {
        detail: {
          elements: elementMap,
        },
      }));
    });
  }

}
