import './CustomGantt.css';

const CustomGantt = ({ tasks, onDateChange, onDoubleClick }) => {
  const getDateRange = () => {
    const dates = tasks.flatMap(t => [t.start, t.end]);
    return {
      min: new Date(Math.min(...dates)),
      max: new Date(Math.max(...dates))
    };
  };

  const getMonths = () => {
    const { min, max } = getDateRange();
    const months = [];
    let current = new Date(min.getFullYear(), min.getMonth(), 1);
    
    while (current <= max) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  };

  const { min, max } = getDateRange();
  const totalDays = Math.ceil((max - min) / (1000 * 60 * 60 * 24)) + 1;

  const getPosition = (date) => {
    const days = Math.ceil((date - min) / (1000 * 60 * 60 * 24));
    return (days / totalDays) * 100;
  };

  const getWidth = (start, end) => {
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return (days / totalDays) * 100;
  };

  const months = getMonths();

  return (
    <div className="custom-gantt">
      <div className="gantt-body">
        <div className="gantt-header-row">
          <div className="task-id-header">ID</div>
          <div className="timeline-area"></div>
        </div>

        {tasks.map((task) => (
          <div key={task.id} className="gantt-row">
            <div className="task-id">{task.name}</div>
            <div className="timeline">
              <div
                className="task-bar"
                style={{
                  left: `${getPosition(task.start)}%`,
                  width: `${getWidth(task.start, task.end)}%`,
                  background: `linear-gradient(to right, #4f46e5 ${task.progress}%, #e5e7eb ${task.progress}%)`
                }}
                onDoubleClick={() => onDoubleClick(task)}
                title={`${task.displayName}\n${task.start.toLocaleDateString()} - ${task.end.toLocaleDateString()}\nProgress: ${task.progress}%`}
              >
                <span className="date-label start">{task.start.toLocaleDateString()}</span>
                <span className="date-label end">{task.end.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}

        <div className="gantt-footer">
          <div className="task-id-footer"></div>
          <div className="timeline-footer">
            {months.map((month, idx) => (
              <div
                key={idx}
                className="month-label"
                style={{
                  left: `${getPosition(month)}%`
                }}
              >
                {month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomGantt;
