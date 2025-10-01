'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import {
  CheckSquare,
  Heart,
  Plus,
  BookOpen,
  TrendingUp,
  User as UserIcon,
  Smile,
  Target,
  Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Todo {
  id: number;
  created_at: string;
  task: string;
  is_completed: boolean;
  due_date: string;
}

interface MoodEntry {
  id: number;
  created_at: string;
  mood_text: string;
  mood_emoji: string;
  description: string;
}

interface Note {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  user_id: string;
}

const moods = [
  { emoji: '😄', text: 'Happy', color: 'from-yellow-400 to-orange-500' },
  { emoji: '😔', text: 'Sad', color: 'from-blue-400 to-blue-600' },
  { emoji: '🤯', text: 'Stressed', color: 'from-red-400 to-red-600' },
  { emoji: '😴', text: 'Tired', color: 'from-gray-400 to-gray-600' },
  { emoji: '😡', text: 'Angry', color: 'from-red-500 to-red-700' },
  { emoji: '🤩', text: 'Fantastic', color: 'from-purple-400 to-pink-500' },
  { emoji: '😌', text: 'Calm', color: 'from-green-400 to-green-600' },
];

const Homepage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayTodos, setTodayTodos] = useState<Todo[]>([]);
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);
  const [newTask, setNewTask] = useState('');
  const [selectedMood, setSelectedMood] = useState<{ emoji: string; text: string; color: string } | null>(null);
  const [moodDescription, setMoodDescription] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddMood, setShowAddMood] = useState(false);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);

  const today = new Date().toISOString().split('T')[0];

  // Fungsi untuk mendapatkan sesi pengguna
  const fetchUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      router.push('/auth/login');
    } else {
      setUser(user);
    }
    setLoading(false);
  };

  // Fetch today's todos
  const fetchTodayTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('due_date', today)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching today todos:', error.message);
      } else {
        setTodayTodos(data || []);
      }
    } catch (error) {
      console.error('Error fetching today todos:', error);
    }
  };

  // Fetch today's mood
  const fetchTodayMood = async () => {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .gte('created_at', today + 'T00:00:00')
        .lte('created_at', today + 'T23:59:59')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching today mood:', error.message);
      } else if (data && data.length > 0) {
        setTodayMood(data[0]);
      }
    } catch (error) {
      console.error('Error fetching today mood:', error);
    }
  };

  // Fetch recent notes
  const fetchRecentNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(2); // Ambil 2 notes terbaru

      if (error) {
        console.error('Error fetching recent notes:', error.message);
      } else {
        setRecentNotes(data || []);
      }
    } catch (error) {
      console.error('Error fetching recent notes:', error);
    }
  };

  // Add new task
  const addTodo = async () => {
    if (!newTask.trim()) return;

    try {
      // Ambil user yang sedang login
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error getting user:", userError.message);
        return;
      }
      if (!user) {
        console.error("No authenticated user found");
        return;
      }

      const { data, error } = await supabase
        .from("todos")
        .insert([
          {
            task: newTask.trim(),
            due_date: today,
            user_id: user.id, // ⬅️ WAJIB disertakan!
          },
        ])
        .select();

      if (error) {
        console.error("Error adding todo:", error.message);
      } else if (data && data.length > 0) {
        setTodayTodos([data[0], ...todayTodos]);
        setNewTask("");
        setShowAddTask(false);
      }
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };



  // Toggle todo completion
  const toggleTodo = async (id: number, is_completed: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_completed: !is_completed })
        .eq('id', id);

      if (error) {
        console.error('Error toggling todo:', error.message);
      } else {
        setTodayTodos(todayTodos.map(todo =>
          todo.id === id ? { ...todo, is_completed: !is_completed } : todo
        ));
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  // Add mood entry
  const addMoodEntry = async () => {
    if (!selectedMood || !moodDescription.trim()) return;

    try {
      // Ambil user yang sedang login
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error getting user:", userError.message);
        return;
      }
      if (!user) {
        console.error("No authenticated user found");
        return;
      }

      const { data, error } = await supabase
        .from('mood_entries')
        .insert([
          {
            mood_text: selectedMood.text,
            mood_emoji: selectedMood.emoji,
            description: moodDescription.trim(),
            user_id: user.id, // ⬅️ TAMBAHKAN INI
          },
        ])
        .select();

      if (error) {
        console.error('Error adding mood:', error.message);
      } else if (data && data.length > 0) {
        setTodayMood(data[0]);
        setSelectedMood(null);
        setMoodDescription('');
        setShowAddMood(false);
      }
    } catch (error) {
      console.error('Error adding mood:', error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTodayTodos();
      fetchTodayMood();
      fetchRecentNotes();
    }
  }, [user]);

  // Tampilkan loading screen saat memverifikasi sesi
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const completedTodos = todayTodos.filter(todo => todo.is_completed).length;
  const totalTodos = todayTodos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Dashboard Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          className="w-full relative z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="my-8">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-6xl font-extrabold font-montserrat-alt text-center">
                <span className="text-blue-600">Good</span>{' '}
                <span className="text-gray-900">
                  {new Date().getHours() < 12
                    ? 'Morning'
                    : new Date().getHours() < 17
                      ? 'Afternoon'
                      : 'Evening'}!
                </span>
              </h1></motion.div>
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            ><h2 className="text-xl md:text-xl font-semibold text-gray-900 mt-4 text-center font-montserrat">
                Here&apos;s what&apos;s happening with your productivity today
              </h2></motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="w-full relative z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 mt-10">
            <motion.div
              className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-blue-100"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm">Today&apos;s Tasks</p>
                  <p className="text-2xl font-bold text-blue-900">{totalTodos}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <CheckSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-blue-100"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-blue-900">{completedTodos}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-blue-100"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm">Progress</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {totalTodos > 0
                      ? Math.round((completedTodos / totalTodos) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-blue-100"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm">Today&apos;s Mood</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {todayMood ? todayMood.mood_text : 'Not set'}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  {todayMood ? (
                    <span className="text-2xl">{todayMood.mood_emoji}</span>
                  ) : (
                    <Smile className="w-6 h-6 text-blue-600" />
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Dashboard Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.8 }}
        >
          {/* Today's Tasks Section */}
          <motion.div
            className="lg:col-span-2 bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-white/20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.9 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Today&apos;s Tasks</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddTask(!showAddTask)}
                  className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
                <Link
                  href="/dashboard/toDoList"
                  className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View All
                </Link>
              </div>
            </div>

            {/* Add Task Form */}
            {showAddTask && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-200"
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    className="text-gray-700  flex-1 p-3 rounded-xl border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="What needs to be done today?"
                  />
                  <button
                    onClick={addTodo}
                    disabled={!newTask.trim()}
                    className="text-gray-700 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl transition-colors disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            )}

            {/* Tasks List */}
            <div className="space-y-3">
              {todayTodos.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No tasks for today</p>
                  <p className="text-gray-400 text-sm">Add your first task to get started!</p>
                </div>
              ) : (
                todayTodos.slice(0, 6).map(todo => (
                  <motion.div
                    key={todo.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${todo.is_completed
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <input
                      type="checkbox"
                      checked={todo.is_completed}
                      onChange={() => toggleTodo(todo.id, todo.is_completed)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={`flex-1 ${todo.is_completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                      {todo.task}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(todo.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </motion.div>
                ))
              )}

              {todayTodos.length > 6 && (
                <div className="text-center pt-4">
                  <Link
                    href="/toDoList"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View {todayTodos.length - 6} more tasks →
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Mood Tracker Section */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-white/20"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 1.0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">Today&apos;s Mood</h2>
                </div>
                <Link
                  href="/dashboard/moodTracker"
                  className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View All
                </Link>
              </div>

              {todayMood ? (
                <div className="text-center">
                  <motion.div
                    className="text-6xl mb-4"
                    key={todayMood.mood_emoji}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  >
                    {todayMood.mood_emoji}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{todayMood.mood_text}</h3>
                  <p className="text-gray-600 text-sm mb-4">{todayMood.description}</p>
                  <div className="text-xs text-gray-400">
                    Recorded at {new Date(todayMood.created_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <button
                    onClick={() => setShowAddMood(!showAddMood)}
                    className="w-full p-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                  >
                    <Smile className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
                    <p className="text-gray-500 group-hover:text-blue-600">Track your mood today</p>
                  </button>

                  {showAddMood && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-200"
                    >
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {moods.slice(0, 4).map((mood) => (
                          <motion.button
                            key={mood.text}
                            onClick={() => setSelectedMood(mood)}
                            className={`p-3 rounded-xl transition-all text-gray-900 ${selectedMood?.text === mood.text
                              ? 'bg-white shadow-lg scale-105'
                              : 'hover:bg-white hover:shadow-md'
                              }`}
                            whileTap={{ scale: 0.9 }}
                          >
                            <div className="text-2xl">{mood.emoji}</div>
                            <div className="text-xs mt-1">{mood.text}</div>
                          </motion.button>
                        ))}
                      </div>

                      <textarea
                        value={moodDescription}
                        onChange={(e) => setMoodDescription(e.target.value)}
                        className="text-gray-700 w-full p-3 rounded-xl border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                        placeholder="How are you feeling?"
                        rows={3}
                      />

                      <button
                        onClick={addMoodEntry}
                        disabled={!selectedMood || !moodDescription.trim()}
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-xl transition-colors disabled:cursor-not-allowed"
                      >
                        Save Mood
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Recent Notes Section */}
            {/* Recent Notes Section */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-white/20"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 1.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">Recent Notes</h2>
                </div>
                <Link
                  href="/dashboard/notes"
                  className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {recentNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No notes yet</p>
                    <p className="text-gray-400 text-sm">Start creating your first note!</p>
                  </div>
                ) : (
                  recentNotes.map((note) => (
                    <Link
                      key={note.id}
                      href={`/dashboard/notes/view/${note.id}`}
                      className="block p-4 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      <h4 className="font-semibold text-gray-800 text-sm mb-1 truncate">
                        {note.title || 'Untitled Note'}
                      </h4>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {note.content.substring(0, 100)}...
                      </p>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(note.updated_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Homepage;