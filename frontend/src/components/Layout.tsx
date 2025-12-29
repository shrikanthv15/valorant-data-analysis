import React from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-valorant-black text-white selection:bg-valorant-red selection:text-white font-sans overflow-x-hidden">
            <Navbar />

            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #2f3e4e 0%, #0f1923 100%)'
                }}
            />

            {/* Grid Pattern Overlay */}
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
                {children}
            </main>

            <footer className="relative z-10 border-t border-white/10 py-12 mt-12 bg-valorant-black">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-gray-500 text-sm">
                    <p>© 2025 VCT Data Analysis. Not affiliated with Riot Games.</p>
                    <div className="flex gap-4">
                        <span>v0.2.0</span>
                        <span>AWS / S3</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};
