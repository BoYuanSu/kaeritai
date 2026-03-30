import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './ImageEditor.css';

export default function ImageEditor() {
    const [bgSrc, setBgSrc] = useState<string | null>(null);
    const [overlaySrc, setOverlaySrc] = useState<string | null>(null);
    const [overlayOpacity, setOverlayOpacity] = useState<number>(0.5);
    const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);

    const bgImgRef = useRef<HTMLImageElement>(null);
    const overlayImgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const onBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            if (bgSrc) URL.revokeObjectURL(bgSrc);
            setBgSrc(URL.createObjectURL(e.target.files[0]));
        }
    };

    const onOverlayUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            if (overlaySrc) URL.revokeObjectURL(overlaySrc);
            setOverlaySrc(URL.createObjectURL(e.target.files[0]));
        }
    };

    useEffect(() => {
        renderCanvas();
    }, [bgSrc, overlaySrc, completedCrop, overlayOpacity, overlayPosition]);

    const renderCanvas = () => {
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
            const scaleX = overlayImg.naturalWidth / overlayImg.width;
            const scaleY = overlayImg.naturalHeight / overlayImg.height;

            const cropX = completedCrop.x * scaleX;
            const cropY = completedCrop.y * scaleY;
            const cropWidth = completedCrop.width * scaleX;
            const cropHeight = completedCrop.height * scaleY;

            const destX = (canvas.width - cropWidth) / 2 + overlayPosition.x;
            const destY = (canvas.height - cropHeight) / 2 + overlayPosition.y;

            ctx.globalAlpha = overlayOpacity;
            ctx.drawImage(
                overlayImg,
                cropX, cropY, cropWidth, cropHeight,
                destX, destY, cropWidth, cropHeight
            );
        }
    };

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
        
        const scaleOverlayX = overlayImg.naturalWidth / overlayImg.width;
        const scaleOverlayY = overlayImg.naturalHeight / overlayImg.height;
        const cropWidth = completedCrop.width * scaleOverlayX;
        const cropHeight = completedCrop.height * scaleOverlayY;
        
        const destX = (canvas.width - cropWidth) / 2 + overlayPosition.x;
        const destY = (canvas.height - cropHeight) / 2 + overlayPosition.y;

        if (clickX >= destX && clickX <= destX + cropWidth && 
            clickY >= destY && clickY <= destY + cropHeight) {
            setIsDragging(true);
            setDragStartPos({ x: clickX - overlayPosition.x, y: clickY - overlayPosition.y });
            e.stopPropagation();
        }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDragging || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const currentX = (e.clientX - rect.left) * scaleX;
        const currentY = (e.clientY - rect.top) * scaleY;
        
        setOverlayPosition({
            x: currentX - dragStartPos.x,
            y: currentY - dragStartPos.y,
        });
    };

    const handlePointerUp = () => {
        if (isDragging) setIsDragging(false);
    };

    const handleExport = () => {
        if (!canvasRef.current || !bgSrc) return;
        const dataUrl = canvasRef.current.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'composed-image.png';
        link.href = dataUrl;
        link.click();
    };

    return (
        <div className="editor-container">
            <header className="editor-header">
                <h2>Photo Composer</h2>
                <div className="controls-row">
                    <label className="upload-btn">
                        Upload Background
                        <input type="file" accept="image/*" onChange={onBgUpload} hidden />
                    </label>
                    <label className="upload-btn">
                        Upload Overlay
                        <input type="file" accept="image/*" onChange={onOverlayUpload} hidden />
                    </label>
                    <button className="export-btn" onClick={handleExport} disabled={!bgSrc}>
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
                             style={{ display: bgSrc ? 'block' : 'none', cursor: isDragging ? 'grabbing' : (overlaySrc ? 'grab' : 'default') }}
                             onPointerDown={handlePointerDown}
                             onPointerMove={handlePointerMove}
                             onPointerUp={handlePointerUp}
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
                 </div>
                 )}
            </div>
        </div>
    );
}
