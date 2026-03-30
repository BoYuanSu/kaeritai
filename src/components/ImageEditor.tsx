import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import heic2any from 'heic2any';
import 'react-image-crop/dist/ReactCrop.css';
import './ImageEditor.css';
import { createGradientMaskedOverlayCanvas, type ShapeMask } from './overlayMask';

type OverlayTransform = {
    x: number;
    y: number;
    scale: number;
};

const MIN_OVERLAY_SCALE = 0.1;
const MAX_OVERLAY_SCALE = 3;
const OVERLAY_SCALE_STEP = 0.01;
const MAX_EXPORT_DIMENSION = 1028;
const EXPORT_MIME_TYPE = 'image/png';

const clampScale = (value: number) => Math.min(MAX_OVERLAY_SCALE, Math.max(MIN_OVERLAY_SCALE, value));

const convertHeicToJpeg = async (file: File): Promise<File> => {
    // Check if file is HEIC format
    if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.endsWith('.heic') || file.name.endsWith('.heif')) {
        try {
            const conversionResult = await heic2any({ blob: file });
            const convertedBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
            const jpegFile = new File([convertedBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
                type: 'image/jpeg',
            });
            return jpegFile;
        } catch (error) {
            console.error('Failed to convert HEIC:', error);
            // Return original file if conversion fails
            return file;
        }
    }
    return file;
};

export default function ImageEditor() {
    const [bgSrc, setBgSrc] = useState<string | null>(null);
    const [overlaySrc, setOverlaySrc] = useState<string | null>(null);
    const [overlayOpacity, setOverlayOpacity] = useState<number>(0.5);
    const [overlayTransform, setOverlayTransform] = useState<OverlayTransform>({ x: 0, y: 0, scale: 1 });
    const [maskShape, setMaskShape] = useState<ShapeMask>('none');
    const [gradientMask, setGradientMask] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isBgConverting, setIsBgConverting] = useState<boolean>(false);
    const [isOverlayConverting, setIsOverlayConverting] = useState<boolean>(false);

    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);

    const bgImgRef = useRef<HTMLImageElement>(null);
    const overlayImgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const activePointerIdRef = useRef<number | null>(null);
    const dragStartPosRef = useRef({ x: 0, y: 0 });
    const pendingDragPositionRef = useRef<{ x: number; y: number } | null>(null);
    const dragRafRef = useRef<number | null>(null);
    const gradientMaskCacheRef = useRef<{ key: string | null; canvas: HTMLCanvasElement | null }>({
        key: null,
        canvas: null,
    });

    const onBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setIsBgConverting(true);
            convertHeicToJpeg(file).then((convertedFile) => {
                if (bgSrc) URL.revokeObjectURL(bgSrc);
                setBgSrc(URL.createObjectURL(convertedFile));
                setIsBgConverting(false);
            });
        }
    };

    const onOverlayUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setIsOverlayConverting(true);
            convertHeicToJpeg(file).then((convertedFile) => {
                if (overlaySrc) URL.revokeObjectURL(overlaySrc);
                setOverlaySrc(URL.createObjectURL(convertedFile));
                setOverlayTransform({ x: 0, y: 0, scale: 1 });
                gradientMaskCacheRef.current = { key: null, canvas: null };
                setIsOverlayConverting(false);
            });
        }
    };

    const getOverlayDrawMetrics = useCallback(
        (canvas: HTMLCanvasElement, overlayImg: HTMLImageElement, cropArea: Crop) => {
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
        },
        [overlayTransform]
    );

    const renderCanvas = useCallback(() => {
        const bgImg = bgImgRef.current;
        const canvas = canvasRef.current;
        const overlayImg = overlayImgRef.current;

        if (!bgImg || !canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set dimensions to match background
        canvas.width = bgImg.naturalWidth;
        canvas.height = bgImg.naturalHeight;

        // Draw background
        ctx.globalAlpha = 1.0;
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        // Draw overlay if exists
        if (overlayImg && completedCrop && completedCrop.width > 0 && completedCrop.height > 0) {
            const metrics = getOverlayDrawMetrics(canvas, overlayImg, completedCrop);
            if (!metrics) return;

            const { cropX, cropY, cropWidth, cropHeight, destX, destY, destWidth, destHeight } = metrics;

            // Determine the source to draw (raw or shape-aware gradient-masked off-screen)
            let drawSource: CanvasImageSource = overlayImg;
            if (gradientMask) {
                const cacheKey = [
                    overlaySrc,
                    cropX,
                    cropY,
                    cropWidth,
                    cropHeight,
                    maskShape,
                    overlayOpacity,
                ].join('|');

                if (gradientMaskCacheRef.current.key !== cacheKey || !gradientMaskCacheRef.current.canvas) {
                    gradientMaskCacheRef.current = {
                        key: cacheKey,
                        canvas: createGradientMaskedOverlayCanvas(
                            overlayImg,
                            cropX,
                            cropY,
                            cropWidth,
                            cropHeight,
                            maskShape,
                            overlayOpacity
                        ),
                    };
                }

                drawSource = gradientMaskCacheRef.current.canvas ?? overlayImg;
            }

            ctx.save();
            // Apply shape mask clipping
            if (maskShape === 'circle') {
                ctx.beginPath();
                ctx.ellipse(
                    destX + destWidth / 2,
                    destY + destHeight / 2,
                    destWidth / 2,
                    destHeight / 2,
                    0, 0, Math.PI * 2
                );
                ctx.clip();
            } else if (maskShape === 'rectangle') {
                ctx.beginPath();
                ctx.rect(destX, destY, destWidth, destHeight);
                ctx.clip();
            }

            ctx.globalAlpha = gradientMask ? 1 : overlayOpacity;
            if (gradientMask) {
                ctx.drawImage(drawSource as HTMLCanvasElement, destX, destY, destWidth, destHeight);
            } else {
                ctx.drawImage(
                    overlayImg,
                    cropX, cropY, cropWidth, cropHeight,
                    destX, destY, destWidth, destHeight
                );
            }
            ctx.restore();
        }
    }, [completedCrop, overlayOpacity, maskShape, gradientMask, getOverlayDrawMetrics, overlaySrc]);

    useEffect(() => {
        renderCanvas();
    }, [renderCanvas]);

    useEffect(() => {
        return () => {
            if (dragRafRef.current !== null) {
                cancelAnimationFrame(dragRafRef.current);
            }
        };
    }, []);

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!completedCrop || !overlaySrc || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;
        
        const overlayImg = overlayImgRef.current;
        if (!overlayImg) return;

        const metrics = getOverlayDrawMetrics(canvas, overlayImg, completedCrop);
        if (!metrics) return;

        const { destX, destY, destWidth, destHeight } = metrics;

        if (clickX >= destX && clickX <= destX + destWidth &&
            clickY >= destY && clickY <= destY + destHeight) {
            setIsDragging(true);
            dragStartPosRef.current = {
                x: clickX - canvas.width / 2 - overlayTransform.x,
                y: clickY - canvas.height / 2 - overlayTransform.y,
            };
            activePointerIdRef.current = e.pointerId;
            canvas.setPointerCapture(e.pointerId);
            e.stopPropagation();
        }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDragging || !canvasRef.current || activePointerIdRef.current !== e.pointerId) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const currentX = (e.clientX - rect.left) * scaleX;
        const currentY = (e.clientY - rect.top) * scaleY;

        pendingDragPositionRef.current = {
            x: currentX - canvas.width / 2 - dragStartPosRef.current.x,
            y: currentY - canvas.height / 2 - dragStartPosRef.current.y,
        };

        if (dragRafRef.current !== null) return;

        dragRafRef.current = requestAnimationFrame(() => {
            dragRafRef.current = null;
            const nextPos = pendingDragPositionRef.current;
            if (!nextPos) return;

            setOverlayTransform((prev) => {
                if (prev.x === nextPos.x && prev.y === nextPos.y) return prev;
                return {
                    ...prev,
                    x: nextPos.x,
                    y: nextPos.y,
                };
            });
        });
    };

    const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextScale = clampScale(parseFloat(e.target.value));
        setOverlayTransform((prev) => ({
            ...prev,
            scale: nextScale,
        }));
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (activePointerIdRef.current !== e.pointerId) return;

        if (dragRafRef.current !== null) {
            cancelAnimationFrame(dragRafRef.current);
            dragRafRef.current = null;

            const nextPos = pendingDragPositionRef.current;
            if (nextPos) {
                setOverlayTransform((prev) => ({
                    ...prev,
                    x: nextPos.x,
                    y: nextPos.y,
                }));
            }
        }

        pendingDragPositionRef.current = null;

        if (canvasRef.current?.hasPointerCapture(e.pointerId)) {
            canvasRef.current.releasePointerCapture(e.pointerId);
        }
        activePointerIdRef.current = null;
        if (isDragging) {
            setIsDragging(false);
        }
    };

    const handleExport = () => {
        if (!canvasRef.current || !bgSrc) return;
        // Re-render before export so export and preview always use identical mask logic.
        renderCanvas();

        const sourceCanvas = canvasRef.current;
        const longestSide = Math.max(sourceCanvas.width, sourceCanvas.height);
        const scale = longestSide > MAX_EXPORT_DIMENSION ? MAX_EXPORT_DIMENSION / longestSide : 1;

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = Math.max(1, Math.round(sourceCanvas.width * scale));
        exportCanvas.height = Math.max(1, Math.round(sourceCanvas.height * scale));

        const exportCtx = exportCanvas.getContext('2d');
        if (!exportCtx) return;

        exportCtx.drawImage(sourceCanvas, 0, 0, exportCanvas.width, exportCanvas.height);

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
            <header className="editor-header">
                <h2>Photo Composer</h2>
                <div className="controls-row">
                    <label className="upload-btn" style={{ opacity: isBgConverting ? 0.6 : 1, cursor: isBgConverting ? 'progress' : 'pointer' }}>
                        {isBgConverting ? <span className="spinner-inline"></span> : null}
                        {isBgConverting ? 'Converting...' : 'Upload Background'}
                        <input type="file" accept="image/*" onChange={onBgUpload} hidden disabled={isBgConverting} />
                    </label>
                    <label className="upload-btn" style={{ opacity: isOverlayConverting ? 0.6 : 1, cursor: isOverlayConverting ? 'progress' : 'pointer' }}>
                        {isOverlayConverting ? <span className="spinner-inline"></span> : null}
                        {isOverlayConverting ? 'Converting...' : 'Upload Overlay'}
                        <input type="file" accept="image/*" onChange={onOverlayUpload} hidden disabled={isOverlayConverting} />
                    </label>
                    <button className="export-btn" onClick={handleExport} disabled={!bgSrc || isBgConverting || isOverlayConverting}>
                        Export PNG
                    </button>
                </div>
            </header>

            <div className="workspace">
                 <div className="preview-pane">
                     <h3>Final Canvas</h3>
                     <div className="canvas-wrapper">
                         {bgSrc && (
                             <img 
                                 ref={bgImgRef} 
                                 src={bgSrc} 
                                 alt="Background reference"
                                 style={{ display: 'none' }} 
                                 onLoad={renderCanvas}
                                 crossOrigin="anonymous" 
                             />
                         )}
                         <canvas 
                             ref={canvasRef} 
                             className="final-canvas" 
                             style={{
                                 display: bgSrc ? 'block' : 'none',
                                 cursor: isDragging ? 'grabbing' : (overlaySrc ? 'grab' : 'default'),
                                 touchAction: 'none',
                             }}
                             onPointerDown={handlePointerDown}
                             onPointerMove={handlePointerMove}
                             onPointerUp={handlePointerUp}
                             onPointerCancel={handlePointerUp}
                             onPointerLeave={handlePointerUp}
                         />
                         {!bgSrc && <div className="placeholder">Please upload a background image</div>}
                     </div>
                 </div>

                 {overlaySrc && (
                 <div className="overlay-pane">
                     <h3>Crop Overlay</h3>
                     <ReactCrop
                         crop={crop}
                         onChange={(c: Crop) => setCrop(c)}
                         onComplete={(c: Crop) => setCompletedCrop(c)}
                     >
                         <img 
                            ref={overlayImgRef} 
                            src={overlaySrc} 
                            alt="Overlay reference"
                            className="overlay-img"
                            onLoad={(e) => {
                              const { width, height } = e.currentTarget;
                              const side = Math.min(width, height) * 0.8;
                              const initCrop = centerCrop(
                                makeAspectCrop({ unit: 'px', width: side }, 1, width, height),
                                width,
                                height
                              );
                              setCrop(initCrop);
                              setCompletedCrop(initCrop);
                            }}
                            crossOrigin="anonymous" 
                        />
                     </ReactCrop>
                     <div className="opacity-control">
                         <label>Overlay Opacity: {Math.round(overlayOpacity * 100)}%</label>
                         <input 
                             type="range" 
                             min="0" max="1" step="0.01" 
                             value={overlayOpacity} 
                             onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))} 
                         />
                     </div>
                     <div className="scale-control">
                         <label>Overlay Scale: {Math.round(overlayTransform.scale * 100)}%</label>
                         <input
                             type="range"
                             min={MIN_OVERLAY_SCALE}
                             max={MAX_OVERLAY_SCALE}
                             step={OVERLAY_SCALE_STEP}
                             value={overlayTransform.scale}
                             onChange={handleScaleChange}
                         />
                     </div>
                     <div className="mask-controls">
                         <div className="mask-shape-control">
                             <label>Shape Mask</label>
                             <select value={maskShape} onChange={(e) => setMaskShape(e.target.value as ShapeMask)}>
                                 <option value="none">None</option>
                                 <option value="circle">Circle</option>
                                 <option value="rectangle">Rectangle</option>
                             </select>
                         </div>
                         <div className="gradient-mask-control">
                             <label>
                                 <input
                                     type="checkbox"
                                     checked={gradientMask}
                                     onChange={(e) => setGradientMask(e.target.checked)}
                                 />
                                 Gradient Transparency
                             </label>
                         </div>
                     </div>
                 </div>
                 )}
            </div>
        </div>
    );
}
