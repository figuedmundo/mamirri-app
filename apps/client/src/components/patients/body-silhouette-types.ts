export type AnatomicalPoint =
  | 'head'
  | 'shoulders'
  | 'spine'
  | 'pelvis'
  | 'knees'
  | 'feet';

export type DeviationType =
  | 'normal'
  | 'anteversion'
  | 'retroversion'
  | 'kyphosis'
  | 'lordosis'
  | 'scoliosis'
  | 'valgus'
  | 'varus'
  | 'external-rotation-left'
  | 'external-rotation-right'
  | 'lateralization-left'
  | 'lateralization-right';

export type DeviationSeverity = 'normal' | 'mild' | 'severe';

export interface PointStatus {
  deviation: DeviationType;
  severity: DeviationSeverity;
}

export interface BodySilhouetteProps {
  values: Record<AnatomicalPoint, PointStatus>;
  onChange: (point: AnatomicalPoint, status: PointStatus) => void;
  className?: string;
}

export function createDefaultPointStatus(): Record<
  AnatomicalPoint,
  PointStatus
> {
  return {
    head: { deviation: 'normal', severity: 'normal' },
    shoulders: { deviation: 'normal', severity: 'normal' },
    spine: { deviation: 'normal', severity: 'normal' },
    pelvis: { deviation: 'normal', severity: 'normal' },
    knees: { deviation: 'normal', severity: 'normal' },
    feet: { deviation: 'normal', severity: 'normal' },
  };
}
