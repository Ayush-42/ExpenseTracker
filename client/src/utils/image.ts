const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_SOURCE_BYTES = 10 * 1024 * 1024;

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('That file could not be read as an image.'));
    };
    image.src = objectUrl;
  });

/**
 * Centre-crops to a square and shrinks to `size` px so the stored data URL stays
 * a few hundred kilobytes regardless of the original photo.
 */
export const createSquareThumbnail = async (file: File, size = 256): Promise<string> => {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error('Please choose a PNG, JPEG or WebP image.');
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('Please choose an image smaller than 10 MB.');
  }

  const image = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Your browser could not process this image.');
  }

  const edge = Math.min(image.width, image.height);
  const sourceX = (image.width - edge) / 2;
  const sourceY = (image.height - edge) / 2;

  context.drawImage(image, sourceX, sourceY, edge, edge, 0, 0, size, size);

  return canvas.toDataURL('image/jpeg', 0.85);
};
