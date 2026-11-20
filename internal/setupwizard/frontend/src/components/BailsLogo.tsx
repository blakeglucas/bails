import bailsLogoWhite from '../assets/bails-logo-white-text.svg';
import bailsLogoBlack from '../assets/bails-logo-black-text.svg';

interface BailsLogoProps {
  className?: string;
  size?: number;
  theme?: 'light' | 'dark';
}

export default function BailsLogo({ className = '', size = 240, theme = 'dark' }: BailsLogoProps) {
  // White text for dark mode, black text for light mode
  const logoSrc = theme === 'dark' ? bailsLogoWhite : bailsLogoBlack;

  return (
    <img
      src={logoSrc}
      alt="Bails"
      width={size}
      className={`object-contain ${className}`}
      style={{
        filter: 'drop-shadow(0 0 60px rgba(239, 68, 68, 0.4))',
      }}
    />
  );
}
