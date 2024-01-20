type ExperienceItem = {
  company: string;
  dateRange: string;
  position: string;
  summary?: string;
  techStack?: string[];
};

const experience: ExperienceItem[] = [
  {
    dateRange: 'July 2021 - September 2023',
    company: 'Fundomate',
    position: 'Senior Frontend Developer',
    summary:
      'As a frontend developer, my responsibilities included overseeing the UI/UX aspects of an application designed to empower small businesses by enabling real-time financial management through an intuitive dashboard.',
    techStack: [
      'React.js',
      'Typescript',
      'JavaScript',
      'Node.js',
      'SCSS',
      'Storybook',
      'Jest',
      'React Testing library',
      'MobX',
      'Yup',
      'react-hook-form',
      'Micro-frontends',
      'Single SPA',
      'Webpack',
      'Rollup',
      'Smartlook',
      'Cypress',
      'Linter',
      'Prettier',
      'Figma',
      'Zeplin',
      'npm',
    ],
  },

  {
    dateRange: 'June 2019 - July 2021',
    company: 'SPD Group',
    position: 'Middle Frontend Developer',
    summary:
      'Implemented user interfaces for websites and web-based applications, converting design mockups and wireframes into code for website and web-based application UI.',
    techStack: [
      'React.js',
      'Typescript',
      'SCSS',
      'LESS',
      'PHP',
      'Drupal',
      'Docker',
      'Node.js',
      'Yup',
      'Formik',
      'Linter',
      'Prettier',
      'Figma',
    ],
  },

  {
    dateRange: 'July 2017 - June 2019',
    company: '4eck Media',
    position: 'Middle WordPress / Frontend Developer',
    summary:
      'Development of business card websites, landing pages, corporate websites, news portals based on WordPress, online stores based on PrestaShop, as well as work on an educational application using Laravel.',
    techStack: [
      'JavaScript',
      'HTML/CSS',
      'Vue.js',
      'Laravel',
      'Wordpress',
      'Prestashop',
      'PHP',
      'Gulp',
      'Node.js',
      'JQuery',
      'SCSS',
      'Firebase',
      'Node.js',
      'Photoshop',
      'Zeplin',
    ],
  },

  {
    dateRange: 'June 2015 - July 2017',
    company: 'Upwork.com',
    position: 'Frontend Developer',
    summary:
      "I have been a freelancer since 2015. During this time, I've successfully completed more than 30 projects, with the majority developed using the WordPress CMS.",
    techStack: [
      'HTML/CSS/JS',
      'Wordpress',
      'Prestashop',
      'PHP',
      'SCSS',
      'Gulp',
      'Grunt',
      'JQuery',
      'Photoshop',
    ],
  },
];

export default experience;
