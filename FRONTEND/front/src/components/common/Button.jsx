import { Link } from 'react-router-dom';
import './Button.css';

function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  to,
  onClick,
  className = '',
  icon,
  ...props
}) {
  const classes = `btn btn--${variant} btn--${size} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick} {...props}>
        {icon && <span className="btn__icon">{icon}</span>}
        <span className="btn__label">{children}</span>
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick} {...props}>
        {icon && <span className="btn__icon">{icon}</span>}
        <span className="btn__label">{children}</span>
      </a>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick} {...props}>
      {icon && <span className="btn__icon">{icon}</span>}
      <span className="btn__label">{children}</span>
    </button>
  );
}

export default Button;
