type ExperienceItem = {
  company: {
    name: string;
    link: string;
  };
  dateRange: string;
  position: string;
  summary?: string;
  techStack?: string[];
};

const experience: ExperienceItem[] = [
  {
    dateRange: 'September 2024 - 2026',
    company: {
      name: 'Paysera',
      link: 'https://www.paysera.com',
    },
    position: 'Senior Frontend Engineer',
    summary:
      'Developed and maintained a merchant-facing Checkout management system for a fintech business platform, built as a micro-frontend using Webpack 5 Module Federation. The application covers the full order-to-payment lifecycle: payment projects, payment links, real-time payment tracking, refunds and project settings.',
    techStack: [
      'React',
      'TypeScript',
      'RTK Query',
      'React Router',
      'React Hook Form',
      'Tailwind CSS',
      'Module Federation',
      'Jest',
      'React Testing Library',
      'i18next',
    ],
  },

  {
    dateRange: 'July 2021 - 2024',
    company: {
      name: 'Fundomate',
      link: 'https://fundomate.com',
    },
    position: 'Senior Frontend Developer',
    summary:
      'As a frontend developer, my responsibilities included overseeing the UI/UX aspects of an application designed to empower small businesses by enabling real-time financial management through an intuitive dashboard.',
    techStack: [
      'React.js',
      'Typescript',
      'JavaScript',
      'Micro-frontends',
      'Node.js',
      'Storybook',
      'SCSS',
      'Jest',
      'React Testing library',
    ],
  },

  {
    dateRange: 'June 2019 - July 2021',
    company: {
      name: 'SPD Group',
      link: 'https://spd.tech',
    },
    position: 'Middle Frontend Developer',
    summary:
      'Implemented user interfaces for websites and web-based applications, converting design mockups and wireframes into code for website and web-based application UI.',
    techStack: [
      'React.js',
      'Typescript',
      'SCSS/LESS',
      'Drupal',
      'PHP',
      'Node.js',
    ],
  },

  {
    dateRange: 'July 2017 - June 2019',
    company: {
      name: '4eck Media',
      link: 'https://4eck-media.de/',
    },
    position: 'Middle WordPress / Frontend Developer',
    summary:
      'Development of business card websites, landing pages, corporate websites, news portals based on WordPress, online stores based on PrestaShop, as well as work on an educational application using Laravel.',
    techStack: [
      'Wordpress',
      'JavaScript',
      'JQuery',
      'SCSS/LESS',
      'Vue.js',
      'Laravel',
      'Prestashop',
      'PHP',
    ],
  },

  {
    dateRange: 'June 2015 - July 2017',
    company: {
      name: 'Upwork.com',
      link: 'https://www.upwork.com',
    },
    position: 'Frontend Developer / Freelancer',
    summary:
      "I have been a freelancer since 2015. During this time, I've successfully completed more than 30 projects, with the majority developed using the WordPress CMS.",
    techStack: [
      'Wordpress',
      'Prestashop',
      'JavaScript',
      'JQuery',
      'HTML',
      'SCSS/LESS',
      'PHP',
    ],
  },
];

export default experience;
