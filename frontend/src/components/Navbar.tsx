import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Navbar: React.FC = () => {
    const location = useLocation();

    const links = [
        { name: 'TOURNAMENT', path: '/' },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-valorant-black/95 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo Area */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-valorant-red flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-6 h-6 fill-white">
                            <path d="M98 2H2v96h96V2zm-4 4v88H6V6h88z" />
                            <path d="M20 20h20v20H20z" />
                        </svg>
                    </div>
                    <span className="font-sans text-2xl font-bold text-white tracking-widest group-hover:text-valorant-red transition-colors">
                        VCT DATA
                    </span>
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center gap-8">
                    {links.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="relative py-2"
                            >
                                <span className={`text-sm font-bold tracking-widest transition-colors ${isActive ? 'text-valorant-red' : 'text-gray-400 hover:text-white'
                                    }`}>
                                    {link.name}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-underline"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-valorant-red"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* User / Settings Placeholder */}
                <div className="flex items-center gap-4">
                    <div className="w-px h-8 bg-white/10" />
                    <button className="text-gray-400 hover:text-white transition-colors">
                        REGION: <strong>GLOBAL</strong>
                    </button>
                </div>
            </div>
        </nav>
    );
};
