import React from 'react';
import Link from 'next/link';
import styles from './Button.module.css';

export default function Button({
  children,
  onClick,
  href,
  variant = 'gold-filled', // 'gold-filled', 'green-filled', 'outline'
  type = 'button',
  className = '',
  disabled = false,
  ...props
}) {
  let variantClass = styles.goldFilled;
  if (variant === 'green-filled') {
    variantClass = styles.greenFilled;
  } else if (variant === 'outline') {
    variantClass = styles.outline;
  }

  const combinedClassName = `${styles.button} ${variantClass} ${className}`;

  if (href) {
    // If it's an external link
    if ((href.startsWith('http://') || href.startsWith('https://')) || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return (
        <a href={href} className={combinedClassName} {...props}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={combinedClassName} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={combinedClassName}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
