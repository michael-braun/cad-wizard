'use client';

import React, { DragEvent, useCallback, useEffect, useRef, useState, PointerEvent } from 'react';
import { ThreeEditor } from "@/utils/three/ThreeEditor";
import { ECameraMode } from "@/utils/three/enums/ECameraMode";
import { Vector2 } from "three";

type EditorProps = {};

const Editor: React.FunctionComponent<EditorProps> = () => {
  const [threeEditor] = useState(() => new ThreeEditor())
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    threeEditor.connectDom(ref.current);
  }, [ref, threeEditor]);

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (event.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      [...event.dataTransfer.items].forEach((item, i) => {
        // If dropped items aren't files, reject them
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (!file) {
            return;
          }

          if (file.type !== 'model/obj') {
            console.error('no obj file uploaded');
            return;
          }

          threeEditor.loadObjFile(file);
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      [...event.dataTransfer.files].forEach((file, i) => {
        if (file.type !== 'model/obj') {
          console.error('no obj file uploaded');
          return;
        }

        threeEditor.loadObjFile(file);
      });
    }
  }, [threeEditor]);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleOrthographicClick = useCallback(() => {
    threeEditor.setCameraMode(ECameraMode.ORTHOGRAPHIC);
  }, [threeEditor]);

  const handlePerspectiveClick = useCallback(() => {
    threeEditor.setCameraMode(ECameraMode.PERSPECTIVE);
  }, [threeEditor]);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const pointer = new Vector2();

    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    threeEditor.selectPointer(pointer);
  }, [threeEditor]);

  const handleHomeClick = useCallback(() => {
    threeEditor.homeCamera();
  }, [threeEditor]);

  return (
    <div
      className="relative"
    >
      <div
        onDropCapture={handleDrop}
        onDragOverCapture={handleDragOver}
        onPointerDown={handlePointerDown}
        ref={ref}
        className="bg-white h-screen"
      >
      </div>
      <div className="absolute right-0 bottom-0 absolute bg-gray-600">
        <div onClick={handleOrthographicClick}>
          Orthographic
        </div>
        <div onClick={handlePerspectiveClick}>
          Perspective
        </div>
        <div onClick={handleHomeClick}>
          Home
        </div>
      </div>
    </div>
  );
};

export default Editor;
