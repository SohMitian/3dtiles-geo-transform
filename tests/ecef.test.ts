import { ecefToGeodetic, geodeticToECEF, ecefDistance, ecefCenter } from '../src/core/ecef';

describe('ECEF Coordinate Transformations', () => {
  describe('ecefToGeodetic', () => {
    it('should convert Tokyo coordinates correctly', () => {
      // Approximate ECEF coordinates for Tokyo
      const result = ecefToGeodetic(-3959768.229, 3352818.505, 3697478.773);
      
      expect(result.lat).toBeCloseTo(35.6762, 2);
      expect(result.lon).toBeCloseTo(139.6503, 2);
      expect(result.height).toBeCloseTo(40, 0);
    });

    it('should handle equator coordinates', () => {
      // Point on equator at prime meridian
      const result = ecefToGeodetic(6378137, 0, 0);
      
      expect(result.lat).toBeCloseTo(0, 5);
      expect(result.lon).toBeCloseTo(0, 5);
      expect(result.height).toBeCloseTo(0, 1);
    });

    it('should handle north pole coordinates', () => {
      // Approximate north pole
      const result = ecefToGeodetic(0, 0, 6356752.314);
      
      expect(result.lat).toBeCloseTo(90, 2);
      expect(result.height).toBeCloseTo(0, 1);
    });
  });

  describe('geodeticToECEF', () => {
    it('should convert Tokyo coordinates correctly', () => {
      const result = geodeticToECEF(35.6762, 139.6503, 40);
      
      expect(result.x).toBeCloseTo(-3959768.229, 0);
      expect(result.y).toBeCloseTo(3352818.505, 0);
      expect(result.z).toBeCloseTo(3697478.773, 0);
    });

    it('should handle zero height', () => {
      const result = geodeticToECEF(0, 0, 0);
      
      expect(result.x).toBeCloseTo(6378137, 0);
      expect(result.y).toBeCloseTo(0, 5);
      expect(result.z).toBeCloseTo(0, 5);
    });
  });

  describe('ecefDistance', () => {
    it('should calculate distance between two points', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 3, y: 4, z: 0 };
      
      expect(ecefDistance(p1, p2)).toBe(5);
    });

    it('should return 0 for same point', () => {
      const p1 = { x: 100, y: 200, z: 300 };
      
      expect(ecefDistance(p1, p1)).toBe(0);
    });
  });

  describe('ecefCenter', () => {
    it('should calculate center of multiple points', () => {
      const points = [
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 10, z: 10 },
        { x: 20, y: 20, z: 20 }
      ];
      
      const center = ecefCenter(points);
      
      expect(center.x).toBe(10);
      expect(center.y).toBe(10);
      expect(center.z).toBe(10);
    });

    it('should throw error for empty array', () => {
      expect(() => ecefCenter([])).toThrow('Cannot calculate center of empty array');
    });

    it('should handle single point', () => {
      const points = [{ x: 5, y: 10, z: 15 }];
      const center = ecefCenter(points);
      
      expect(center.x).toBe(5);
      expect(center.y).toBe(10);
      expect(center.z).toBe(15);
    });
  });

  describe('Round-trip conversion', () => {
    it('should maintain accuracy in round-trip conversion', () => {
      const originalLat = 35.6762;
      const originalLon = 139.6503;
      const originalHeight = 100;
      
      const ecef = geodeticToECEF(originalLat, originalLon, originalHeight);
      const geodetic = ecefToGeodetic(ecef.x, ecef.y, ecef.z);
      
      expect(geodetic.lat).toBeCloseTo(originalLat, 5);
      expect(geodetic.lon).toBeCloseTo(originalLon, 5);
      expect(geodetic.height).toBeCloseTo(originalHeight, 2);
    });
  });
});