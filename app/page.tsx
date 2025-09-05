import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { Video, Shield, Zap, Users, ArrowRight, Play, Search, Star } from "lucide-react";
import MotivationalQuotes from "@/components/MotivationalQuotes";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Motivational Quotes Hero Section */}
      <MotivationalQuotes />

      {/* Quick Actions Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <SignedOut>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignInButton>
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105">
                  Get Started
                </button>
              </SignInButton>
              <Link 
                href="/videos"
                className="px-8 py-4 bg-white text-gray-800 rounded-2xl border border-gray-200 hover:bg-gray-50 hover:shadow-lg transition-all duration-300 font-semibold text-lg flex items-center gap-2 shadow-sm"
              >
                Explore Videos <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-3xl p-8 max-w-2xl mx-auto shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome back!</h2>
              <p className="text-gray-600 mb-6">
                You're successfully authenticated and ready to explore all features
              </p>
              <Link 
                href="/videos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Video className="w-5 h-5" />
                Browse Videos
              </Link>
            </div>
          </SignedIn>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for a modern web experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Video Browsing</h3>
              <p className="text-gray-600">
                Discover and watch amazing videos with our beautiful interface
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Auth</h3>
              <p className="text-gray-600">
                Enterprise-grade authentication powered by Clerk
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">
                Optimized performance with Next.js and modern technologies
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">User Friendly</h3>
              <p className="text-gray-600">
                Intuitive design that puts user experience first
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Video & Browsing Experience
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
              Explore YouTube content with our modern, responsive interface
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Search className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Search</h3>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    Find any video instantly with our powerful search functionality
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Play className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Seamless Playback</h3>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    Watch videos directly or open them in YouTube with one click
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-100">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Star className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Trending Content</h3>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    Discover what's popular with our trending videos section
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Link 
                  href="/videos"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Video className="w-6 h-6" />
                  Explore Videos
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-100 to-gray-100 rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="aspect-video bg-gradient-to-br from-slate-200 to-gray-300 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl relative z-10">
                    <Play className="w-10 h-10 text-gray-700 fill-current" />
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">Video Preview</h4>
                <p className="text-gray-700 mb-4 font-medium">Beautiful thumbnails and metadata</p>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-gray-800">Channel Name</span>
                  <span className="text-gray-600">2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
