import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './DashboardLayout.css';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsSidebarCollapsed(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebarView = () => {
        if (isSidebarOpen) setIsSidebarOpen(false);
    };

    const toggleSidebarSize = () => {
        setIsSidebarCollapsed((prev) => !prev);
    };

    return (
        <div className="d-flex bg-body text-body min-vh-100 position-relative" style={{ overflow: 'hidden' }}>
            
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="position-fixed w-100 h-100" 
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040, top: 0, left: 0 }}
                    onClick={closeSidebarView}
                ></div>
            )}

            {/* Sidebar Container */}
            <div 
                className={`sidebar-container ${isSidebarOpen ? 'show' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}
                style={{ width: isSidebarCollapsed ? '88px' : '260px', flexShrink: 0, zIndex: 1050 }}
            >
                <Sidebar 
                    onItemClick={closeSidebarView} 
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={toggleSidebarSize}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-grow-1 d-flex flex-column main-content-area" style={{ flexShrink: 1, minWidth: 0 }}>
                <Topbar 
                    onMenuClick={toggleSidebar} 
                    onSidebarSizeToggle={toggleSidebarSize}
                    isSidebarCollapsed={isSidebarCollapsed}
                />
                
                {/* Fixed scrolling area for the outlet */}
                <main className="flex-grow-1 overflow-auto p-3 p-md-4 bg-body-tertiary w-100" style={{ height: 'calc(100vh - var(--topbar-height))' }}>
                    <Outlet />
                    
                    {/* Minimal Footer */}
                    <footer className="mt-5 pt-4 pb-2 border-top text-center text-muted small">
                        &copy; 2026 ERP System - All rights reserved.
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
