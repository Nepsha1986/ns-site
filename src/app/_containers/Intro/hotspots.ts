import { projects } from '@/app/_containers/Portfolio/projects';

type Vec3 = [number, number, number];

export interface Hotspot {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  cta: string;
  // Point on the model and its outward direction, in model space.
  position: Vec3;
  normal: Vec3;
  // Model rotation and camera distance used when flying to the hotspot.
  focus: { yaw: number; pitch: number; distance: number };
}

const hotspots: Hotspot[] = [
  {
    id: 'contacts',
    label: 'Say hi',
    eyebrow: "That's me up there",
    title: "Let's talk",
    text: 'Have a project, a role or just a question? Drop me a line — I usually reply within two working days.',
    href: '/contacts',
    cta: 'Get in touch',
    position: [-1.33, 3.85, -0.05],
    normal: [-0.9, 0.3, 0.3],
    focus: { yaw: 1.0, pitch: 0.25, distance: 1.8 },
  },
  {
    id: 'about',
    label: 'About me',
    eyebrow: 'About me',
    title: 'Building for the web since 2015',
    text: 'Responsive, fast and user-friendly interfaces — with clean code behind them. Here is the longer story and my career path.',
    href: '/about',
    cta: 'Read more',
    position: [-0.35, 2.75, 0.86],
    normal: [-0.45, 0.1, 0.89],
    focus: { yaw: 0.35, pitch: 0.1, distance: 3 },
  },
  {
    id: 'projects',
    label: 'Projects',
    eyebrow: 'Portfolio',
    title: `${projects.length} projects and counting`,
    text: 'From open-source UI libraries to fintech dashboards and my own gift-idea.co.',
    href: '/about#projects',
    cta: 'See projects',
    position: [-0.85, 0.95, 1.99],
    normal: [0, 0, 1],
    focus: { yaw: 0.5, pitch: 0.1, distance: 3.4 },
  },
];

export default hotspots;
