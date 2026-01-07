// Unit conversion constants
const METERS_TO_FEET = 3.28084;
const SQM_TO_SQFT = 10.7639;
const CUM_TO_CUFT = 35.3147;

// Type definitions for raw RoomPlan JSON
interface RawRoomPlanData {
  version: number;
  walls: RawWall[];
  floors: RawFloor[];
  doors: RawDoor[];
  windows: RawWindow[];
  openings: RawOpening[];
  objects: RawObject[];
  rooms: any[];
}

interface RawWall {
  dimensions: [number, number, number]; // [width, height, depth] in meters
  confidence: { high?: {}; medium?: {}; low?: {} };
  identifier: string;
  parentIdentifier: string | null;
}

interface RawFloor {
  dimensions: [number, number, number];
  polygonCorners: [number, number, number][]; // [x, y, z] coordinates
  confidence: { high?: {}; medium?: {}; low?: {} };
  identifier: string;
}

interface RawDoor {
  dimensions: [number, number, number];
  parentIdentifier: string;
  identifier: string;
  category: { door: { isOpen: boolean } };
  confidence: { high?: {}; medium?: {}; low?: {} };
}

interface RawWindow {
  dimensions: [number, number, number];
  parentIdentifier: string;
  identifier: string;
  confidence: { high?: {}; medium?: {}; low?: {} };
}

interface RawOpening {
  dimensions: [number, number, number];
  identifier: string;
  confidence: { high?: {}; medium?: {}; low?: {} };
}

interface RawObject {
  dimensions: [number, number, number];
  category: Record<string, any>;
  identifier: string;
}

// Type definitions for simplified output
interface DualUnit {
  ft: number;
  m: number;
}

interface DualAreaUnit {
  sqFt: number;
  sqM: number;
}

interface DualVolumeUnit {
  cuFt: number;
  cuM: number;
}

export interface SimplifiedRoomData {
  scanId: string;
  scannedAt: string;

  summary: {
    floorArea: DualAreaUnit;
    ceilingHeight: DualUnit;
    roomVolume: DualVolumeUnit;
    totalWallArea: DualAreaUnit;
    linearWallFeet: number;
  };

  walls: Array<{
    id: string;
    width: DualUnit;
    height: DualUnit;
    area: DualAreaUnit;
    confidence: "high" | "medium" | "low";
    hasDoor: boolean;
    hasWindow: boolean;
  }>;

  doors: Array<{
    id: string;
    width: DualUnit;
    height: DualUnit;
    isOpen: boolean;
    wallId: string | null;
  }>;

  windows: Array<{
    id: string;
    width: DualUnit;
    height: DualUnit;
    wallId: string | null;
  }>;

  openings: Array<{
    id: string;
    width: DualUnit;
    height: DualUnit;
  }>;

  objects: Array<{
    type: string;
    dimensions: {
      width: DualUnit;
      height: DualUnit;
      depth: DualUnit;
    };
  }>;

  dryingMetrics: {
    recommendedAirMovers: { min: number; max: number };
    linearFeetForAirMovers: number;
    airChangesPerHour: number;
  };
}

// Helper functions
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function metersToFeet(m: number): number {
  return round2(m * METERS_TO_FEET);
}

function sqMetersToSqFeet(sqM: number): number {
  return round2(sqM * SQM_TO_SQFT);
}

function cuMetersToCuFeet(cuM: number): number {
  return round2(cuM * CUM_TO_CUFT);
}

function toDualUnit(meters: number): DualUnit {
  return {
    ft: metersToFeet(meters),
    m: round2(meters),
  };
}

function toDualAreaUnit(sqMeters: number): DualAreaUnit {
  return {
    sqFt: sqMetersToSqFeet(sqMeters),
    sqM: round2(sqMeters),
  };
}

function toDualVolumeUnit(cuMeters: number): DualVolumeUnit {
  return {
    cuFt: cuMetersToCuFeet(cuMeters),
    cuM: round2(cuMeters),
  };
}

function getConfidence(conf: {
  high?: {};
  medium?: {};
  low?: {};
}): "high" | "medium" | "low" {
  if (conf.high !== undefined) return "high";
  if (conf.medium !== undefined) return "medium";
  return "low";
}

function calculatePolygonArea(corners: [number, number, number][]): number {
  // Shoelace formula for polygon area
  // Using x (index 0) and y (index 1) coordinates - floor is on XY plane with z=0
  if (corners.length < 3) return 0;

  let area = 0;
  const n = corners.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += corners[i][0] * corners[j][1];
    area -= corners[j][0] * corners[i][1];
  }
  return Math.abs(area) / 2;
}

function getObjectType(category: Record<string, any>): string {
  const keys = Object.keys(category);
  if (keys.length > 0) {
    return keys[0];
  }
  return "unknown";
}

function generateScanId(): string {
  return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function transformRoomPlanData(raw: RawRoomPlanData): SimplifiedRoomData {
  const scanId = generateScanId();
  const scannedAt = new Date().toISOString();

  // Build lookup sets for doors and windows by wall ID
  const doorWallIds = new Set<string>();
  const windowWallIds = new Set<string>();

  raw.doors?.forEach((door) => {
    if (door.parentIdentifier) {
      doorWallIds.add(door.parentIdentifier);
    }
  });

  raw.windows?.forEach((window) => {
    if (window.parentIdentifier) {
      windowWallIds.add(window.parentIdentifier);
    }
  });

  // Process walls
  const walls = (raw.walls || []).map((wall) => {
    const widthM = wall.dimensions[0];
    const heightM = wall.dimensions[1];
    const areaSqM = widthM * heightM;

    return {
      id: wall.identifier,
      width: toDualUnit(widthM),
      height: toDualUnit(heightM),
      area: toDualAreaUnit(areaSqM),
      confidence: getConfidence(wall.confidence),
      hasDoor: doorWallIds.has(wall.identifier),
      hasWindow: windowWallIds.has(wall.identifier),
    };
  });

  // Calculate floor area from polygonCorners if available, otherwise use dimensions
  let floorAreaSqM = 0;
  if (raw.floors && raw.floors.length > 0) {
    const floor = raw.floors[0];
    if (floor.polygonCorners && floor.polygonCorners.length >= 3) {
      floorAreaSqM = calculatePolygonArea(floor.polygonCorners);
    } else {
      // Fallback to dimensions (width * height for floor = length * width)
      floorAreaSqM = floor.dimensions[0] * floor.dimensions[1];
    }
  }

  // Get ceiling height from wall heights (use median for consistency)
  let ceilingHeightM = 0;
  if (walls.length > 0) {
    const heights = walls.map((w) => w.height.m).sort((a, b) => a - b);
    const midIndex = Math.floor(heights.length / 2);
    ceilingHeightM =
      heights.length % 2 === 0
        ? (heights[midIndex - 1] + heights[midIndex]) / 2
        : heights[midIndex];
  }

  // Calculate total wall area and linear feet
  const totalWallAreaSqM = walls.reduce((sum, w) => sum + w.area.sqM, 0);
  const linearWallMeters = walls.reduce((sum, w) => sum + w.width.m, 0);
  const linearWallFeet = round2(linearWallMeters * METERS_TO_FEET);

  // Calculate room volume
  const roomVolumeCuM = floorAreaSqM * ceilingHeightM;

  // Process doors
  const doors = (raw.doors || []).map((door) => ({
    id: door.identifier,
    width: toDualUnit(door.dimensions[0]),
    height: toDualUnit(door.dimensions[1]),
    isOpen: door.category?.door?.isOpen ?? false,
    wallId: door.parentIdentifier || null,
  }));

  // Process windows
  const windows = (raw.windows || []).map((window) => ({
    id: window.identifier,
    width: toDualUnit(window.dimensions[0]),
    height: toDualUnit(window.dimensions[1]),
    wallId: window.parentIdentifier || null,
  }));

  // Process openings
  const openings = (raw.openings || []).map((opening) => ({
    id: opening.identifier,
    width: toDualUnit(opening.dimensions[0]),
    height: toDualUnit(opening.dimensions[1]),
  }));

  // Process objects
  const objects = (raw.objects || []).map((obj) => ({
    type: getObjectType(obj.category),
    dimensions: {
      width: toDualUnit(obj.dimensions[0]),
      height: toDualUnit(obj.dimensions[1]),
      depth: toDualUnit(obj.dimensions[2]),
    },
  }));

  // Calculate IICRC S500 drying metrics
  // Air movers: 1 per 10-16 linear feet of wall for Class 1-2 water damage
  const airMoversMin = Math.ceil(linearWallFeet / 16);
  const airMoversMax = Math.ceil(linearWallFeet / 10);

  // Air changes per hour recommendation (typically 4-6 for drying)
  // Volume in cubic feet / 60 gives CFM needed for 1 ACH
  const roomVolumeCuFt = cuMetersToCuFeet(roomVolumeCuM);
  const airChangesPerHour = round2(roomVolumeCuFt / 60);

  return {
    scanId,
    scannedAt,
    summary: {
      floorArea: toDualAreaUnit(floorAreaSqM),
      ceilingHeight: toDualUnit(ceilingHeightM),
      roomVolume: toDualVolumeUnit(roomVolumeCuM),
      totalWallArea: toDualAreaUnit(totalWallAreaSqM),
      linearWallFeet,
    },
    walls,
    doors,
    windows,
    openings,
    objects,
    dryingMetrics: {
      recommendedAirMovers: { min: airMoversMin, max: airMoversMax },
      linearFeetForAirMovers: linearWallFeet,
      airChangesPerHour,
    },
  };
}
