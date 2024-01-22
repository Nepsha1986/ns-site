import { ComponentPropsWithRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface Props extends ComponentPropsWithRef<'span'> {
  icon: IconProp;
}
const Icon = ({ icon, style, ...props }: Props) => {
  return (
    <span
      style={{
        width: '1em',
        height: '1em',
        fontSize: '1em',
        display: 'inline-block',
        ...style,
      }}
      {...props}
    >
      <FontAwesomeIcon icon={icon} />
    </span>
  );
};

export default Icon;
