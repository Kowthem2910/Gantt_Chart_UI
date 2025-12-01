import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

let tasks = [
  {
    id: '1',
    name: 'Project Planning',
    start: '2024-01-01',
    end: '2024-01-15',
    progress: 100,
    dependencies: []
  },
  {
    id: '2',
    name: 'Design Phase',
    start: '2024-01-16',
    end: '2024-02-10',
    progress: 75,
    dependencies: ['1']
  },
  {
    id: '3',
    name: 'Development',
    start: '2024-02-11',
    end: '2024-04-30',
    progress: 50,
    dependencies: ['2']
  },
  {
    id: '4',
    name: 'Testing',
    start: '2024-05-01',
    end: '2024-05-20',
    progress: 0,
    dependencies: ['3']
  }
];

app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => parseInt(t.id) || 0)) : 0;
  const newTask = { ...req.body, id: (maxId + 1).toString() };
  tasks.push(newTask);
  res.json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...req.body };
    res.json(tasks[index]);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  tasks = tasks.filter(t => t.id !== req.params.id);
  res.json({ success: true });
});

app.listen(3001, () => {
  console.log('Backend running on http://localhost:3001');
});
