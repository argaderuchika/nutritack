import React, { useState, useEffect } from 'react';
import { BookOpen, Edit2, Trash2, Check, Plus, MessageSquare } from 'lucide-react';

interface DailyNotesCardProps {
  notes?: string;
  onSaveNotes: (notes: string) => void;
  onDeleteNotes: () => void;
}

export const DailyNotesCard: React.FC<DailyNotesCardProps> = ({
  notes = '',
  onSaveNotes,
  onDeleteNotes,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(notes);

  useEffect(() => {
    setText(notes);
    if (!notes) {
      setIsEditing(false);
    }
  }, [notes]);

  const handleSave = () => {
    onSaveNotes(text.trim());
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Delete your daily food diary note?')) {
      onDeleteNotes();
      setText('');
      setIsEditing(false);
    }
  };

  const quickTags = [
    'Felt energized ⚡',
    'Crushed protein goal 💪',
    'Low hunger / satisfied 🥗',
    'Fought sweet cravings 🍫',
    'Ate out / restaurant 🍽️',
    'Great gym session 🏋️‍♂️',
  ];

  const handleAddTag = (tag: string) => {
    const current = text.trim();
    if (current) {
      setText(`${current} • ${tag}`);
    } else {
      setText(tag);
    }
    if (!isEditing) setIsEditing(true);
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-3.5 sm:p-5 transition-all shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">Food Diary & Reflection</h3>
            <p className="text-[10px] sm:text-xs text-slate-400">
              Track energy, cravings, hunger, or meal notes for today
            </p>
          </div>
        </div>

        {notes && !isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
              title="Edit note"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-3">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Energy was high today. Drank 3L water. Had slight sugar cravings around 4 PM, satisfied with almonds and green tea..."
              rows={3}
              className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />

            {/* Quick tag chips */}
            <div className="flex flex-wrap gap-1.5">
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-[11px] text-slate-300 hover:text-white transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setText(notes);
                  setIsEditing(false);
                }}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/20 transition-all active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Diary Note</span>
              </button>
            </div>
          </div>
        ) : notes ? (
          <div
            onClick={() => setIsEditing(true)}
            className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs sm:text-sm text-slate-200 cursor-pointer hover:border-slate-700 transition-colors leading-relaxed"
          >
            {notes}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <span className="text-xs text-slate-400 text-center sm:text-left">
              No notes logged for today yet. Add how you felt, cravings, or reflections:
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Diary Note</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

