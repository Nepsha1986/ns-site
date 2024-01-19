import { createContext, RefObject } from 'react';
import { MotionValue } from 'framer-motion';

interface SceneContextProps {
  scrollYProgress: MotionValue<number>;
  scrollPosition: number | undefined;
  container: RefObject<any>;
}

const SceneContext = createContext<SceneContextProps>({} as SceneContextProps);

export default SceneContext;
