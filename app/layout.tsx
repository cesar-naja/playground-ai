import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Home, Video, ImageIcon, FileText } from "lucide-react";
import { FirebaseProvider } from "@/contexts/FirebaseContext";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CesarWorks - AI Playground",
  description: "AI-powered tools for image generation, video browsing, and smart note-taking with voice transcription",
  themeColor: "#0b0f17",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check if Clerk keys are configured
  const hasClerkKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
                      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'YOUR_PUBLISHABLE_KEY';

  if (!hasClerkKeys) {
    return (
      <html lang="en">
        <head>
          <meta name="theme-color" content="#0b0f17" />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-bg min-h-screen`}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <div className="min-h-screen flex items-center justify-center p-8">
              <div className="max-w-2xl mx-auto bg-card/80 backdrop-blur-sm rounded-2xl shadow-card border border-border p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-error to-warning rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">!</span>
                </div>
                <h1 className="text-3xl font-bold text-text mb-4">Clerk Configuration Required</h1>
                <p className="text-lg text-text-muted mb-6">
                  To use authentication features, you need to add your Clerk API keys to the environment variables.
                </p>
                <div className="bg-surface rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-text mb-2">Steps to fix:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-text-muted">
                    <li>Go to <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Clerk Dashboard</a></li>
                    <li>Create a new application or select existing one</li>
                    <li>Go to API Keys page</li>
                    <li>Copy your Publishable Key and Secret Key</li>
                    <li>Create a <code className="bg-bg px-1 rounded text-accent">\.env.local</code> file in your project root</li>
                    <li>Add the keys as shown below</li>
                  </ol>
                </div>
                <div className="bg-bg text-success rounded-lg p-4 text-left font-mono text-sm mb-6">
                  <div className="text-muted mb-2"># .env.local</div>
                  <div>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here</div>
                  <div>CLERK_SECRET_KEY=sk_test_your_secret_key_here</div>
                </div>
                <p className="text-sm text-muted">
                  After adding the keys, restart your development server with <code className="bg-bg px-1 rounded text-accent">npm run dev</code>
                </p>
              </div>
            </div>
          </ThemeProvider>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <meta name="theme-color" content="#0b0f17" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-bg min-h-screen`}
        >
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <header className="bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-card">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  {/* Logo and Navigation */}
                  <div className="flex items-center gap-8">
                    <Link href="/" className="logo-text bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent hover:from-accent/90 hover:to-accent/70 transition-all duration-fast">
                      CesarWorks
                    </Link>
                    
                    <nav className="hidden md:flex items-center gap-6">
                      <Link 
                        href="/" 
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-text hover:bg-accent/10 hover:text-accent transition-all duration-fast"
                      >
                        <Home className="w-4 h-4" />
                        Home
                      </Link>
                      <Link 
                        href="/videos" 
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-text hover:bg-accent/10 hover:text-accent transition-all duration-fast"
                      >
                        <Video className="w-4 h-4" />
                        Video & Browsing
                      </Link>
                      <Link 
                        href="/ai-generator" 
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-text hover:bg-accent/10 hover:text-accent transition-all duration-fast"
                      >
                        <ImageIcon className="w-4 h-4" />
                        AI Image Generator
                      </Link>
                      <Link 
                        href="/notes" 
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-text hover:bg-accent/10 hover:text-accent transition-all duration-fast"
                      >
                        <FileText className="w-4 h-4" />
                        Notes
                      </Link>
                    </nav>
                  </div>

                  {/* Authentication & Theme Toggle */}
                  <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <SignedOut>
                      <div className="flex gap-3">
                        <SignInButton>
                          <button className="px-4 py-2 text-text hover:text-accent transition-colors duration-fast font-medium">
                            Sign In
                          </button>
                        </SignInButton>
                        <SignUpButton>
                          <button className="px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all duration-fast font-medium shadow-card">
                            Sign Up
                          </button>
                        </SignUpButton>
                      </div>
                    </SignedOut>
                    <SignedIn>
                      <UserButton 
                        appearance={{
                          elements: {
                            avatarBox: "w-10 h-10 rounded-full border-2 border-border hover:border-accent transition-colors duration-fast"
                          }
                        }}
                      />
                    </SignedIn>
                  </div>
                </div>
              </div>
            </header>

            {/* Mobile Navigation */}
            <div className="md:hidden bg-surface/80 backdrop-blur-md border-b border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 py-3 overflow-x-auto">
                  <Link 
                    href="/" 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-text hover:bg-accent/10 hover:text-accent transition-all duration-fast text-sm whitespace-nowrap"
                  >
                    <Home className="w-4 h-4" />
                    Home
                  </Link>
                  <Link 
                    href="/videos" 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-text hover:bg-accent/10 hover:text-accent transition-all duration-fast text-sm whitespace-nowrap"
                  >
                    <Video className="w-4 h-4" />
                    Videos
                  </Link>
                  <Link 
                    href="/ai-generator" 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-text hover:bg-accent/10 hover:text-accent transition-all duration-fast text-sm whitespace-nowrap"
                  >
                    <ImageIcon className="w-4 h-4" />
                    AI Generator
                  </Link>
                  <Link 
                    href="/notes" 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-text hover:bg-accent/10 hover:text-accent transition-all duration-fast text-sm whitespace-nowrap"
                  >
                    <FileText className="w-4 h-4" />
                    Notes
                  </Link>
                </div>
              </div>
            </div>

            <main>
              <FirebaseProvider>
                {children}
              </FirebaseProvider>
            </main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
