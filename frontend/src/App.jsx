import { useState, useEffect } from 'react';
import axios from 'axios';
import CustomGantt from './CustomGantt';
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
      <div><strong>ID: {task.name}</strong></div>
      <div><strong>{task.displayName}</strong></div>
      <div>Start: {task.start.toLocaleDateString()}</div>
      <div>End: {task.end.toLocaleDateString()}</div>
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
    end: '',
    progress: 0,
    dependencies: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data } = await axios.get(API_URL);
    setTasks(data.map(t => ({
      ...t,
      name: t.id,
      displayName: t.name,
      start: new Date(t.start),
      end: new Date(t.end),
      type: 'task',
      styles: { progressColor: '#4f46e5', progressSelectedColor: '#3730a3' }
    })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const taskData = {
      name: formData.name,
      start: formData.start,
      end: formData.end,
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
    setFormData({
      name: task.name,
      start: task.start.toISOString().split('T')[0],
      end: task.end.toISOString().split('T')[0],
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
    setFormData({ name: '', start: '', end: '', progress: 0, dependencies: '' });
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
          <CustomGantt
            tasks={tasks}
            onDateChange={handleDateChange}
            onDoubleClick={handleEdit}
          />
        )}
      </div>

      <div className="task-list">
        <h2>Tasks</h2>
        {tasks.map(task => (
          <div key={task.id} className="task-item">
            <div>
              <strong>ID: {task.name} - {task.displayName}</strong>
              <p>{task.start.toLocaleDateString()} - {task.end.toLocaleDateString()}</p>
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
              <input
                type="date"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                required
              />
              <input
                type="date"
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                required
              />
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
