import { create } from 'zustand';
import { db } from '../db';
import type { Task } from '../types';
import { generateId } from '../utils/helpers';

interface TaskStore {
  tasks: Task[];
  todayTasks: Task[];
  laterTasks: Task[];
  isLoading: boolean;
  
  // Actions
  loadTasks: () => Promise<void>;
  addTask: (text: string, urgency?: Task['urgency'], dueDate?: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  moveToToday: (id: string) => Promise<void>;
  moveToLater: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
}

const MAX_TODAY_TASKS = 5;

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  todayTasks: [],
  laterTasks: [],
  isLoading: false,

  loadTasks: async () => {
    set({ isLoading: true });
    try {
      const allTasks = await db.tasks.toArray();
      const mappedTasks = allTasks.map(t => ({
        ...t,
        text: t.text || '',
        completed: t.completed || false,
        urgency: t.urgency || 'normal' as Task['urgency']
      }));
      
      const activeTasks = mappedTasks.filter(t => !t.completed);
      const today = activeTasks.slice(0, MAX_TODAY_TASKS);
      const later = activeTasks.slice(MAX_TODAY_TASKS);
      
      set({ 
        tasks: mappedTasks,
        todayTasks: today,
        laterTasks: later,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to load tasks:', error);
      set({ isLoading: false });
    }
  },

  addTask: async (text, urgency = 'normal', dueDate) => {
    const task: Task = {
      id: generateId(),
      text,
      completed: false,
      urgency,
      dueDate,
      createdAt: Date.now()
    };

    await db.tasks.add(task);
    
    const { todayTasks, laterTasks } = get();
    
    if (todayTasks.length < MAX_TODAY_TASKS) {
      set({ todayTasks: [...todayTasks, task] });
    } else {
      set({ laterTasks: [...laterTasks, task] });
    }
  },

  toggleTask: async (id) => {
    const task = await db.tasks.get(id);
    if (!task) return;

    const mappedTask = {
      ...task,
      text: task.text || '',
      completed: task.completed || false,
      urgency: task.urgency || 'normal' as Task['urgency']
    };
    
    const updatedTask = {
      ...mappedTask,
      completed: !mappedTask.completed,
      completedAt: !mappedTask.completed ? Date.now() : undefined
    } as Task;

    await db.tasks.update(id, updatedTask);

    const { todayTasks, laterTasks } = get();
    
    set({
      todayTasks: todayTasks.map(t => t.id === id ? updatedTask : t),
      laterTasks: laterTasks.map(t => t.id === id ? updatedTask : t)
    });
  },

  moveToToday: async (id) => {
    const { todayTasks, laterTasks } = get();
    
    if (todayTasks.length >= MAX_TODAY_TASKS) {
      // Optionally show a toast/notification that Today is full
      return;
    }

    const task = laterTasks.find(t => t.id === id);
    if (!task) return;

    set({
      todayTasks: [...todayTasks, task],
      laterTasks: laterTasks.filter(t => t.id !== id)
    });
  },

  moveToLater: async (id) => {
    const { todayTasks, laterTasks } = get();
    const task = todayTasks.find(t => t.id === id);
    if (!task) return;

    set({
      todayTasks: todayTasks.filter(t => t.id !== id),
      laterTasks: [...laterTasks, task]
    });
  },

  deleteTask: async (id) => {
    await db.tasks.delete(id);
    
    const { todayTasks, laterTasks } = get();
    set({
      todayTasks: todayTasks.filter(t => t.id !== id),
      laterTasks: laterTasks.filter(t => t.id !== id)
    });
  },

  clearCompleted: async () => {
    await db.tasks.where('completed').equals(1).delete();
    
    const { todayTasks, laterTasks } = get();
    set({
      todayTasks: todayTasks.filter(t => !t.completed),
      laterTasks: laterTasks.filter(t => !t.completed)
    });
  },

  removeTask: async (id) => {
    await db.tasks.delete(id);
    
    const { tasks, todayTasks, laterTasks } = get();
    set({
      tasks: tasks.filter(t => t.id !== id),
      todayTasks: todayTasks.filter(t => t.id !== id),
      laterTasks: laterTasks.filter(t => t.id !== id)
    });
  },

  updateTask: async (id, updates) => {
    await db.tasks.update(id, updates);
    
    const { tasks, todayTasks, laterTasks } = get();
    const updateInList = (list: Task[]) => 
      list.map(t => t.id === id ? { ...t, ...updates } : t);
    
    set({
      tasks: updateInList(tasks),
      todayTasks: updateInList(todayTasks),
      laterTasks: updateInList(laterTasks)
    });
  }
}));
