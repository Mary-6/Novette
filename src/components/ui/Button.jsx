import { Link } from 'react-router-dom';

const variants = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  gold: 'btn-gold',
};

export default function Button({ to, variant = 'primary', className = '', children, ...rest }) {
  const cls = `${variants[variant]} inline-block text-center ${className}`;
  if (to)
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
