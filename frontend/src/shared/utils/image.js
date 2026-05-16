export function toMultipartImage(photo) {
  return {
    name: `snapwake-${Date.now()}.jpg`,
    type: 'image/jpeg',
    uri: photo.uri,
  };
}
