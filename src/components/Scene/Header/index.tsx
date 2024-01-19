import React from 'react';

interface Props {
  children: React.ReactNode;
}
const Header = ({ children }: Props) => <div>{children}</div>;

export default Header;
