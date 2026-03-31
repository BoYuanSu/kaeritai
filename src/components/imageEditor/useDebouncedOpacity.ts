import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import {
    DEFAULT_OVERLAY_OPACITY,
    OPACITY_COMMIT_DELAY_MS,
} from './constants';

export const useDebouncedOpacity = () => {
    const [overlayOpacity, setOverlayOpacity] = useState(DEFAULT_OVERLAY_OPACITY);
    const [pendingOpacity, setPendingOpacity] = useState<number | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleOpacityChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const nextOpacity = parseFloat(event.target.value);
        setPendingOpacity(nextOpacity);

        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setOverlayOpacity(nextOpacity);
            setPendingOpacity(null);
            timeoutRef.current = null;
        }, OPACITY_COMMIT_DELAY_MS);
    }, []);

    useEffect(() => () => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
        }
    }, []);

    return {
        overlayOpacity,
        pendingOpacity,
        effectiveOpacity: pendingOpacity ?? overlayOpacity,
        handleOpacityChange,
    };
};