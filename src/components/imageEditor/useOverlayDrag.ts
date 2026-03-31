import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import type { RefObject, Dispatch, SetStateAction } from 'react';
import { getOverlayDrawMetrics } from './canvas';
import type { CompletedCrop, OverlayTransform } from './types';

type UseOverlayDragArgs = {
    canvasRef: RefObject<HTMLCanvasElement | null>;
    overlayImgRef: RefObject<HTMLImageElement | null>;
    overlaySrc: string | null;
    completedCrop: CompletedCrop;
    overlayTransform: OverlayTransform;
    setOverlayTransform: Dispatch<SetStateAction<OverlayTransform>>;
};

export const useOverlayDrag = ({
    canvasRef,
    overlayImgRef,
    overlaySrc,
    completedCrop,
    overlayTransform,
    setOverlayTransform,
}: UseOverlayDragArgs) => {
    const [isDragging, setIsDragging] = useState(false);
    const activePointerIdRef = useRef<number | null>(null);
    const dragStartPosRef = useRef({ x: 0, y: 0 });
    const pendingDragPositionRef = useRef<{ x: number; y: number } | null>(null);
    const dragRafRef = useRef<number | null>(null);

    const handlePointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        if (!completedCrop || !overlaySrc || !canvasRef.current) {
            return;
        }

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clickX = (event.clientX - rect.left) * scaleX;
        const clickY = (event.clientY - rect.top) * scaleY;
        const overlayImg = overlayImgRef.current;

        if (!overlayImg) {
            return;
        }

        const metrics = getOverlayDrawMetrics(canvas, overlayImg, completedCrop, overlayTransform);
        if (!metrics) {
            return;
        }

        const { destX, destY, destWidth, destHeight } = metrics;
        const clickedInsideOverlay = clickX >= destX
            && clickX <= destX + destWidth
            && clickY >= destY
            && clickY <= destY + destHeight;

        if (!clickedInsideOverlay) {
            return;
        }

        setIsDragging(true);
        dragStartPosRef.current = {
            x: clickX - canvas.width / 2 - overlayTransform.x,
            y: clickY - canvas.height / 2 - overlayTransform.y,
        };
        activePointerIdRef.current = event.pointerId;
        canvas.setPointerCapture(event.pointerId);
        event.stopPropagation();
    }, [canvasRef, completedCrop, overlayImgRef, overlaySrc, overlayTransform]);

    const handlePointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDragging || !canvasRef.current || activePointerIdRef.current !== event.pointerId) {
            return;
        }

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const currentX = (event.clientX - rect.left) * scaleX;
        const currentY = (event.clientY - rect.top) * scaleY;

        pendingDragPositionRef.current = {
            x: currentX - canvas.width / 2 - dragStartPosRef.current.x,
            y: currentY - canvas.height / 2 - dragStartPosRef.current.y,
        };

        if (dragRafRef.current !== null) {
            return;
        }

        dragRafRef.current = requestAnimationFrame(() => {
            dragRafRef.current = null;

            const nextPosition = pendingDragPositionRef.current;
            if (!nextPosition) {
                return;
            }

            setOverlayTransform((previousValue) => {
                if (previousValue.x === nextPosition.x && previousValue.y === nextPosition.y) {
                    return previousValue;
                }

                return {
                    ...previousValue,
                    x: nextPosition.x,
                    y: nextPosition.y,
                };
            });
        });
    }, [canvasRef, isDragging, setOverlayTransform]);

    const handlePointerUp = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        if (activePointerIdRef.current !== event.pointerId) {
            return;
        }

        if (dragRafRef.current !== null) {
            cancelAnimationFrame(dragRafRef.current);
            dragRafRef.current = null;

            const nextPosition = pendingDragPositionRef.current;
            if (nextPosition) {
                setOverlayTransform((previousValue) => ({
                    ...previousValue,
                    x: nextPosition.x,
                    y: nextPosition.y,
                }));
            }
        }

        pendingDragPositionRef.current = null;

        if (canvasRef.current?.hasPointerCapture(event.pointerId)) {
            canvasRef.current.releasePointerCapture(event.pointerId);
        }

        activePointerIdRef.current = null;
        setIsDragging(false);
    }, [canvasRef, setOverlayTransform]);

    useEffect(() => () => {
        if (dragRafRef.current !== null) {
            cancelAnimationFrame(dragRafRef.current);
        }
    }, []);

    return {
        isDragging,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
    };
};