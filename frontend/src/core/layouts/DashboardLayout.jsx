import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';
import './DashboardLayout.css';

const MobileOverlay = ({ onClick }) => (
    <div
        onClick={onClick}
        className="dashboard-mobile-overlay"
        aria-hidden="true"
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
        <div className={`dashboard-shell ${isSidebarOpen ? 'sidebar-mobile-open' : ''}`}>

            {isSidebarOpen && <MobileOverlay onClick={closeSidebar} />}

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

            <div className="main-content-area">
                <Topbar onMenuClick={openSidebar} />

                <main className="dashboard-main has-bottom-nav page-enter">
                    <div className="dashboard-content">
                        <Outlet />

                        <footer className="dashboard-footer">
                            <span>ERP System</span>
                            <span>2026</span>
                        </footer>
                    </div>
                </main>
            </div>

            <BottomNav onMenuClick={openSidebar} />
        </div>
    );
};

export default DashboardLayout;
