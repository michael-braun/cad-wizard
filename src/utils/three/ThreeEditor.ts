import * as THREE from "three";
import { Camera, OrthographicCamera, PerspectiveCamera, Scene, Vector2, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { IThreeEditor } from "@/utils/three/interfaces/IThreeEditor";
import { ElementManager } from "@/utils/three/ElementManager";
import { ObjElement } from "@/utils/three/elements/ObjElement";
import { ECameraMode } from "@/utils/three/enums/ECameraMode";
import { IElement } from "@/utils/three/interfaces/IElement";

const size = 30;
const divisions = 30;

export class ThreeEditor implements IThreeEditor {
  private readonly renderer: WebGLRenderer;
  private readonly scene: Scene;
  private camera!: Camera;

  private readonly elementManager = new ElementManager(this);
  private controls!: OrbitControls;

  constructor() {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.shadowMap.enabled = true;

    this.setCameraMode(ECameraMode.ORTHOGRAPHIC);

    const points = [];
    points.push( new THREE.Vector3( - 10, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 10, 0 ) );
    points.push( new THREE.Vector3( 10, 0, 0 ) );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );

    const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
    const line = new THREE.Line( geometry, material );

    this.scene.add( line );
    const gridHelper = new THREE.GridHelper( size, divisions, 0x00FF00 );
    this.scene.add( gridHelper );

    const light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.castShadow = true;
    this.scene.add( light );

    this.render();

    this.update = this.update.bind(this);
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  connectDom(parentElement: HTMLDivElement) {
    parentElement.appendChild(this.renderer.domElement);
  }

  async loadObjFile(file: File): Promise<void> {
    const objectElement = new ObjElement(file);
    await objectElement.load();
    this.elementManager.addMesh(objectElement);
  }

  setCameraMode(mode: ECameraMode) {
    if (this.controls) {
      this.controls.dispose();
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    if (this.camera) {
      this.scene.remove(this.camera);
    }

    const oldCamera = this.camera;

    const near = 1;
    const far = 1000;
    const fov_y = 75;

    if (mode === ECameraMode.PERSPECTIVE) {
      this.camera = new THREE.PerspectiveCamera(fov_y, width / height, near, far );

      this.camera.position.set( 30, 75, 100 );
      this.camera.lookAt( 0, 0, 0 );
    } else if (mode === ECameraMode.ORTHOGRAPHIC) {
      const orthographicCamera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, near, far);

      orthographicCamera.position.set( 30, 75, 100 );
      orthographicCamera.lookAt( 0, 0, 0 );
      orthographicCamera.zoom = 50;
      orthographicCamera.updateProjectionMatrix();

      this.camera = orthographicCamera;
    } else {
      throw new Error('unknown camera mode');
    }

    if (oldCamera) {
      this.camera.position.copy( oldCamera.position );
      // this.camera.matrix.copy(oldCamera.matrix);
      this.camera.quaternion.copy( oldCamera.quaternion );
      // this.camera.lookAt(oldCamera.rotation.x, oldCamera.rotation.y, oldCamera.rotation.z);
    }

    this.scene.add(this.camera);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();
    this.controls.addEventListener('change', () => {
      this.render();
    });

    this.render();
  }

  homeCamera() {
    this.camera.position.set( 30, 75, 100 );
    this.camera.lookAt( 0, 0, 0 );

    if (this.camera instanceof OrthographicCamera) {
      this.camera.zoom = 50;
      this.camera.updateProjectionMatrix();
    }

    this.controls.reset();
    this.controls.update();

    this.render();
  }

  getScene(): Scene {
    return this.scene;
  }

  update(): void {
    this.render();
  }

  selectPointer(pointer: Vector2) {
    const raycaster = new THREE.Raycaster();

    raycaster.setFromCamera( pointer, this.camera );

    const intersects = raycaster.intersectObjects(this.scene.children);

    const selectedElements: Array<IElement> = [];

    for ( let i = 0; i < intersects.length; i ++ ) {
      let intersectObject = intersects[ i ].object;

      while(intersectObject.parent) {
        const element = this.elementManager.findByElementId(intersectObject.userData.id);
        if (element) {
          selectedElements.push(element);

          break;
        }

        intersectObject = intersectObject.parent;
      }

    }

    this.elementManager.setSelected(selectedElements);

    this.update();
  }
}
