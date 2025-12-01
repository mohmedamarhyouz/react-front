import { formatDateTime } from '../../utils/formatters';

const Timeline = ({ items = [] }) => {
  if (!items.length) {
    return <p className="muted">Aucune action enregistrée.</p>;
  }

  return (
    <ul className="timeline">
      {items.map((item) => (
        <li key={item.id || item.date} className="timeline-item">
          <div className="timeline-date">{formatDateTime(item.date)}</div>
          <div className="timeline-content">
            <div className="timeline-header">
              <span className="timeline-user">{item.utilisateur}</span>
              <span className="timeline-action">{item.action}</span>
            </div>
            {item.commentaire && (
              <div className="timeline-comment">{item.commentaire}</div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default Timeline;
