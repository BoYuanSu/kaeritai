import type { Crop } from 'react-image-crop';
import { createGradientMaskedOverlayCanvas, type ShapeMask } from '../overlayMask';
import { MAX_EXPORT_DIMENSION } from './constants';
import type { GradientMaskCache, OverlayDrawMetrics, OverlayTransform } from './types';

export const getOverlayDrawMetrics = (
    canvas: HTMLCanvasElement,
    overlayImg: HTMLImageElement,
    cropArea: Crop,
    overlayTransform: OverlayTransform
): OverlayDrawMetrics | null => {
    if (!cropArea.width || !cropArea.height || !overlayImg.width || !overlayImg.height) {
        return null;
    }

    const scaleX = overlayImg.naturalWidth / overlayImg.width;
    const scaleY = overlayImg.naturalHeight / overlayImg.height;

    const cropX = cropArea.x * scaleX;
    const cropY = cropArea.y * scaleY;
    const cropWidth = cropArea.width * scaleX;
    const cropHeight = cropArea.height * scaleY;

    const scaledWidth = cropWidth * overlayTransform.scale;
    const scaledHeight = cropHeight * overlayTransform.scale;

    const destX = (canvas.width - scaledWidth) / 2 + overlayTransform.x;
    const destY = (canvas.height - scaledHeight) / 2 + overlayTransform.y;

    return {
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        destX,
        destY,
        destWidth: scaledWidth,
        destHeight: scaledHeight,
    };
};

const applyShapeClip = (
    ctx: CanvasRenderingContext2D,
    shape: ShapeMask,
    destX: number,
    destY: number,
    destWidth: number,
    destHeight: number
) => {
    if (shape === 'circle') {
        ctx.beginPath();
        ctx.ellipse(
            destX + destWidth / 2,
            destY + destHeight / 2,
            destWidth / 2,
            destHeight / 2,
            0,
            0,
            Math.PI * 2
        );
        ctx.clip();
        return;
    }

    if (shape === 'rectangle') {
        ctx.beginPath();
        ctx.rect(destX, destY, destWidth, destHeight);
        ctx.clip();
    }
};

type RenderEditorCanvasArgs = {
    bgImg: HTMLImageElement;
    canvas: HTMLCanvasElement;
    overlayImg: HTMLImageElement | null;
    completedCrop: Crop | null;
    overlayTransform: OverlayTransform;
    effectiveOpacity: number;
    maskShape: ShapeMask;
    gradientMask: boolean;
    overlaySrc: string | null;
    gradientMaskCache: GradientMaskCache;
};

export const renderEditorCanvas = ({
    bgImg,
    canvas,
    overlayImg,
    completedCrop,
    overlayTransform,
    effectiveOpacity,
    maskShape,
    gradientMask,
    overlaySrc,
    gradientMaskCache,
}: RenderEditorCanvasArgs): GradientMaskCache => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return gradientMaskCache;
    }

    canvas.width = bgImg.naturalWidth;
    canvas.height = bgImg.naturalHeight;

    ctx.globalAlpha = 1;
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    if (!overlayImg || !completedCrop || completedCrop.width <= 0 || completedCrop.height <= 0) {
        return gradientMaskCache;
    }

    const metrics = getOverlayDrawMetrics(canvas, overlayImg, completedCrop, overlayTransform);
    if (!metrics) {
        return gradientMaskCache;
    }

    const { cropX, cropY, cropWidth, cropHeight, destX, destY, destWidth, destHeight } = metrics;

    let nextGradientMaskCache = gradientMaskCache;
    let drawSource: CanvasImageSource = overlayImg;

    if (gradientMask) {
        const cacheKey = [
            overlaySrc,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            maskShape,
            effectiveOpacity,
        ].join('|');

        if (gradientMaskCache.key !== cacheKey || !gradientMaskCache.canvas) {
            nextGradientMaskCache = {
                key: cacheKey,
                canvas: createGradientMaskedOverlayCanvas(
                    overlayImg,
                    cropX,
                    cropY,
                    cropWidth,
                    cropHeight,
                    maskShape,
                    effectiveOpacity
                ),
            };
        }

        drawSource = nextGradientMaskCache.canvas ?? overlayImg;
    }

    ctx.save();
    applyShapeClip(ctx, maskShape, destX, destY, destWidth, destHeight);

    ctx.globalAlpha = gradientMask ? 1 : effectiveOpacity;

    if (gradientMask) {
        ctx.drawImage(drawSource as HTMLCanvasElement, destX, destY, destWidth, destHeight);
    } else {
        ctx.drawImage(
            overlayImg,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            destX,
            destY,
            destWidth,
            destHeight
        );
    }

    ctx.restore();
    return nextGradientMaskCache;
};

export const createScaledExportCanvas = (sourceCanvas: HTMLCanvasElement) => {
    const longestSide = Math.max(sourceCanvas.width, sourceCanvas.height);
    const scale = longestSide > MAX_EXPORT_DIMENSION ? MAX_EXPORT_DIMENSION / longestSide : 1;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = Math.max(1, Math.round(sourceCanvas.width * scale));
    exportCanvas.height = Math.max(1, Math.round(sourceCanvas.height * scale));

    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) {
        return null;
    }

    exportCtx.drawImage(sourceCanvas, 0, 0, exportCanvas.width, exportCanvas.height);
    return exportCanvas;
};