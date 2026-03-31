import heic2any from 'heic2any';
import { centerCrop, makeAspectCrop, type Crop } from 'react-image-crop';
import {
    MAX_OVERLAY_SCALE,
    MIN_OVERLAY_SCALE,
} from './constants';

const isHeicFile = (file: File) => (
    file.type === 'image/heic'
    || file.type === 'image/heif'
    || file.name.endsWith('.heic')
    || file.name.endsWith('.heif')
);

export const clampScale = (value: number) => Math.min(MAX_OVERLAY_SCALE, Math.max(MIN_OVERLAY_SCALE, value));

export const convertHeicToJpeg = async (file: File): Promise<File> => {
    if (!isHeicFile(file)) {
        return file;
    }

    try {
        const conversionResult = await heic2any({ blob: file });
        const convertedBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;

        return new File([convertedBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
            type: 'image/jpeg',
        });
    } catch (error) {
        console.error('Failed to convert HEIC:', error);
        return file;
    }
};

export const createInitialOverlayCrop = (width: number, height: number): Crop => {
    const side = Math.min(width, height) * 0.8;

    return centerCrop(
        makeAspectCrop({ unit: 'px', width: side }, 1, width, height),
        width,
        height
    );
};