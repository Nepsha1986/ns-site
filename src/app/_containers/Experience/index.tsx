import Section from '@/common/Section';
import ExpCard from '@/common/ExpCard';
import DownloadCV from './components/DownloadCV';
import experience from './experience';

const Experience = () => {
  return (
    <Section heading="Experience" eyebrow="Career path">
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

      <footer style={{ marginTop: '2.5rem' }}>
        <DownloadCV />
      </footer>
    </Section>
  );
};

export default Experience;
