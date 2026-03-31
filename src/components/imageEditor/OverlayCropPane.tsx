import type React from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import type { ShapeMask } from '../overlayMask';
import {
    MAX_OVERLAY_SCALE,
    MIN_OVERLAY_SCALE,
    OVERLAY_SCALE_STEP,
} from './constants';
import type { CompletedCrop, OverlayTransform } from './types';

type OverlayCropPaneProps = {
    overlaySrc: string;
    crop: Crop | undefined;
    completedCrop: CompletedCrop;
    overlayImgRef: React.RefObject<HTMLImageElement | null>;
    overlayTransform: OverlayTransform;
    maskShape: ShapeMask;
    gradientMask: boolean;
    effectiveOpacity: number;
    onCropChange: (crop: Crop) => void;
    onCropComplete: (crop: Crop) => void;
    onOverlayLoad: (event: React.SyntheticEvent<HTMLImageElement>) => void;
    onOpacityChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onScaleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onMaskShapeChange: (maskShape: ShapeMask) => void;
    onGradientMaskChange: (enabled: boolean) => void;
};

export const OverlayCropPane = ({
    overlaySrc,
    crop,
    completedCrop,
    overlayImgRef,
    overlayTransform,
    maskShape,
    gradientMask,
    effectiveOpacity,
    onCropChange,
    onCropComplete,
    onOverlayLoad,
    onOpacityChange,
    onScaleChange,
    onMaskShapeChange,
    onGradientMaskChange,
}: OverlayCropPaneProps) => (
    <div className="overlay-pane">
        <h3>Crop Overlay</h3>
        <ReactCrop
            crop={crop}
            onChange={onCropChange}
            onComplete={onCropComplete}
        >
            <img
                ref={overlayImgRef}
                src={overlaySrc}
                alt="Overlay reference"
                className="overlay-img"
                onLoad={onOverlayLoad}
                crossOrigin="anonymous"
            />
        </ReactCrop>
        <div className="opacity-control">
            <label>Overlay Opacity: {Math.round(effectiveOpacity * 100)}%</label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={effectiveOpacity}
                onChange={onOpacityChange}
                disabled={!completedCrop}
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
                onChange={onScaleChange}
                disabled={!completedCrop}
            />
        </div>
        <div className="mask-controls">
            <div className="mask-shape-control">
                <label>Shape Mask</label>
                <select value={maskShape} onChange={(event) => onMaskShapeChange(event.target.value as ShapeMask)}>
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
                        onChange={(event) => onGradientMaskChange(event.target.checked)}
                    />
                    Gradient Transparency
                </label>
            </div>
        </div>
    </div>
);