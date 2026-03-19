import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getNavigationConfig } from '../registry/registryUtils';

const Sidebar = ({ onItemClick, isCollapsed = false }) => {
    const { user } = useAuth();
    const navigationConfig = getNavigationConfig();
    const userRole = user?.role?.name || 'VISITOR'; 
    const brandLabel = isCollapsed ? 'ERP' : 'ERP SYSTEM';

    return (
        <aside className={`sidebar bg-body border-end d-flex flex-column h-100 w-100 ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
            {/* Logo/Brand Area */}
            <div className="sidebar-brand px-3 border-bottom d-flex align-items-center" style={{ height: 'var(--topbar-height)' }}>
                <h5 className="fw-bold mb-0 text-primary text-uppercase" style={{ letterSpacing: '1px' }}>
                    {brandLabel}
                </h5>
            </div>

            {/* Navigation Menu */}
            <div className="flex-grow-1 overflow-auto py-3">
                {navigationConfig.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-4">
                        {!isCollapsed && (
                            <div className="sidebar-section-label px-4 text-uppercase text-muted small fw-bold mb-2" style={{ letterSpacing: '0.5px', fontSize: '11px' }}>
                                {group.title}
                            </div>
                        )}
                        <ul className="nav flex-column">
                            {group.items.map((item, itemIndex) => {
                                if (item.roles && !item.roles.includes(userRole)) return null;

                                const Icon = item.icon;
                                return (
                                    <li className="nav-item" key={itemIndex}>
                                        <NavLink 
                                            to={item.path} 
                                            className={({ isActive }) => 
                                                `nav-link d-flex align-items-center ${isCollapsed ? 'justify-content-center px-2' : 'px-4'} py-2 text-body ${isActive ? 'bg-primary bg-opacity-10 fw-bold text-primary border-end border-primary border-4' : ''}`
                                            }
                                            style={{ transition: 'all 0.2s' }}
                                            onClick={onItemClick}
                                            title={isCollapsed ? item.text : undefined}
                                        >
                                            <Icon 
                                                className={`${isCollapsed ? '' : 'me-3'} ${item.isActive ? 'text-primary' : 'text-secondary'}`} 
                                                size={20} 
                                            />
                                            {!isCollapsed && <span style={{ fontSize: '14px' }}>{item.text}</span>}
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            {/* User Profile Area Summary */}
            <div className="sidebar-profile p-3 border-top mt-auto bg-body-tertiary d-flex align-items-center">
                <div className={`rounded-circle bg-primary text-white d-flex align-items-center justify-content-center ${isCollapsed ? '' : 'me-3'}`} style={{ width: '36px', height: '36px', fontWeight: 'bold' }}>
                    {user?.name?.charAt(0) || 'U'}
                </div>
                {!isCollapsed && (
                    <div className="overflow-hidden">
                        <div className="text-truncate fw-bold small text-body">{user?.name}</div>
                        <div className="text-truncate small text-muted" style={{ fontSize: '11px' }}>{userRole}</div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
