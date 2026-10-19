import { Router } from 'express';
import fs from 'fs';
import path from 'path';

export const projectRouter = Router();

const DATA_DIR = path.resolve(process.cwd(), 'data', 'projects');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// List all projects
projectRouter.get('/', (_req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    const list = files.map(file => {
      const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
      const data = JSON.parse(content);
      return {
        id: data.id || file.replace('.json', ''),
        name: data.name || 'Untitled Project',
        bpm: data.bpm || 120,
        updatedAt: data.updatedAt || new Date().toISOString()
      };
    });
    res.json({ projects: list });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list projects' });
  }
});

// Get single project
projectRouter.get('/:id', (req, res) => {
  const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Project not found' });
  }
  try {
    const project = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Failed to read project file' });
  }
});

// Save or Update Project
projectRouter.post('/:id', (req, res) => {
  const projectId = req.params.id;
  const filePath = path.join(DATA_DIR, `${projectId}.json`);
  const projectData = {
    ...req.body,
    id: projectId,
    updatedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(filePath, JSON.stringify(projectData, null, 2), 'utf-8');
    res.json({ success: true, id: projectId });
  } catch {
    res.status(500).json({ error: 'Failed to save project' });
  }
});
