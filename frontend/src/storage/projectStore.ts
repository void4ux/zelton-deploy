import { Project } from '../types/daw';

const STORAGE_KEY = 'zelton_saved_project_v1';

export class ProjectStore {
  private static undoStack: Project[] = [];
  private static redoStack: Project[] = [];
  private static maxHistory = 30;

  public static saveToStorage(project: Project): void {
    try {
      // Audio buffers cannot be serialized directly to JSON, so strip them for json storage
      const sanitized = {
        ...project,
        clips: project.clips.map(c => {
          if (c.audio && c.audio.buffer) {
            const { buffer, ...restAudio } = c.audio;
            return { ...c, audio: restAudio };
          }
          return c;
        })
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch (e) {
      console.warn('Failed to save project to localStorage:', e);
    }
  }

  public static loadFromStorage(): Project | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data) as Project;
    } catch {
      return null;
    }
  }

  public static pushHistory(project: Project): void {
    // Clone project snapshot
    const copy = JSON.parse(JSON.stringify(project)) as Project;
    this.undoStack.push(copy);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    // Clear redo on new action
    this.redoStack = [];
  }

  public static undo(current: Project): Project | null {
    if (this.undoStack.length === 0) return null;
    const previous = this.undoStack.pop()!;
    this.redoStack.push(JSON.parse(JSON.stringify(current)));
    return previous;
  }

  public static redo(current: Project): Project | null {
    if (this.redoStack.length === 0) return null;
    const next = this.redoStack.pop()!;
    this.undoStack.push(JSON.parse(JSON.stringify(current)));
    return next;
  }

  public static exportProjectJson(project: Project): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `${project.name.toLowerCase().replace(/\s+/g, '_')}.zelton`);
    dlAnchorElem.click();
  }
}
