import type React from 'react';
import type { RefObject } from 'react';

type CanvasPreviewPaneProps = {
    bgSrc: string | null;
    overlaySrc: string | null;
    isDragging: boolean;
    bgImgRef: RefObject<HTMLImageElement | null>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    onBackgroundLoad: () => void;
    onPointerDown: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLCanvasElement>) => void;
};

export const CanvasPreviewPane = ({
    bgSrc,
    overlaySrc,
    isDragging,
    bgImgRef,
    canvasRef,
    onBackgroundLoad,
    onPointerDown,
    onPointerMove,
    onPointerUp,
}: CanvasPreviewPaneProps) => (
    <div className="preview-pane">
        <h3>Final Canvas</h3>
        <div className="canvas-wrapper">
            {bgSrc && (
                <img
                    ref={bgImgRef}
                    src={bgSrc}
                    alt="Background reference"
                    style={{ display: 'none' }}
                    onLoad={onBackgroundLoad}
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
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onPointerLeave={onPointerUp}
            />
            {!bgSrc && <div className="placeholder">Please upload a background image</div>}
        </div>
    </div>
);