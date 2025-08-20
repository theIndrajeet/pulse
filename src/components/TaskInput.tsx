import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, AlertCircle, Clock, Calendar } from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import type { Task } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useBehaviorComputed } from '../behavior/BehaviorProvider';

export default function TaskInput() {
  const [text, setText] = useState('');
  const [urgency, setUrgency] = useState<Task['urgency']>('normal');
  const [dueDate, setDueDate] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addTask = useTaskStore((state) => state.addTask);
  const { t } = useLanguage();
  const computed = useBehaviorComputed();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      addTask(text.trim(), urgency, dueDate || undefined);
      setText('');
      setUrgency('normal');
      setDueDate('');
      setShowOptions(false);
      inputRef.current?.focus();
    }
  };

  const urgencyOptions: Array<{ value: Task['urgency']; label: string; icon: any; color: string }> = [
    { value: 'normal', label: 'Normal', icon: null, color: 'text-muted' },
    { value: 'medium', label: 'Medium', icon: Clock, color: 'text-warning' },
    { value: 'high', label: 'High', icon: AlertCircle, color: 'text-error' }
  ];

  return (
    <form onSubmit={handleSubmit} className="card p-5">
      <div className="flex items-center gap-3 mb-3">
        <Plus className="w-5 h-5 text-accent" />
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setShowOptions(true)}
          placeholder={t('tasks.addPlaceholder')}
          className="flex-1 bg-transparent border-0 outline-none text-ink placeholder:text-muted"
        />
      </div>

      {/* Options Panel */}
      <motion.div
        initial={false}
        animate={{ height: showOptions ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <div className="pt-3 border-t border-border-muted">
          <div className="flex flex-wrap items-center gap-4">
            {/* Urgency Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Priority:</span>
              <div className="flex gap-1">
                {urgencyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setUrgency(option.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      urgency === option.value
                        ? 'bg-accent text-white'
                        : 'bg-surface-alt hover:bg-surface border border-border-muted'
                    }`}
                  >
                    {option.icon && <option.icon className="w-3 h-3 inline mr-1" />}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="px-2 py-1 text-sm bg-surface-alt border border-border-muted rounded-md"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!text.trim()}
              className="ml-auto btn btn-primary"
            >
              Add Task
            </button>
          </div>
        </div>
      </motion.div>
    </form>
  );
}