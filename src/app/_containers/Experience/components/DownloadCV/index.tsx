'use client';

import { motion } from 'framer-motion';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

import Icon from '@/common/Icon';
import Button from '@/common/Button';

const cvHref = '/alex_nepsha_cv.pdf';

const DownloadCV = () => {
  const handleClick = () => {
    window.open(cvHref, '_blank');
  };

  return (
    <Button color="transparent" size="lg" onClick={handleClick}>
      Download full CV <Icon style={{ marginLeft: '10px' }} icon={faDownload} />
    </Button>
  );
};

export default DownloadCV;
