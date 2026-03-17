import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getNavigationConfig } from '../registry/registryUtils';

const Sidebar = ({ onItemClick }) => {
    const { user } = useAuth();
    const navigationConfig = getNavigationConfig();
    const userRole = user?.role?.name || 'VISITOR'; 

    return (
        <aside className="bg-body border-end d-flex flex-column h-100 w-100">
            {/* Logo/Brand Area */}
            <div className="p-4 border-bottom d-flex align-items-center justify-content-center" style={{ height: '70px' }}>
                <h5 className="fw-bold mb-0 text-primary" style={{ letterSpacing: '1px' }}>ERP SYSTEM</h5>
            </div>

            {/* Navigation Menu */}
            <div className="flex-grow-1 overflow-auto py-3">
                {navigationConfig.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-4">
                        <div className="px-4 text-uppercase text-muted small fw-bold mb-2" style={{ letterSpacing: '0.5px', fontSize: '11px' }}>
                            {group.title}
                        </div>
                        <ul className="nav flex-column">
                            {group.items.map((item, itemIndex) => {
                                if (item.roles && !item.roles.includes(userRole)) return null;

                                const Icon = item.icon;
                                return (
                                    <li className="nav-item" key={itemIndex}>
                                        <NavLink 
                                            to={item.path} 
                                            className={({ isActive }) => 
                                                `nav-link d-flex align-items-center px-4 py-2 text-body ${isActive ? 'bg-primary bg-opacity-10 fw-bold text-primary border-end border-primary border-4' : ''}`
                                            }
                                            style={{ transition: 'all 0.2s' }}
                                            onClick={onItemClick}
                                        >
                                            <Icon className={`me-3 ${item.isActive ? 'text-primary' : 'text-secondary'}`} size={18} />
                                            <span style={{ fontSize: '14px' }}>{item.text}</span>
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            {/* User Profile Area Summary */}
            <div className="p-3 border-top mt-auto bg-body-tertiary d-flex align-items-center">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: '36px', height: '36px', fontWeight: 'bold' }}>
                    {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden">
                    <div className="text-truncate fw-bold small text-body">{user?.name}</div>
                    <div className="text-truncate small text-muted" style={{ fontSize: '11px' }}>{userRole}</div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
