/** Whether this browser can draw the 3D street. Asked once. */
let webgl: boolean | undefined;
export function canDraw3d(): boolean {
  if (webgl === undefined) {
    try {
      const canvas = document.createElement('canvas');
      webgl = !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}
