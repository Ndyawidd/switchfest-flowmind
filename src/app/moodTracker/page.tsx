'use client'

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Heart, Smile, BarChart3, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MoodEntry {
  id: number;
  created_at: string;
  mood_text: string;
  mood_emoji: string;
  description: string;
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

export default function MoodTrackerPage() {
  const router = useRouter();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<{ emoji: string; text: string; color: string } | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const [filter, setFilter] = useState<'week' | 'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'summary' | 'calendar'>('summary');

  // Fetch data after login check
  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  async function checkAuthAndFetch() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchMoodEntries(user.id);
  }

  async function fetchMoodEntries(userId: string) {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mood entries:', error.message);
      } else {
        setMoodEntries(data || []);
      }
    } catch (error) {
      console.error('Error fetching mood entries:', error);
    }
  }

  async function addMoodEntry() {
    if (!selectedMood || !newDescription.trim()) {
      alert('Please select a mood and add a description!');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .insert([
          {
            mood_text: selectedMood.text,
            mood_emoji: selectedMood.emoji,
            description: newDescription.trim(),
            user_id: user.id, // 🔥 simpan user_id
          },
        ])
        .select();

      if (error) {
        console.error('Error adding mood entry:', error.message);
        alert('Failed to save mood. Please try again.');
      } else if (data && data.length > 0) {
        setMoodEntries([data[0], ...moodEntries]);
        setSelectedMood(null);
        setNewDescription('');
        alert('Mood saved successfully!');
      }
    } catch (error) {
      console.error('Error adding mood entry:', error);
      alert('Failed to save mood. Please try again.');
    }
  }

  // Calendar helpers
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  // Memoized summary
  const { filteredEntries, groupedByDate } = useMemo(() => {
    let startDate = new Date();
    if (filter === 'week') startDate.setDate(startDate.getDate() - 7);
    if (filter === 'month') startDate.setMonth(startDate.getMonth() - 1);
    if (filter === 'year') startDate.setFullYear(startDate.getFullYear() - 1);

    const filtered = moodEntries.filter(entry => new Date(entry.created_at) >= startDate);

    const grouped = new Map<string, MoodEntry[]>();
    filtered.forEach(entry => {
      const dateKey = new Date(entry.created_at).toDateString();
      if (!grouped.has(dateKey)) grouped.set(dateKey, []);
      grouped.get(dateKey)?.push(entry);
    });

    return { filteredEntries: filtered, groupedByDate: grouped };
  }, [moodEntries, filter]);

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-100"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateKey = dayDate.toDateString();
      const dayEntries = groupedByDate.get(dateKey) || [];
      const isToday = dayDate.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-100 p-1 relative overflow-hidden hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          }`}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>{day}</div>
          <div className="mt-1 space-y-1">
            {dayEntries.slice(0, 2).map((entry) => (
              <div
                key={entry.id}
                className="text-xs bg-white rounded px-1 py-0.5 shadow-sm flex items-center gap-1 hover:shadow-md transition-shadow cursor-pointer group"
                title={entry.description}
                onClick={() =>
                  alert(
                    `${entry.mood_text} - ${new Date(entry.created_at).toLocaleDateString('id-ID')}\n\n${entry.description}`
                  )
                }
              >
                <span className="text-xs">{entry.mood_emoji}</span>
                <span className="truncate group-hover:text-purple-600 transition-colors">{entry.mood_text}</span>
              </div>
            ))}
            {dayEntries.length > 2 && (
              <div className="text-xs text-gray-500 pl-1">+{dayEntries.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              FlowMind
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Track your emotions, understand your patterns</p>
        </div>

        {/* Add Mood Section */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl mb-8 border border-white/20">
          <div className="flex items-center gap-2 mb-6">
            <Smile className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">How are you feeling today?</h2>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            {moods.map((mood) => (
              <button
                key={mood.text}
                onClick={() => setSelectedMood(mood)}
                className={`group relative overflow-hidden p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  selectedMood?.text === mood.text
                    ? `bg-gradient-to-br ${mood.color} shadow-2xl scale-105`
                    : 'bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2 group-hover:animate-bounce">{mood.emoji}</div>
                  <div className={`text-sm font-medium transition-colors ${
                    selectedMood?.text === mood.text ? 'text-white' : 'text-gray-700'
                  }`}>
                    {mood.text}
                  </div>
                </div>
                {selectedMood?.text === mood.text && (
                  <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
                )}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Tell us more about your day...
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full p-4 rounded-2xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 resize-none"
              placeholder="What made you feel this way? Share your thoughts..."
              rows={4}
            />
          </div>

          <button
            onClick={addMoodEntry}
            disabled={!selectedMood || !newDescription.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-5 h-5" />
              Save My Mood
            </div>
          </button>
        </div>

        {/* Navigation & Filter */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl mb-8 border border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode('summary')}
                  className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                    viewMode === 'summary' 
                      ? 'bg-white shadow-md text-purple-600' 
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Summary
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                    viewMode === 'calendar' 
                      ? 'bg-white shadow-md text-purple-600' 
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Calendar
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'week' | 'month' | 'year')}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'summary' ? (
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20">
            {/* Recent Entries */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Recent Entries
              </h3>
              {filteredEntries.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-gray-500">No recent entries found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEntries.slice(0, 10).map(entry => (
                    <div
                      key={entry.id}
                      className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-purple-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 text-2xl">{entry.mood_emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-800">{entry.mood_text}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(entry.created_at).toLocaleDateString('id-ID', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">{entry.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20">
            <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-2xl overflow-hidden shadow-inner">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div
                  key={day}
                  className="bg-gray-50 p-4 text-center font-semibold text-gray-600 border-b border-gray-200"
                >
                  {day}
                </div>
              ))}
              {renderCalendar()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
