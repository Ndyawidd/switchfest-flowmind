'use client'

import { useState, useEffect, useMemo } from 'react';
import { Calendar, CheckSquare, Plus, Clock, Target, ChevronLeft, ChevronRight, Filter, Trash2, Edit3, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Todo {
    id: number;
    created_at: string;
    task: string;
    is_completed: boolean;
    due_date: string;
}

// ✅ Helper function untuk format tanggal lokal (YYYY-MM-DD)
function formatDateLocal(date: Date) {
    return date.toLocaleDateString('sv-SE'); // hasil: 2025-09-28
}

export default function ToDoListPage() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [allTodos, setAllTodos] = useState<Todo[]>([]);
    const [newTask, setNewTask] = useState('');
    const [selectedDate, setSelectedDate] = useState<string>(formatDateLocal(new Date()));
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');

    useEffect(() => {
        fetchAllTodos();
        fetchTodos();
    }, [selectedDate]);

    async function fetchAllTodos() {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching all todos:', error.message);
        } else {
            setAllTodos(data as Todo[]);
        }
    }

    async function fetchTodos() {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('due_date', selectedDate)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching todos:', error.message);
        } else {
            setTodos(data as Todo[]);
        }
    }

    async function addTodo() {
        if (!newTask.trim()) return;

        try {
            const { data, error } = await supabase
                .from('todos')
                .insert([
                    { task: newTask.trim(), due_date: selectedDate },
                ])
                .select();

            if (error) {
                console.error('Error adding new todo:', error.message);
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
                .eq('id', id);

            if (error) {
                console.error('Error toggling todo completion:', error.message);
            } else {
                setTodos(todos.map(todo =>
                    todo.id === id ? { ...todo, is_completed: !is_completed } : todo
                ));
                setAllTodos(allTodos.map(todo =>
                    todo.id === id ? { ...todo, is_completed: !is_completed } : todo
                ));
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
                .eq('id', id);

            if (error) {
                console.error('Error deleting todo:', error.message);
            } else {
                setTodos(todos.filter(todo => todo.id !== id));
                setAllTodos(allTodos.filter(todo => todo.id !== id));
            }
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    }

    async function updateTodo(id: number, newText: string) {
        if (!newText.trim()) return;

        try {
            const { error } = await supabase
                .from('todos')
                .update({ task: newText.trim() })
                .eq('id', id);

            if (error) {
                console.error('Error updating todo:', error.message);
            } else {
                setTodos(todos.map(todo =>
                    todo.id === id ? { ...todo, task: newText.trim() } : todo
                ));
                setAllTodos(allTodos.map(todo =>
                    todo.id === id ? { ...todo, task: newText.trim() } : todo
                ));
                setEditingId(null);
                setEditText('');
            }
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    }

    const startEditing = (id: number, currentText: string) => {
        setEditingId(id);
        setEditText(currentText);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditText('');
    };

    // Calendar helper functions
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

    // Group todos by date for calendar view
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

    // Filter todos for list view
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

        // Empty cells for days before the month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-28 border border-gray-100"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateKey = formatDateLocal(dayDate); // ✅ FIX pakai format lokal
            const dayTodos = todosByDate.get(dateKey) || [];
            const isToday = dateKey === formatDateLocal(new Date());
            const isSelected = dateKey === selectedDate;

            const completedCount = dayTodos.filter(todo => todo.is_completed).length;
            const totalCount = dayTodos.length;

            days.push(
                <div
                    key={day}
                    className={`h-28 border border-gray-100 p-2 cursor-pointer hover:bg-gray-50 transition-colors relative ${isToday ? 'bg-blue-50 border-blue-300' : ''
                        } ${isSelected ? 'bg-purple-50 border-purple-300' : ''}`}
                    onClick={() => setSelectedDate(dateKey)}
                >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : isSelected ? 'text-purple-600' : 'text-gray-700'
                        }`}>
                        {day}
                    </div>

                    {totalCount > 0 && (
                        <div className="space-y-1">
                            <div className={`text-xs px-2 py-1 rounded-full flex items-center justify-between ${completedCount === totalCount
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                <span>{completedCount}/{totalCount}</span>
                                {completedCount === totalCount && <CheckSquare className="w-3 h-3" />}
                            </div>

                            {dayTodos.slice(0, 2).map((todo, idx) => (
                                <div
                                    key={idx}
                                    className={`text-xs p-1 rounded truncate ${todo.is_completed
                                            ? 'bg-green-100 text-green-700 line-through'
                                            : 'bg-gray-100 text-gray-700'
                                        }`}
                                    title={todo.task}
                                >
                                    {todo.task}
                                </div>
                            ))}

                            {dayTodos.length > 2 && (
                                <div className="text-xs text-gray-500">+{dayTodos.length - 2} more</div>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    const today = formatDateLocal(new Date());
    const completedToday = filteredTodos.filter(todo => todo.is_completed).length;
    const totalToday = filteredTodos.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
            <div className="container mx-auto p-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
                            <CheckSquare className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            TaskFlow
                        </h1>
                    </div>
                    <p className="text-gray-600 text-lg">Organize your tasks, achieve your goals</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Target className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Today's Progress</p>
                                <p className="text-2xl font-bold text-gray-800">{completedToday}/{totalToday}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckSquare className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Completed</p>
                                <p className="text-2xl font-bold text-green-600">{completedToday}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Remaining</p>
                                <p className="text-2xl font-bold text-orange-600">{totalToday - completedToday}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation & Controls */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl mb-8 border border-white/20">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex bg-gray-100 rounded-2xl p-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${viewMode === 'list'
                                            ? 'bg-white shadow-md text-blue-600'
                                            : 'text-gray-600 hover:text-blue-600'
                                        }`}
                                >
                                    <CheckSquare className="w-4 h-4" />
                                    List View
                                </button>
                                <button
                                    onClick={() => setViewMode('calendar')}
                                    className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${viewMode === 'calendar'
                                            ? 'bg-white shadow-md text-blue-600'
                                            : 'text-gray-600 hover:text-blue-600'
                                        }`}
                                >
                                    <Calendar className="w-4 h-4" />
                                    Calendar
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-white border border-gray-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />

                            {viewMode === 'list' && (
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-600" />
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'completed')}
                                        className="bg-white border border-gray-200 rounded-xl px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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

                {/* Main Content */}
                {viewMode === 'list' ? (
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20">
                        <div className="flex items-center gap-2 mb-6">
                            <CheckSquare className="w-6 h-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-800">
                                {selectedDate === today ? "Today's Tasks" : `Tasks for ${new Date(selectedDate).toLocaleDateString('id-ID')}`}
                            </h2>
                        </div>

                        {/* Add New Task */}
                        <div className="flex gap-3 mb-8">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                                    className="w-full p-4 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                                    placeholder="What needs to be done?"
                                />
                            </div>
                            <button
                                onClick={addTodo}
                                disabled={!newTask.trim()}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add Task
                            </button>
                        </div>

                        {/* Task List */}
                        {filteredTodos.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📝</div>
                                <p className="text-gray-500 text-lg">
                                    {filter === 'all' ? 'No tasks for this day' :
                                        filter === 'pending' ? 'No pending tasks' :
                                            'No completed tasks'}
                                </p>
                                <p className="text-gray-400">
                                    {filter === 'all' ? 'Add your first task to get started!' :
                                        filter === 'pending' ? 'Great job! All tasks are completed.' :
                                            'Complete some tasks to see them here.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredTodos.map(todo => (
                                    <div
                                        key={todo.id}
                                        className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:shadow-lg ${todo.is_completed
                                                ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={todo.is_completed}
                                            onChange={() => toggleTodoCompletion(todo.id, todo.is_completed)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        />

                                        <div className="flex-1">
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
                                                        className="flex-1 p-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <span className={`text-gray-700 ${todo.is_completed ? 'line-through text-gray-400' : ''}`}>
                                                    {todo.task}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {editingId === todo.id ? (
                                                <>
                                                    <button
                                                        onClick={() => updateTodo(todo.id, editText)}
                                                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                                        title="Save"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="Cancel"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => startEditing(todo.id, todo.task)}
                                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteTodo(todo.id)}
                                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-6 h-6 text-blue-600" />
                                <h2 className="text-2xl font-bold text-gray-800">Task Calendar</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigateMonth('prev')}
                                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <h3 className="text-xl font-semibold text-gray-800 min-w-48 text-center">
                                    {getMonthName(currentDate)}
                                </h3>
                                <button
                                    onClick={() => navigateMonth('next')}
                                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-2xl overflow-hidden shadow-inner">
                            {/* Day headers */}
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="bg-gray-50 p-4 text-center font-semibold text-gray-600 border-b border-gray-200">
                                    {day}
                                </div>
                            ))}

                            {/* Calendar days */}
                            {renderCalendar()}
                        </div>

                        {/* Calendar Legend */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                            <h4 className="font-semibold text-gray-700 mb-2">How to use:</h4>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-100 rounded"></div>
                                    <span>All tasks completed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-orange-100 rounded"></div>
                                    <span>Tasks pending</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-blue-50 border-2 border-blue-300 rounded"></div>
                                    <span>Today</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-purple-50 border-2 border-purple-300 rounded"></div>
                                    <span>Selected date</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}