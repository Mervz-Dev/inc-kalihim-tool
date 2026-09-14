import { router } from "expo-router";

/**
 * Hands a photo from the scan camera screen back to whoever asked for it.
 *
 * The scan button lives on the R1-04 card; the camera is its own route. A
 * promise bridges the two: `requestCapture` opens the camera and resolves when
 * the screen reports a photo (a file URI) or is closed without one (null).
 * Only one capture is in flight at a time.
 */
let pending: ((uri: string | null) => void) | null = null;

export const requestCapture = (): Promise<string | null> =>
  new Promise((resolve) => {
    pending?.(null);
    pending = resolve;
    router.push("/scan-camera");
  });

/** Called by the camera screen exactly once, then it closes itself. */
export const completeCapture = (uri: string | null) => {
  const resolve = pending;
  pending = null;
  resolve?.(uri);
};
