import { createPortal } from 'react-dom';

export const Portal = ({ children }: { children: React.ReactNode }) => {
  return createPortal(children, document.body);
}; 