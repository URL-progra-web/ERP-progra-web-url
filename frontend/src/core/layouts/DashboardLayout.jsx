import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';
import './DashboardLayout.css';

const MobileOverlay = ({ onClick }) => (
    <div
        onClick={onClick}
        style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(2px)',
            zIndex: 1040,
        }}
    />
);

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen]         = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) setIsSidebarCollapsed(false);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const openSidebar  = () => setIsSidebarOpen(true);
    const closeSidebar = () => setIsSidebarOpen(false);
    const toggleCollapse = () => setIsSidebarCollapsed(prev => !prev);

    const sidebarWidth = isSidebarCollapsed
        ? 'var(--sidebar-collapsed-width)'
        : 'var(--sidebar-width)';

    return (
        <div className="d-flex bg-body text-body min-vh-100 position-relative" style={{ overflow: 'hidden' }}>

            {isSidebarOpen && <MobileOverlay onClick={closeSidebar} />}

            {/* Sidebar */}
            <div
                className={`sidebar-container ${isSidebarOpen ? 'show' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}
                style={{ width: sidebarWidth }}
            >
                <Sidebar
                    onItemClick={closeSidebar}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={toggleCollapse}
                />
            </div>

            {/* Main area */}
            <div className="flex-grow-1 d-flex flex-column main-content-area" style={{ minWidth: 0 }}>
                <Topbar onMenuClick={openSidebar} />

                <main
                    className="flex-grow-1 overflow-auto p-3 p-md-4 has-bottom-nav page-enter"
                    style={{ height: `calc(100vh - var(--topbar-height))`, background: 'var(--bs-body-bg)' }}
                >
                    <Outlet />

                    <footer className="mt-5 pt-4 pb-2 border-top text-center small" style={{ color: 'var(--bs-tertiary-color)' }}>
                        &copy; 2026 ERP System
                    </footer>
                </main>
            </div>

            {/* Mobile bottom navigation */}
            <BottomNav onMenuClick={openSidebar} />
        </div>
    );
};

export default DashboardLayout;
