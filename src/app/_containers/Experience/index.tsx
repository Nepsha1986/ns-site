import Section from '@/common/Section';
import ExpCard from '@/common/ExpCard';
import experience from './experience';

const Experience = () => {
  return (
    <Section id="experience" heading="Experience">
      {experience.map((i, index) => (
        <ExpCard
          key={index}
          company={i.company}
          position={i.position}
          dateRange={i.dateRange}
          summary={i.summary}
          techStack={i.techStack}
        />
      ))}
    </Section>
  );
};

export default Experience;
