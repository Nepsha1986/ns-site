import React from 'react';

interface Props {
  children: React.ReactNode;
}
const Footer = ({ children }: Props) => <div>{children}</div>;

export default Footer;
