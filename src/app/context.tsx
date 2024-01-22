import { createContext } from 'react';

export type HomePageSection = 'about' | 'experience' | 'contacts';

interface HomePageContextProps {
  activeSection: HomePageSection;
  setActiveSection: (section: HomePageSection) => void;
}

const HomePageContext = createContext<HomePageContextProps>(
  {} as HomePageContextProps,
);

export default HomePageContext;
