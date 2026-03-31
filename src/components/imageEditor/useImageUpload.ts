import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { convertHeicToJpeg } from './utils';

type UseImageUploadOptions = {
    onUploaded?: () => void;
};

export const useImageUpload = ({ onUploaded }: UseImageUploadOptions = {}) => {
    const [src, setSrc] = useState<string | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const currentUrlRef = useRef<string | null>(null);

    const replaceSrc = useCallback((nextSrc: string | null) => {
        if (currentUrlRef.current && currentUrlRef.current !== nextSrc) {
            URL.revokeObjectURL(currentUrlRef.current);
        }

        currentUrlRef.current = nextSrc;
        setSrc(nextSrc);
    }, []);

    const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setIsConverting(true);

        try {
            const convertedFile = await convertHeicToJpeg(file);
            replaceSrc(URL.createObjectURL(convertedFile));
            onUploaded?.();
        } finally {
            setIsConverting(false);
        }
    }, [onUploaded, replaceSrc]);

    useEffect(() => () => {
        if (currentUrlRef.current) {
            URL.revokeObjectURL(currentUrlRef.current);
        }
    }, []);

    return {
        src,
        isConverting,
        handleUpload,
    };
};