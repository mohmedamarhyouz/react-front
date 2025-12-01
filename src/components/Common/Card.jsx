const Card = ({ title, children, footer }) => (
  <div className="card">
    {title && <div className="card-header">{title}</div>}
    <div className="card-body">{children}</div>
    {footer && <div className="card-footer">{footer}</div>}
  </div>
);

export default Card;
