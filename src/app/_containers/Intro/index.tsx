'use client';

import React from 'react';

import Scene from '@/components/Scene';
import Ground1 from '@/components/EasterIsland/Ground1';
import Ground2 from '@/components/EasterIsland/Ground2';
import Ground3 from '@/components/EasterIsland/Ground3';
import Ground4 from '@/components/EasterIsland/Ground4';
import Mountains from '@/components/EasterIsland/Mountains';
import Sun from '@/components/EasterIsland/Sun';
import Clouds from '@/components/EasterIsland/Clouds';

const Intro = () => {
  return (
    <section id="intro">
      <Scene background="linear-gradient(to top, #ff9d5e, #fe9857, #fc934f, #fb8d48, #f98840)">
        <Scene.Item depth={-900} width="180%" bottom="-200px" left="-40%">
          <Sun />
        </Scene.Item>

        <Scene.Item depth={-600} width="200%" top="-40%" left="-50%">
          <Clouds />
        </Scene.Item>

        <Scene.Item depth={-400} width="200%" bottom="-600px" left="-50%">
          <Mountains />
        </Scene.Item>

        <Scene.Item depth={-200} width="160%" bottom="-400px" left="-30%">
          <Ground4 />
        </Scene.Item>

        <Scene.Item depth={-140} width="125%" bottom="-180px" left="-12.5%">
          <Ground3 />
        </Scene.Item>

        <Scene.Item depth={-100} width="120%" bottom="-140px" left="-10%">
          <Ground2 />
        </Scene.Item>

        <Scene.Item depth={0} width="100%" bottom="0px">
          <Ground1 />
        </Scene.Item>
      </Scene>
    </section>
  );
};

export default Intro;
