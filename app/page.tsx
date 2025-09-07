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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <SignedOut>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignInButton>
                <button className="px-8 py-4 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-2xl hover:opacity-90 transition-all duration-normal font-semibold text-lg shadow-card hover:shadow-subtle transform hover:scale-105">
                  Get Started
                </button>
              </SignInButton>
              <Link 
                href="/videos"
                className="px-8 py-4 bg-card text-text rounded-2xl border border-border hover:bg-surface hover:shadow-card transition-all duration-normal font-semibold text-lg flex items-center gap-2 shadow-subtle"
              >
                Explore Videos <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="bg-gradient-to-r from-success/10 to-accent/10 border border-success/20 rounded-3xl p-8 max-w-2xl mx-auto shadow-card">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-success to-accent rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-text mb-3">Welcome back!</h2>
              <p className="text-text-muted mb-6">
                You&apos;re successfully authenticated and ready to explore all features
              </p>
              <Link 
                href="/videos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-xl hover:opacity-90 transition-all duration-normal font-semibold shadow-card hover:shadow-subtle transform hover:scale-105"
              >
                <Video className="w-5 h-5" />
                Browse Videos
              </Link>
            </div>
          </SignedIn>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Everything you need for a modern web experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-subtle border border-border hover:shadow-card transition-all duration-normal text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-accent to-accent/80 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-normal">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-3">Video Browsing</h3>
              <p className="text-text-muted">
                Discover and watch amazing videos with our beautiful interface
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-subtle border border-border hover:shadow-card transition-all duration-normal text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-success to-success/80 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-normal">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-3">Secure Auth</h3>
              <p className="text-text-muted">
                Enterprise-grade authentication powered by Clerk
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-subtle border border-border hover:shadow-card transition-all duration-normal text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-warning to-error rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-normal">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-3">Lightning Fast</h3>
              <p className="text-text-muted">
                Optimized performance with Next.js and modern technologies
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-subtle border border-border hover:shadow-card transition-all duration-normal text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-accent/80 to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-normal">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-3">User Friendly</h3>
              <p className="text-text-muted">
                Intuitive design that puts user experience first
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text mb-4">
              Video & Browsing Experience
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto font-medium">
              Explore YouTube content with our modern, responsive interface
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-accent/10 to-accent/20 rounded-2xl border border-accent/20">
                <div className="w-14 h-14 bg-gradient-to-r from-accent to-accent/80 rounded-xl flex items-center justify-center flex-shrink-0 shadow-card">
                  <Search className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text mb-3">Smart Search</h3>
                  <p className="text-text-muted font-medium leading-relaxed">
                    Find any video instantly with our powerful search functionality
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-success/10 to-success/20 rounded-2xl border border-success/20">
                <div className="w-14 h-14 bg-gradient-to-r from-success to-success/80 rounded-xl flex items-center justify-center flex-shrink-0 shadow-card">
                  <Play className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text mb-3">Seamless Playback</h3>
                  <p className="text-text-muted font-medium leading-relaxed">
                    Watch videos directly or open them in YouTube with one click
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-warning/10 to-error/10 rounded-2xl border border-warning/20">
                <div className="w-14 h-14 bg-gradient-to-r from-warning to-error rounded-xl flex items-center justify-center flex-shrink-0 shadow-card">
                  <Star className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text mb-3">Trending Content</h3>
                  <p className="text-text-muted font-medium leading-relaxed">
                    Discover what&apos;s popular with our trending videos section
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Link 
                  href="/videos"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-2xl hover:opacity-90 transition-all duration-normal font-bold text-lg shadow-card hover:shadow-subtle transform hover:scale-105"
                >
                  <Video className="w-6 h-6" />
                  Explore Videos
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-surface to-card rounded-3xl p-8 shadow-card border border-border">
              <div className="bg-card rounded-2xl p-6 shadow-subtle border border-border">
                <div className="aspect-video bg-gradient-to-br from-surface to-bg rounded-xl mb-6 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-accent/20" />
                  <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center shadow-card relative z-10">
                    <Play className="w-10 h-10 text-muted fill-current" />
                  </div>
                </div>
                <h4 className="font-bold text-text mb-3 text-lg">Video Preview</h4>
                <p className="text-text-muted mb-4 font-medium">Beautiful thumbnails and metadata</p>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-text">Channel Name</span>
                  <span className="text-text-muted">2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
