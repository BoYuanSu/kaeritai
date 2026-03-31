import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './ImageEditor.css';
import { type ShapeMask } from './overlayMask';
import { CanvasPreviewPane } from './imageEditor/CanvasPreviewPane';
import { EXPORT_MIME_TYPE, DEFAULT_OVERLAY_TRANSFORM } from './imageEditor/constants';
import { createScaledExportCanvas, renderEditorCanvas } from './imageEditor/canvas';
import { ImageEditorHeader } from './imageEditor/ImageEditorHeader';
import { OverlayCropPane } from './imageEditor/OverlayCropPane';
import type { GradientMaskCache, OverlayTransform } from './imageEditor/types';
import { useDebouncedOpacity } from './imageEditor/useDebouncedOpacity';
import { useImageUpload } from './imageEditor/useImageUpload';
import { useOverlayDrag } from './imageEditor/useOverlayDrag';
import { clampScale, createInitialOverlayCrop } from './imageEditor/utils';

export default function ImageEditor() {
    const [overlayTransform, setOverlayTransform] = useState<OverlayTransform>(DEFAULT_OVERLAY_TRANSFORM);
    const [maskShape, setMaskShape] = useState<ShapeMask>('none');
    const [gradientMask, setGradientMask] = useState<boolean>(false);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);

    const bgImgRef = useRef<HTMLImageElement>(null);
    const overlayImgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gradientMaskCacheRef = useRef<GradientMaskCache>({
        key: null,
        canvas: null,
    });

    const resetOverlayEditorState = useCallback(() => {
        setCrop(undefined);
        setCompletedCrop(null);
        setOverlayTransform(DEFAULT_OVERLAY_TRANSFORM);
        gradientMaskCacheRef.current = { key: null, canvas: null };
    }, []);

    const {
        src: bgSrc,
        isConverting: isBgConverting,
        handleUpload: onBgUpload,
    } = useImageUpload();
    const {
        src: overlaySrc,
        isConverting: isOverlayConverting,
        handleUpload: onOverlayUpload,
    } = useImageUpload({ onUploaded: resetOverlayEditorState });
    const {
        effectiveOpacity,
        handleOpacityChange,
    } = useDebouncedOpacity();

    const {
        isDragging,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
    } = useOverlayDrag({
        canvasRef,
        overlayImgRef,
        overlaySrc,
        completedCrop,
        overlayTransform,
        setOverlayTransform,
    });

    const renderCanvas = useCallback(() => {
        const bgImg = bgImgRef.current;
        const canvas = canvasRef.current;
        const overlayImg = overlayImgRef.current;

        if (!bgImg || !canvas) {
            return;
        }

        gradientMaskCacheRef.current = renderEditorCanvas({
            bgImg,
            canvas,
            overlayImg,
            completedCrop,
            overlayTransform,
            effectiveOpacity,
            maskShape,
            gradientMask,
            overlaySrc,
            gradientMaskCache: gradientMaskCacheRef.current,
        });
    }, [completedCrop, effectiveOpacity, gradientMask, maskShape, overlaySrc, overlayTransform]);

    useEffect(() => {
        renderCanvas();
    }, [renderCanvas]);

    const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextScale = clampScale(parseFloat(e.target.value));
        setOverlayTransform((prev) => ({
            ...prev,
            scale: nextScale,
        }));
    };

    const handleOverlayImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = event.currentTarget;
        const initialCrop = createInitialOverlayCrop(width, height);
        setCrop(initialCrop);
        setCompletedCrop(initialCrop);
    }, []);

    const handleExport = () => {
        if (!canvasRef.current || !bgSrc) return;
        renderCanvas();

        const sourceCanvas = canvasRef.current;
        const exportCanvas = createScaledExportCanvas(sourceCanvas);
        if (!exportCanvas) return;

        exportCanvas.toBlob(
            (blob) => {
                if (!blob) return;
                const link = document.createElement('a');
                const objectUrl = URL.createObjectURL(blob);
                link.download = 'composed-image.png';
                link.href = objectUrl;
                link.click();
                URL.revokeObjectURL(objectUrl);
            },
            EXPORT_MIME_TYPE,
            0.85
        );
    };

    return (
        <div className="editor-container">
            <ImageEditorHeader
                isBgConverting={isBgConverting}
                isOverlayConverting={isOverlayConverting}
                hasBackground={Boolean(bgSrc)}
                onBgUpload={onBgUpload}
                onOverlayUpload={onOverlayUpload}
                onExport={handleExport}
            />

            <div className="workspace">
                <CanvasPreviewPane
                    bgSrc={bgSrc}
                    overlaySrc={overlaySrc}
                    isDragging={isDragging}
                    bgImgRef={bgImgRef}
                    canvasRef={canvasRef}
                    onBackgroundLoad={renderCanvas}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                />

                {overlaySrc && (
                    <OverlayCropPane
                        overlaySrc={overlaySrc}
                        crop={crop}
                        completedCrop={completedCrop}
                        overlayImgRef={overlayImgRef}
                        overlayTransform={overlayTransform}
                        maskShape={maskShape}
                        gradientMask={gradientMask}
                        effectiveOpacity={effectiveOpacity}
                        onCropChange={setCrop}
                        onCropComplete={setCompletedCrop}
                        onOverlayLoad={handleOverlayImageLoad}
                        onOpacityChange={handleOpacityChange}
                        onScaleChange={handleScaleChange}
                        onMaskShapeChange={setMaskShape}
                        onGradientMaskChange={setGradientMask}
                    />
                )}
            </div>
        </div>
    );
}
