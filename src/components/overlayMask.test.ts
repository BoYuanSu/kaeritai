import { describe, expect, it } from 'vitest';
import { getShapeGradientFalloff } from './overlayMask';

describe('getShapeGradientFalloff', () => {
    it('keeps rectangle gradient rectangular near corners', () => {
        const center = getShapeGradientFalloff('rectangle', 50, 50, 100, 100);
        const nearHorizontalEdge = getShapeGradientFalloff('rectangle', 95, 50, 100, 100);
        const nearCorner = getShapeGradientFalloff('rectangle', 95, 95, 100, 100);

        expect(center).toBeCloseTo(1, 2);
        expect(nearHorizontalEdge).toBeLessThan(center);
        expect(nearCorner).toBeCloseTo(nearHorizontalEdge, 2);
    });

    it('keeps circle behavior radial', () => {
        const center = getShapeGradientFalloff('circle', 50, 50, 100, 100);
        const edge = getShapeGradientFalloff('circle', 100, 50, 100, 100);
        const corner = getShapeGradientFalloff('circle', 100, 100, 100, 100);

        expect(center).toBeCloseTo(1, 2);
        expect(edge).toBeLessThan(center);
        expect(corner).toBeLessThanOrEqual(edge);
    });
});
