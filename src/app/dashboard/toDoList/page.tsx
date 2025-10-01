'use client'

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  CheckSquare,
  Plus,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  Filter,
  Trash2,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface Todo {
  id: number;
  created_at: string;
  task: string;
  is_completed: boolean;
  due_date: string;
  user_id: string;
}

function formatDateLocal(date: Date) {
  return date.toLocaleDateString('sv-SE');
}

const listVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
};

export default function ToDoListPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(formatDateLocal(new Date()));
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetch();
  }, [selectedDate]);

  async function checkAuthAndFetch() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/auth/login');
        return;
      }
      setUserId(user.id);

      await Promise.all([
        fetchAllTodos(user.id),
        fetchTodos(user.id)
      ]);
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllTodos(uid: string) {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all todos:', error.message);
      } else {
        setAllTodos(data || []);
      }
    } catch (error) {
      console.error('Error fetching all todos:', error);
    }
  }

  async function fetchTodos(uid: string) {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', uid)
        .eq('due_date', selectedDate)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching todos:', error.message);
      } else {
        setTodos(data || []);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  }

  async function addTodo() {
    if (!newTask.trim() || !userId) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{
          task: newTask.trim(),
          due_date: selectedDate,
          user_id: userId,
          is_completed: false
        }])
        .select();

      if (error) {
        console.error('Error adding todo:', error.message);
        alert('Failed to add task. Please try again.');
      } else if (data && data.length > 0) {
        setTodos([data[0], ...todos]);
        setAllTodos([data[0], ...allTodos]);
        setNewTask('');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
      alert('Failed to add task. Please try again.');
    }
  }

  async function toggleTodoCompletion(id: number, is_completed: boolean) {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_completed: !is_completed })
        .eq('id', id)
        .eq('user_id', userId!);

      if (error) {
        console.error('Error toggling todo:', error.message);
      } else {
        setTodos(todos.map(t => (t.id === id ? { ...t, is_completed: !is_completed } : t)));
        setAllTodos(allTodos.map(t => (t.id === id ? { ...t, is_completed: !is_completed } : t)));
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  }

  async function deleteTodo(id: number) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', userId!);

      if (error) {
        console.error('Error deleting todo:', error.message);
        alert('Failed to delete task. Please try again.');
      } else {
        setTodos(todos.filter(t => t.id !== id));
        setAllTodos(allTodos.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Failed to delete task. Please try again.');
    }
  }

  async function updateTodo(id: number, newText: string) {
    if (!newText.trim() || !userId) return;

    try {
      const { error } = await supabase
        .from('todos')
        .update({ task: newText.trim() })
        .eq('id', id)
        .eq('user_id', userId!);

      if (error) {
        console.error('Error updating todo:', error.message);
        alert('Failed to update task. Please try again.');
      } else {
        setTodos(todos.map(t => (t.id === id ? { ...t, task: newText.trim() } : t)));
        setAllTodos(allTodos.map(t => (t.id === id ? { ...t, task: newText.trim() } : t)));
        setEditingId(null);
        setEditText('');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      alert('Failed to update task. Please try again.');
    }
  }

  function startEditing(id: number, text: string) {
    setEditingId(id);
    setEditText(text);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditText('');
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const todosByDate = useMemo(() => {
    const grouped = new Map<string, Todo[]>();
    allTodos.forEach(todo => {
      const dateKey = todo.due_date;
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)?.push(todo);
    });
    return grouped;
  }, [allTodos]);

  const today = formatDateLocal(new Date());
  const todaysTodos = allTodos.filter(t => t.due_date === today);
  const completedToday = todaysTodos.filter(t => t.is_completed).length;
  const totalToday = todaysTodos.length;

  const filteredTodos = useMemo(() => {
    if (filter === 'all') return todos;
    if (filter === 'pending') return todos.filter(todo => !todo.is_completed);
    if (filter === 'completed') return todos.filter(todo => todo.is_completed);
    return todos;
  }, [todos, filter]);

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 sm:h-24 lg:h-28 border border-gray-100"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateKey = formatDateLocal(dayDate);
      const dayTodos = todosByDate.get(dateKey) || [];
      const isToday = dateKey === today;
      const isSelected = dateKey === selectedDate;

      const completedCount = dayTodos.filter(todo => todo.is_completed).length;
      const totalCount = dayTodos.length;

      days.push(
        <div
          key={day}
          className={`h-20 sm:h-24 lg:h-28 border border-gray-100 p-1 sm:p-2 cursor-pointer hover:bg-gray-50 transition-colors relative ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          } ${isSelected ? 'bg-purple-50 border-purple-300' : ''}`}
          onClick={() => setSelectedDate(dateKey)}
        >
          <div className={`text-xs sm:text-sm font-medium mb-1 ${
            isToday ? 'text-blue-600' : isSelected ? 'text-purple-600' : 'text-gray-700'
          }`}>
            {day}
          </div>

          {totalCount > 0 && (
            <div className="space-y-0.5 sm:space-y-1">
              <div className={`text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center justify-between ${
                completedCount === totalCount
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                <span>{completedCount}/{totalCount}</span>
                {completedCount === totalCount && <CheckSquare className="w-2 h-2 sm:w-3 sm:h-3" />}
              </div>

              <div className="hidden sm:block">
                {dayTodos.slice(0, 2).map((todo, idx) => (
                  <div
                    key={idx}
                    className={`text-[10px] sm:text-xs p-0.5 sm:p-1 rounded truncate ${
                      todo.is_completed
                        ? 'bg-blue-100 text-blue-700 line-through'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                    title={todo.task}
                  >
                    {todo.task}
                  </div>
                ))}

                {dayTodos.length > 2 && (
                  <div className="text-[10px] text-gray-500">+{dayTodos.length - 2} more</div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="my-4 sm:my-6 lg:my-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-montserrat-alt text-center">
              <span className="text-blue-600">To</span>{' '}
              <span className="text-gray-900">Do</span>{' '}
              <span className="text-blue-600">List</span>
            </h1>
            <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-800 mt-3 sm:mt-4 font-montserrat text-center px-4">
              Organize your tasks, achieve your goals
            </h2>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-white/20"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-gray-600 text-[10px] sm:text-xs lg:text-sm">Today&apos;s Progress</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{completedToday}/{totalToday}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-white/20"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.1 }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-gray-600 text-[10px] sm:text-xs lg:text-sm">Completed</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{completedToday}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-white/20"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-gray-600 text-[10px] sm:text-xs lg:text-sm">Remaining</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{totalToday - completedToday}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Navigation & Controls */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-2xl sm:rounded-3xl shadow-xl mb-4 sm:mb-6 lg:mb-8 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="flex bg-gray-100 rounded-xl sm:rounded-2xl p-1">
                <motion.button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                    viewMode === 'list'
                      ? 'bg-white shadow-md text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">List View</span>
                  <span className="sm:hidden">List</span>
                </motion.button>
                <motion.button
                  onClick={() => setViewMode('calendar')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                    viewMode === 'calendar'
                      ? 'bg-white shadow-md text-blue-600'
                      : 'text-gray-900 hover:text-blue-600'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  Calendar
                </motion.button>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                />

                {viewMode === 'list' && (
                  <div className="flex items-center gap-2">
                    <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-gray-900 flex-shrink-0" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'completed')}
                      className="flex-1 sm:flex-initial bg-white border border-gray-200 rounded-lg sm:rounded-xl px-2 sm:px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-xs sm:text-sm"
                    >
                      <option value="all">All Tasks</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div
              key="list-view"
              className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-white/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">
                  {selectedDate === today ? "Today's Tasks" : `Tasks for ${new Date(selectedDate).toLocaleDateString('id-ID')}`}
                </h2>
              </div>

              {/* Add New Task */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6 sm:mb-8">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 text-gray-700 text-sm sm:text-base"
                    placeholder="What needs to be done?"
                  />
                </div>
                <motion.button
                  onClick={addTodo}
                  disabled={!newTask.trim()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Add Task</span>
                  <span className="sm:hidden">Add</span>
                </motion.button>
              </div>

              {/* Task List */}
              {filteredTodos.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 sm:py-12"
                >
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📝</div>
                  <p className="text-gray-500 text-base sm:text-lg">
                    {filter === 'all' ? 'No tasks for this day' :
                      filter === 'pending' ? 'No pending tasks' :
                        'No completed tasks'}
                  </p>
                  <p className="text-gray-400 text-sm sm:text-base">
                    {filter === 'all' ? 'Add your first task to get started!' :
                      filter === 'pending' ? 'Great job! All tasks are completed.' :
                        'Complete some tasks to see them here.'}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-3 sm:space-y-4"
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence>
                    {filteredTodos.map(todo => (
                      <motion.div
                        key={todo.id}
                        className={`group flex items-start sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                          todo.is_completed
                            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                            : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                        variants={itemVariants}
                        layout
                      >
                        <input
                          type="checkbox"
                          checked={todo.is_completed}
                          onChange={() => toggleTodoCompletion(todo.id, todo.is_completed)}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0 mt-0.5 sm:mt-0"
                        />

                        <div className="flex-1 min-w-0">
                          {editingId === todo.id ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') updateTodo(todo.id, editText);
                                  if (e.key === 'Escape') cancelEditing();
                                }}
                                className="flex-1 p-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm text-gray-700"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <span className={`text-sm sm:text-base text-gray-700 break-words ${
                              todo.is_completed ? 'line-through text-gray-400' : ''
                            }`}>
                              {todo.task}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          {editingId === todo.id ? (
                            <>
                              <motion.button
                                onClick={() => updateTodo(todo.id, editText)}
                                className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Save"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                              </motion.button>
                              <motion.button
                                onClick={cancelEditing}
                                className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Cancel"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                              </motion.button>
                            </>
                          ) : (
                            <>
                              <motion.button
                                onClick={() => startEditing(todo.id, todo.task)}
                                className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Edit"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </motion.button>
                              <motion.button
                                onClick={() => deleteTodo(todo.id)}
                                className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="calendar-view"
              className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-white/20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Calendar Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Task Calendar</h2>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <motion.button
                    onClick={() => navigateMonth('prev')}
                    className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 min-w-32 sm:min-w-48 text-center">
                    {getMonthName(currentDate)}
                  </h3>
                  <motion.button
                    onClick={() => navigateMonth('next')}
                    className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-inner">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="bg-gray-50 p-2 sm:p-3 lg:p-4 text-center font-semibold text-gray-600 border-b border-gray-200 text-[10px] sm:text-xs lg:text-sm">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.substring(0, 1)}</span>
                  </div>
                ))}

                {/* Calendar days */}
                {renderCalendar()}
              </div>

              {/* Calendar Legend */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-gray-700 text-sm sm:text-base">How to use:</h4>
                  <div className="text-[10px] sm:text-xs text-gray-500">Click on dates to view/edit tasks</div>
                </div>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 rounded flex-shrink-0"></div>
                    <span className="text-[10px] sm:text-xs">All completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 rounded flex-shrink-0"></div>
                    <span className="text-[10px] sm:text-xs">Tasks pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-50 border-2 border-blue-300 rounded flex-shrink-0"></div>
                    <span className="text-[10px] sm:text-xs">Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-50 border-2 border-purple-300 rounded flex-shrink-0"></div>
                    <span className="text-[10px] sm:text-xs">Selected date</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}