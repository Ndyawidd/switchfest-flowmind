'use client';
import { useRouter } from 'next/navigation';
import {
  CheckSquare,
  Heart,
  BookOpen,
  Calendar,
  TrendingUp,
  Zap,
  Shield,
  Smartphone,
  ArrowRight,
  Star,
  Users,
  Clock
} from 'lucide-react';

const LandingPage = () => {
  const router = useRouter();

  const handleAuthRedirect = (path: string) => {
    router.push(path);
  };

  const features = [
    {
      icon: <CheckSquare className="w-12 h-12 text-blue-500" />,
      title: "Task Management",
      description: "Organize your daily tasks and plan your schedule with smart reminders and calendar integration.",
      color: "from-blue-50 to-blue-100"
    },
    {
      icon: <BookOpen className="w-12 h-12 text-green-500" />,
      title: "Smart Notes",
      description: "Capture ideas, thoughts, and create drafts with rich text formatting and voice-to-text features.",
      color: "from-green-50 to-green-100"
    },
    {
      icon: <Heart className="w-12 h-12 text-purple-500" />,
      title: "Mood Tracking",
      description: "Monitor your emotional wellbeing and discover patterns with insightful analytics and reports.",
      color: "from-purple-50 to-purple-100"
    }
  ];

  const stats = [
    { icon: <Users className="w-8 h-8 text-blue-600" />, number: "10,000+", label: "Active Users" },
    { icon: <CheckSquare className="w-8 h-8 text-green-600" />, number: "500K+", label: "Tasks Completed" },
    { icon: <TrendingUp className="w-8 h-8 text-purple-600" />, number: "98%", label: "User Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  <Zap className="w-4 h-4" />
                  Boost Your Productivity
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                  Capture Ideas,
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {" "}Plan Days
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  The all-in-one productivity app for notes, tasks, and mood tracking.
                  Organize your thoughts, achieve your goals, and maintain your wellbeing.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleAuthRedirect('/auth/register')}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Start Free Today
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleAuthRedirect('/auth/login')}
                  className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 font-semibold rounded-2xl transition-all duration-300 hover:bg-blue-50"
                >
                  <Clock className="w-5 h-5" />
                  Quick Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative">
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                {/* Mock App Interface */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="ml-4 text-sm text-gray-600">FlowMind Dashboard</span>
                  </div>

                  {/* Mock Tasks */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                      <CheckSquare className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-700">Complete project proposal</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-700">Team meeting at 2 PM</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                      <Heart className="w-5 h-5 text-purple-600" />
                      <span className="text-sm text-gray-700">Feeling productive today!</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Streamline your productivity with powerful features designed to help you stay organized and focused.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative z-10">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-white rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 text-center mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <div className="text-center">
                    <button
                      onClick={() => handleAuthRedirect('/auth/login')}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors group-hover:translate-x-1 transform duration-300"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-gray-800">
                Why Choose FlowMind?
              </h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure & Private</h3>
                    <p className="text-gray-600">Your data is encrypted and stored securely. We never share your personal information.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Cross-Platform</h3>
                    <p className="text-gray-600">Access your data from any device, anywhere. Perfect sync across all platforms.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Smart Analytics</h3>
                    <p className="text-gray-600">Get insights into your productivity patterns and mood trends over time.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Star className="w-8 h-8 text-yellow-300 fill-current" />
                    <div>
                      <div className="text-2xl font-bold">4.9/5 Rating</div>
                      <div className="text-blue-100">From 1,000+ reviews</div>
                    </div>
                  </div>

                  <blockquote className="text-lg italic">
                    "FlowMind has completely transformed how I organize my life. The mood tracking feature helped me understand my patterns better."
                  </blockquote>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold">Sarah Johnson</div>
                      <div className="text-blue-200 text-sm">Product Manager</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Productivity?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who have already improved their daily workflows with FlowMind.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleAuthRedirect('/auth/register')}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Your Free Trial
            </button>
            <button
              onClick={() => handleAuthRedirect('/auth/login')}
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-2xl hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Sign In
            </button>
          </div>

          <p className="text-blue-200 text-sm mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">FlowMind</span>
            </div>

            <div className="text-gray-400 text-sm">
              © 2024 FlowMind. All rights reserved. Built with care for your productivity.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;