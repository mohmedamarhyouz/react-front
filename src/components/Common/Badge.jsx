const Badge = ({ children, variant = 'neutral' }) => {
  const classes = variant.startsWith('badge')
    ? variant
    : `badge badge-${variant}`;
  return <span className={classes}>{children}</span>;
};

export default Badge;
