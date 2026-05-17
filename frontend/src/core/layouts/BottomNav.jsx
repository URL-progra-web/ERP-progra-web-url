import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import { useAuth } from '../auth/AuthContext';
import { getNavigationConfig } from '../registry/registryUtils';

const BottomNav = ({ onMenuClick }) => {
    const { user } = useAuth();
    const location = useLocation();
    const navigationConfig = getNavigationConfig();
    const userRole = user?.role?.name || 'VISITOR';

    // Flatten all accessible items, take first 3 for bottom bar
    const allItems = navigationConfig.flatMap(group =>
        group.items.filter(item => !item.roles || item.roles.includes(userRole))
    );

    const visibleItems = allItems.slice(0, 3);

    return (
        <nav className="bottom-nav d-flex d-md-none">
            {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path
                    || (item.path !== '/' && location.pathname.startsWith(item.path));

                return (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="bnav-icon">
                            <Icon size={20} />
                        </span>
                        <span>{item.text.split(' ')[0]}</span>
                    </NavLink>
                );
            })}

            <button className="bottom-nav-item" onClick={onMenuClick}>
                <span className="bnav-icon">
                    <FiMenu size={20} />
                </span>
                <span>Menú</span>
            </button>
        </nav>
    );
};

export default BottomNav;
