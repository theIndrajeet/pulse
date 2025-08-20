import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle, AlertCircle, Star, MoreVertical, Clock, Calendar } from 'lucide-react';
import type { Task } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { useGameStore } from '../stores/gameStore';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { useBehaviorComputed } from '../behavior/BehaviorProvider';
import { Menu } from '@headlessui/react';

interface TaskListProps {
  tasks: Task[];
  isCompleted?: boolean;
}

export default function TaskList({ tasks, isCompleted = false }: TaskListProps) {
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const removeTask = useTaskStore((state) => state.removeTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const gainXP = useGameStore((state) => state.gainXP);
  const { t } = useLanguage();
  const computed = useBehaviorComputed();

  const handleToggle = (task: Task) => {
    toggleTask(task.id);
    if (!task.completed) {
      const baseXP = task.isDaily3 ? 50 : 25;
      const urgentBonus = task.urgency === 'high' ? 15 : 0;
      gainXP(baseXP + urgentBonus);
    }
  };

  const getUrgencyConfig = (urgency: Task['urgency']) => {
    switch (urgency) {
      case 'high':
        return { icon: AlertCircle, color: 'text-error' };
      case 'medium':
        return { icon: Clock, color: 'text-warning' };
      default:
        return null;
    }
  };

  if (tasks.length === 0) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => {
          const urgencyConfig = getUrgencyConfig(task.urgency);
          
          return (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="group"
            >
              <div className="card p-4 hover:shadow-raised">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(task)}
                    className="mt-0.5 flex-shrink-0 relative"
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {task.completed ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        className="w-5 h-5 rounded bg-accent flex items-center justify-center"
                      >
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                        >
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Circle className="w-5 h-5 text-border hover:text-accent transition-colors" />
                      </motion.div>
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className={`font-medium ${task.completed ? 'line-through text-muted' : ''}`}>
                          {task.text}
                        </h3>
                        
                        {/* Task Meta */}
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                          {task.isDaily3 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              <span>Daily 3</span>
                            </div>
                          )}
                          
                          {urgencyConfig && (
                            <div className={`flex items-center gap-1 ${urgencyConfig.color}`}>
                              <urgencyConfig.icon className="w-3 h-3" />
                              <span className="capitalize">{task.urgency}</span>
                            </div>
                          )}
                          
                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Task Menu */}
                      <Menu as="div" className="relative">
                        <Menu.Button className="p-1 rounded hover:bg-surface-alt transition-colors opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-4 h-4 text-muted" />
                        </Menu.Button>
                        
                        <Menu.Items className="absolute right-0 mt-1 w-48 bg-surface border border-border rounded-lg shadow-raised z-10 py-1">
                          {!task.completed && !task.isDaily3 && (
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => updateTask(task.id, { isDaily3: true })}
                                  className={`w-full text-left px-3 py-2 text-sm ${
                                    active ? 'bg-surface-alt' : ''
                                  }`}
                                >
                                  Add to Daily 3
                                </button>
                              )}
                            </Menu.Item>
                          )}
                          
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => removeTask(task.id)}
                                className={`w-full text-left px-3 py-2 text-sm text-error ${
                                  active ? 'bg-surface-alt' : ''
                                }`}
                              >
                                Delete
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Menu>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}