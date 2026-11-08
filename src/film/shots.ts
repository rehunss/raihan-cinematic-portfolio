type Point = [number, number, number];

type Shot = {
  id: string;
  index: string;
  name: string;
  camera: Point;
  target: Point;
  sky: string;
  horizon: string;
  light: string;
  fog: number;
  fov: number;
};

export const shots: Shot[] = [
  { id: 'profile', index: '01', name: 'Arrival', camera: [6, 6.4, 24], target: [-1, 5.1, -13], sky: '#101e2a', horizon: '#4b8991', light: '#b1dce1', fog: .019, fov: 59 },
  { id: 'about', index: '02', name: 'Discovery', camera: [-3.4, 5.9, -26], target: [2, 6.8, -46], sky: '#10252f', horizon: '#4f8990', light: '#a9deeb', fog: .023, fov: 60 },
  { id: 'projects', index: '03A', name: 'Divia Unpad TV', camera: [-2, 4.5, -57], target: [1.6, 4.8, -72], sky: '#0e2130', horizon: '#4d8187', light: '#b5e2de', fog: .026, fov: 53 },
  { id: 'work-tiriz', index: '03B', name: 'TIRIZ', camera: [2.6, 3.6, -80], target: [-2.2, 4.3, -94], sky: '#312044', horizon: '#b67698', light: '#ffd0a9', fog: .031, fov: 53 },
  { id: 'work-cakradata', index: '03C', name: 'Cakradata', camera: [-2.6, 4.7, -104], target: [1.8, 5.1, -119], sky: '#15254b', horizon: '#507fbf', light: '#a2c8ff', fog: .026, fov: 54 },
  { id: 'experience', index: '04', name: 'Leadership', camera: [-5.5, 7.3, -137], target: [-.65, 6, -145], sky: '#38241f', horizon: '#d89253', light: '#ffcd94', fog: .021, fov: 61 },
  { id: 'impact', index: '05', name: 'Impact', camera: [-6.3, 7, -160], target: [2.5, 4.3, -178], sky: '#202c30', horizon: '#83a995', light: '#e3edc1', fog: .024, fov: 57 },
  { id: 'contact', index: '06', name: 'Departure', camera: [7, 21, -195], target: [-2, 9, -227], sky: '#26383f', horizon: '#c2c7a9', light: '#fff2cf', fog: .016, fov: 61 },
];

export const workStops = ['projects', 'work-tiriz', 'work-cakradata'] as const;

export const leadershipExhibits = [
  { id: 'ideation', point: [-6, 6.2, -143.4] },
  { id: 'hima', point: [-.65, 6.1, -143.4] },
  { id: 'bem', point: [4.7, 6.05, -143.4] },
] satisfies {id:string;point:Point}[];
