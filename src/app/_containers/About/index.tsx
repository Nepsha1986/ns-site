import Section from '@/common/Section';

const About = () => {
  return (
    <Section id="about" heading="About" style={{ fontSize: '1.15rem' }}>
      <p>
        I am a highly skilled frontend developer with a passion for crafting
        seamless and visually appealing user experiences.
      </p>

      <p>
        Experienced in diverse web technologies, I creatively transform design
        mockups into responsive websites. I specialize in optimizing site
        performance, and turning ideas into user-friendly interfaces. Committed
        to staying current with industry trends, I deliver high-quality code.
      </p>

      <p>
        I also own{' '}
        <a href="https://gift-idea.co/en-us/" target="_blank">
          gift-idea.co
        </a>
        , curating and presenting unique gift ideas to showcase my passion for
        creating engaging online experiences.
      </p>
    </Section>
  );
};

export default About;
