import { useState, useEffect } from 'react';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:3001/api/tasks';

const CustomTooltip = ({ task }) => {
  return (
    <div style={{
      background: 'white',
      padding: '10px',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      fontSize: '12px'
    }}>
      <div><strong>{task.name}</strong></div>
      <div>Start: {task.start.toLocaleDateString()} {task.start.toLocaleTimeString()}</div>
      <div>End: {task.end.toLocaleDateString()} {task.end.toLocaleTimeString()}</div>
      <div>Progress: {task.progress}%</div>
    </div>
  );
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    start: '',
    startTime: '',
    end: '',
    endTime: '',
    progress: 0,
    dependencies: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const getColorByHour = (hour) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
      '#AED6F1', '#F1948A', '#D7BDE2', '#A9DFBF', '#F9E79F', '#AEB6BF',
      '#85929E', '#5D6D7E', '#34495E', '#2C3E50', '#1B2631', '#17202A'
    ];
    return colors[hour % 24];
  };

  const fetchTasks = async () => {
    const { data } = await axios.get(API_URL);
    setTasks(data.map(t => {
      const startDate = new Date(t.start);
      const hour = startDate.getHours();
      const color = getColorByHour(hour);
      
      return {
        ...t,
        start: startDate,
        end: new Date(t.end),
        type: 'task',
        styles: { 
          progressColor: color, 
          progressSelectedColor: color,
          backgroundColor: color + '40'
        }
      };
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const taskData = {
      name: formData.name,
      start: `${formData.start}T${formData.startTime}`,
      end: `${formData.end}T${formData.endTime}`,
      progress: Number(formData.progress),
      dependencies: formData.dependencies ? formData.dependencies.split(',').map(d => d.trim()) : []
    };

    if (editingTask) {
      await axios.put(`${API_URL}/${editingTask.id}`, taskData);
    } else {
      await axios.post(API_URL, taskData);
    }

    fetchTasks();
    resetForm();
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    const startDateTime = task.start.toISOString();
    const endDateTime = task.end.toISOString();
    setFormData({
      name: task.name,
      start: startDateTime.split('T')[0],
      startTime: startDateTime.split('T')[1].slice(0, 5),
      end: endDateTime.split('T')[0],
      endTime: endDateTime.split('T')[1].slice(0, 5),
      progress: task.progress,
      dependencies: task.dependencies?.join(', ') || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this task?')) {
      await axios.delete(`${API_URL}/${id}`);
      fetchTasks();
    }
  };

  const handleDateChange = async (task) => {
    await axios.put(`${API_URL}/${task.id}`, {
      start: task.start.toISOString().split('T')[0],
      end: task.end.toISOString().split('T')[0]
    });
    fetchTasks();
  };

  const resetForm = () => {
    setFormData({ name: '', start: '', startTime: '', end: '', endTime: '', progress: 0, dependencies: '' });
    setEditingTask(null);
    setShowModal(false);
  };

  return (
    <div className="app">
      <header>
        <h1>Gantt Chart Application</h1>
        <button onClick={() => setShowModal(true)}>+ Add Task</button>
      </header>

      <div className="gantt-container">
        {tasks.length > 0 && (
          <Gantt
            tasks={tasks}
            viewMode={ViewMode.Hour}
            onDateChange={handleDateChange}
            onDoubleClick={handleEdit}
            listCellWidth="170px"
            columnWidth={80}
            TooltipContent={CustomTooltip}
            headerHeight={0}
            rowHeight={70}
            TaskListHeader={() => <div style={{display: 'flex', alignItems:'center'}}>Wafer ID</div>}
            TaskListTable={({ tasks }) => (
              <div>
                {tasks.map((task, index) => (
                  <div key={task.id} style={{ height: '70px', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
                    W{String(index + 1).padStart(3, '0')}
                  </div>
                ))}
              </div>
            )}
          />
        )}
        {tasks.length > 0 && (
          <div style={{ marginLeft: '170px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ 
              textAlign: 'center', 
              padding: '8px', 
              backgroundColor: '#f8f9fa',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              January 2024
            </div>
            <div style={{ 
              display: 'flex',
              fontSize: '11px',
              color: '#666'
            }}>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} style={{ 
                  width: '80px',
                  textAlign: 'center',
                  padding: '5px 0',
                  borderRight: i < 23 ? '1px solid #f0f0f0' : 'none'
                }}>
                  {String(i).padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="task-list">
        <h2>Tasks</h2>
        {tasks.map(task => (
          <div key={task.id} className="task-item">
            <div>
              <strong>{task.name}</strong>
              <p>{task.start.toLocaleDateString()} {task.start.toLocaleTimeString()} - {task.end.toLocaleDateString()} {task.end.toLocaleTimeString()}</p>
              <p>Progress: {task.progress}%</p>
            </div>
            <div>
              <button onClick={() => handleEdit(task)}>Edit</button>
              <button onClick={() => handleDelete(task.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingTask ? 'Edit Task' : 'Add Task'}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Task Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="date"
                  placeholder="Start Date"
                  value={formData.start}
                  onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                  required
                  style={{ flex: 1 }}
                />
                <input
                  type="time"
                  placeholder="Start Time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  style={{ flex: 1 }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="date"
                  placeholder="End Date"
                  value={formData.end}
                  onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                  required
                  style={{ flex: 1 }}
                />
                <input
                  type="time"
                  placeholder="End Time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  style={{ flex: 1 }}
                />
              </div>
              <input
                type="number"
                placeholder="Progress (0-100)"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                min="0"
                max="100"
              />
              <input
                type="text"
                placeholder="Dependencies (comma separated IDs)"
                value={formData.dependencies}
                onChange={(e) => setFormData({ ...formData, dependencies: e.target.value })}
              />
              <div className="modal-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
