interface Company {
  name: string;
  url: string;
}

const companies: Record<string, Company> = {
  personal: {
    name: '-',
    url: 'https://github.com/Nepsha1986',
  },
  upwork: {
    name: 'Upwork',
    url: 'https://www.upwork.com/',
  },
  fundomate: {
    name: 'Fundomate',
    url: 'https://fundomate.com/',
  },
  spd: {
    name: 'SPD Group',
    url: 'https://spd.tech/',
  },
  fmedia: {
    name: '4eck Media',
    url: 'https://4eck-media.de/',
  },
} as const;

type Project = {
  name: string;
  year: number | string;
  company: Company;
  technologies: string[];
  link?: string;
};

export const projects: Project[] = [
  {
    name: 'Gift Ideas',
    year: '2024 - present',
    technologies: ['Astro', 'Next.js', 'React.js', 'TypeScript', 'Auth0'],
    company: companies.personal,
    link: 'https://gift-idea.co',
  },
  {
    name: 'Personal Website',
    year: 2023,
    technologies: ['Next.js', 'React.js', 'TypeScript', 'SCSS', 'Three.js'],
    company: companies.personal,
    link: 'https://alex.gift-idea.co',
  },
  {
    name: 'Rsuite',
    year: 2023,
    technologies: ['React.js', 'TypeScript'],
    company: {
      name: 'open-source',
      url: 'https://github.com/rsuite/rsuite',
    },
    link: 'https://rsuitejs.com',
  },
  {
    name: 'Paralax Demo',
    year: 2023,
    technologies: ['Next.js', 'React.js', 'TypeScript', 'SCSS'],
    company: companies.personal,
    link: 'https://fable.gift-idea.co',
  },
  {
    name: 'Financial Application',
    year: '2021 - 2023',
    company: companies.fundomate,
    technologies: ['React.js', 'MobX', 'TypeScript', 'Jest', 'Micro Frontends'],
  },
  {
    name: 'Management Dashboard',
    year: '2021 - 2023',
    company: companies.fundomate,
    technologies: ['React.js', 'MobX', 'React Query', 'Micro Frontends'],
  },
  {
    name: 'Internal UI Kit',
    year: '2021 - 2023',
    company: companies.fundomate,
    technologies: ['React.js', 'TypeScript', 'SCSS', 'Storybook'],
  },
  {
    name: 'Gift Card Mall',
    year: '2019 - 2021',
    company: companies.spd,
    technologies: ['Drupal', 'React.js', 'LESS', 'Node.js'],
  },
  {
    name: 'Abs Werbestudio',
    year: 2019,
    company: companies.fmedia,
    technologies: ['WordPress', 'PHP', 'JavaScript', 'SCSS', 'Unyson'],
    link: 'https://www.abs-werbestudio.de',
  },
  {
    name: 'Coralaxy',
    year: 2019,
    company: companies.fmedia,
    technologies: ['PrestaShop', 'PHP', 'JQuery', 'SCSS'],
    link: 'https://coralaxy.de',
  },
  {
    name: 'Tutkit',
    year: '2017 - 2018',
    company: companies.fmedia,
    technologies: ['Laravel', 'Vue.js', 'PHP', 'JavaScript', 'SCSS'],
    link: 'https://www.tutkit.com',
  },
  {
    name: 'Spitzbergen Adventures',
    year: 2018,
    company: companies.fmedia,
    technologies: ['WordPress', 'PHP', 'JavaScript', 'SCSS'],
    link: 'https://www.spitzbergen-adventures.com',
  },
  {
    name: 'Mandt Buero',
    year: 2017,
    company: companies.fmedia,
    technologies: ['WordPress', 'ACF', 'PHP', 'JQuery', 'SCSS'],
    link: 'https://www.mandt-buero.de',
  },
  {
    name: 'Zwei Wassser',
    year: 2017,
    company: companies.fmedia,
    technologies: ['WordPress', 'ACF', 'PHP', 'JQuery', 'SCSS'],
    link: 'https://zwei-wasser.de',
  },
  {
    name: 'Tenth Congressional District Democrats',
    year: 2016,
    company: companies.upwork,
    technologies: ['WordPress', 'PHP', 'JavaScript'],
    link: 'https://tenthdems.org',
  },
  {
    name: 'Mobile SMS Marketing',
    year: 2016,
    company: companies.upwork,
    technologies: ['WordPress', 'PHP', 'JQuery', 'SCSS'],
    link: 'https://mobilesmsmarketing.ca',
  },
  {
    name: 'Precision Pilates',
    year: 2016,
    company: companies.upwork,
    technologies: ['WordPress', 'PHP', 'JQuery'],
    link: 'https://www.precisionpilatesllc.com',
  },
  {
    name: 'Sivananda Ashram Yoga Ranch',
    year: 2015,
    company: companies.upwork,
    technologies: ['WordPress', 'PHP', 'CSS'],
    link: 'https://sivanandayogaranch.org',
  },
];
