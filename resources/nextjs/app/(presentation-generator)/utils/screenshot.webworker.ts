self.onmessage = async (event: MessageEvent<{ imageData: string }>) => {
  const { imageData } = event.data;

  // Perform any non-DOM processing here (e.g., compress the image)
  // For now, just return the original image data
  self.postMessage(imageData);
};