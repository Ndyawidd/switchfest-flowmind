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
  Calendar, 
  BookOpen, 
  TrendingUp, 
  User as UserIcon,
  LogOut,
  Smile,
  Clock,
  Target,
  Eye,
  Edit3
} from 'lucide-react';

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

  const today = new Date().toISOString().split('T')[0];

  // Fungsi untuk mendapatkan sesi pengguna
  const fetchUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      router.push('/login');
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

  // Add new task
  const addTodo = async () => {
    if (!newTask.trim()) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([
          { task: newTask.trim(), due_date: today },
        ])
        .select();

      if (error) {
        console.error('Error adding todo:', error.message);
      } else if (data && data.length > 0) {
        setTodayTodos([data[0], ...todayTodos]);
        setNewTask('');
        setShowAddTask(false);
      }
    } catch (error) {
      console.error('Error adding todo:', error);
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
      const { data, error } = await supabase
        .from('mood_entries')
        .insert([
          {
            mood_text: selectedMood.text,
            mood_emoji: selectedMood.emoji,
            description: moodDescription.trim(),
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
    }
  }, [user]);

  // Handler untuk logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Enhanced Navbar */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  FlowBite
                </span>
              </div>
              <div className="hidden md:block">
                <span className="text-gray-600 text-sm">
                  Welcome back, <span className="font-semibold text-gray-800">{user.email?.split('@')[0]}!</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                href="/notes/add"
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                <span>Add Notes</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl font-medium transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your productivity today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Today's Tasks</p>
                <p className="text-2xl font-bold text-gray-800">{totalTodos}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <CheckSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedTodos}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Progress</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Today's Mood</p>
                <p className="text-lg font-semibold text-gray-800">
                  {todayMood ? todayMood.mood_text : 'Not set'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                {todayMood ? (
                  <span className="text-2xl">{todayMood.mood_emoji}</span>
                ) : (
                  <Smile className="w-6 h-6 text-purple-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Tasks Section */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Today's Tasks</h2>
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
                  href="/toDoList" 
                  className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View All
                </Link>
              </div>
            </div>

            {/* Add Task Form */}
            {showAddTask && (
              <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    className="flex-1 p-3 rounded-xl border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="What needs to be done today?"
                  />
                  <button
                    onClick={addTodo}
                    disabled={!newTask.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl transition-colors disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
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
                  <div
                    key={todo.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
                      todo.is_completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
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
                  </div>
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
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Mood Tracker Section */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-800">Today's Mood</h2>
                </div>
                <Link 
                  href="/moodTracker" 
                  className="flex items-center gap-2 text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-xl transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View All
                </Link>
              </div>

              {todayMood ? (
                <div className="text-center">
                  <div className="text-6xl mb-4">{todayMood.mood_emoji}</div>
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
                    className="w-full p-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-purple-400 hover:bg-purple-50 transition-colors group"
                  >
                    <Smile className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
                    <p className="text-gray-500 group-hover:text-purple-600">Track your mood today</p>
                  </button>

                  {showAddMood && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-2xl border border-purple-200">
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {moods.slice(0, 4).map((mood) => (
                          <button
                            key={mood.text}
                            onClick={() => setSelectedMood(mood)}
                            className={`p-3 rounded-xl transition-all ${
                              selectedMood?.text === mood.text
                                ? 'bg-white shadow-lg scale-105'
                                : 'hover:bg-white hover:shadow-md'
                            }`}
                          >
                            <div className="text-2xl">{mood.emoji}</div>
                            <div className="text-xs mt-1">{mood.text}</div>
                          </button>
                        ))}
                      </div>
                      
                      <textarea
                        value={moodDescription}
                        onChange={(e) => setMoodDescription(e.target.value)}
                        className="w-full p-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm"
                        placeholder="How are you feeling?"
                        rows={3}
                      />
                      
                      <button
                        onClick={addMoodEntry}
                        disabled={!selectedMood || !moodDescription.trim()}
                        className="w-full mt-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-2 rounded-xl transition-colors disabled:cursor-not-allowed"
                      >
                        Save Mood
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent Notes Section */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-800">Recent Notes</h2>
                </div>
                <Link 
                  href="/notes" 
                  className="flex items-center gap-2 text-green-600 hover:bg-green-50 px-3 py-2 rounded-xl transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">Project Ideas</h4>
                  <p className="text-gray-600 text-sm">New concepts for the AI summarizer feature...</p>
                  <div className="text-xs text-gray-400 mt-2">2 hours ago</div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">Meeting Notes</h4>
                  <p className="text-gray-600 text-sm">Discussion about marketing strategies...</p>
                  <div className="text-xs text-gray-400 mt-2">1 day ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Homepage;