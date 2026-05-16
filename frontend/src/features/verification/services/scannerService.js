export async function captureLiveCameraPhoto(cameraRef) {
  if (!cameraRef.current) {
    throw new Error('Camera is not ready.');
  }

  return cameraRef.current.takePictureAsync({
    base64: false,
    exif: false,
    imageType: 'jpg',
    quality: 0.82,
    skipProcessing: false,
  });
}
