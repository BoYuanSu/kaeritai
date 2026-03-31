import type { Crop } from 'react-image-crop';

export type OverlayTransform = {
    x: number;
    y: number;
    scale: number;
};

export type OverlayDrawMetrics = {
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
    destX: number;
    destY: number;
    destWidth: number;
    destHeight: number;
};

export type GradientMaskCache = {
    key: string | null;
    canvas: HTMLCanvasElement | null;
};

export type CompletedCrop = Crop | null;