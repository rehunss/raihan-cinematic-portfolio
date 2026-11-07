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
  { id: 'about', index: '02', name: 'Discovery', camera: [-3.4, 5.9, -26], target: [2, 6.8, -46], sky: '#0e1a28', horizon: '#416e80', light: '#a5cee7', fog: .023, fov: 60 },
  { id: 'projects', index: '03A', name: 'Divia Unpad TV', camera: [-2, 4.5, -57], target: [1.6, 4.8, -72], sky: '#0e2130', horizon: '#4d8187', light: '#b5e2de', fog: .026, fov: 53 },
  { id: 'work-tiriz', index: '03B', name: 'TIRIZ', camera: [2.6, 3.6, -80], target: [-2.2, 4.3, -94], sky: '#2b2031', horizon: '#956b87', light: '#ffd4c0', fog: .031, fov: 53 },
  { id: 'work-cakradata', index: '03C', name: 'Cakradata', camera: [-2.6, 4.7, -104], target: [1.8, 5.1, -119], sky: '#121e2f', horizon: '#5375a1', light: '#b8ceff', fog: .026, fov: 54 },
  { id: 'experience', index: '04', name: 'Transformation', camera: [7.5, 7.3, -133], target: [-2.8, 6.5, -150], sky: '#2c2021', horizon: '#c48056', light: '#ffcc9c', fog: .021, fov: 61 },
  { id: 'impact', index: '05', name: 'Impact', camera: [-6.3, 7, -160], target: [2.5, 4.3, -178], sky: '#19282a', horizon: '#718c79', light: '#d6e8bb', fog: .024, fov: 57 },
  { id: 'contact', index: '06', name: 'Departure', camera: [7, 21, -195], target: [-2, 9, -227], sky: '#182830', horizon: '#a3b3ae', light: '#e4e6d1', fog: .016, fov: 61 },
];

export const workStops = ['projects', 'work-tiriz', 'work-cakradata'] as const;
