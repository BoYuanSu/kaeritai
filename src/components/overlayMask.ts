export type ShapeMask = 'none' | 'circle' | 'rectangle';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const getNormalizedAxisDistance = (position: number, size: number): number => {
    if (size <= 0) return 0;
    return Math.abs((position / size) * 2 - 1);
};

export const getShapeGradientFalloff = (
    shape: ShapeMask,
    x: number,
    y: number,
    width: number,
    height: number
): number => {
    if (width <= 0 || height <= 0) {
        return 0;
    }

    const nx = getNormalizedAxisDistance(x, width);
    const ny = getNormalizedAxisDistance(y, height);

    if (shape === 'rectangle') {
        return clamp01(1 - Math.max(nx, ny));
    }

    const radialDistance = Math.sqrt(nx * nx + ny * ny);
    return clamp01(1 - radialDistance);
};

export const createGradientMaskedOverlayCanvas = (
    overlayImg: HTMLImageElement,
    cropX: number,
    cropY: number,
    cropWidth: number,
    cropHeight: number,
    shape: ShapeMask,
    opacity: number
): HTMLCanvasElement => {
    const outputWidth = Math.max(1, Math.round(cropWidth));
    const outputHeight = Math.max(1, Math.round(cropHeight));

    const offscreen = document.createElement('canvas');
    offscreen.width = outputWidth;
    offscreen.height = outputHeight;

    const offCtx = offscreen.getContext('2d');
    if (!offCtx) {
        return offscreen;
    }

    offCtx.drawImage(
        overlayImg,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        outputWidth,
        outputHeight
    );

    const imageData = offCtx.getImageData(0, 0, outputWidth, outputHeight);
    const data = imageData.data;
    const clampedOpacity = clamp01(opacity);

    for (let y = 0; y < outputHeight; y += 1) {
        for (let x = 0; x < outputWidth; x += 1) {
            const index = (y * outputWidth + x) * 4;
            const baseAlpha = data[index + 3] / 255;
            const falloff = getShapeGradientFalloff(shape, x + 0.5, y + 0.5, outputWidth, outputHeight);
            const nextAlpha = clamp01(baseAlpha * falloff * clampedOpacity);
            data[index + 3] = Math.round(nextAlpha * 255);
        }
    }

    offCtx.putImageData(imageData, 0, 0);
    return offscreen;
};
