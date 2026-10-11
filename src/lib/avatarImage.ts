/** The largest centered square inside a w × h image. */
export function centerSquare(width: number, height: number) {
  const size = Math.min(width, height);

  return { x: (width - size) / 2, y: (height - size) / 2, size };
}

/** Crops a picked photo to a centered square and shrinks it to a small JPEG for upload. */
export async function squareJpeg(file: File, size = 256): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const { x, y, size: side } = centerSquare(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas.getContext('2d')!.drawImage(img, x, y, side, side, 0, 0, size, size);

    return await new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Couldn't read that photo"))),
        'image/jpeg',
        0.85,
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
