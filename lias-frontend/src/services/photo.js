export async function preparerPhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choisissez une image JPG, PNG ou WebP.');
  if (file.size > 5 * 1024 * 1024) throw new Error('La photo doit faire moins de 5 Mo.');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image(); image.src = url; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 160;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, 160, 160);
    const size = Math.min(image.width, image.height);
    context.drawImage(image, (image.width-size)/2, (image.height-size)/2, size, size, 0, 0, 160, 160);
    return canvas.toDataURL('image/jpeg', 0.8);
  } finally { URL.revokeObjectURL(url); }
}
