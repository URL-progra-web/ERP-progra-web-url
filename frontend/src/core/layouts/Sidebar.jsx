import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiActivity, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { useAuth } from '../auth/AuthContext';
import { getNavigationConfig } from '../registry/registryUtils';

/* ── SidebarBrand ─────────────────────────────────────────── */

const SidebarBrand = ({ isCollapsed }) => (
    <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
            <FiActivity size={16} />
        </div>
        {!isCollapsed && (
            <div className="sidebar-brand-copy">
                <span className="sidebar-brand-text">ERP System</span>
                <span className="sidebar-brand-subtitle">Control operativo</span>
            </div>
        )}
    </div>
);

/* ── SidebarNavItem ───────────────────────────────────────── */

const SidebarNavItem = ({ item, isCollapsed, onItemClick, userRole }) => {
    if (item.roles && !item.roles.includes(userRole)) return null;
    const Icon = item.icon;

    return (
        <li>
            <NavLink
                to={item.path}
                onClick={onItemClick}
                end
                title={isCollapsed ? item.text : undefined}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
                {({ isActive }) => (
                    <>
                        <span className="sidebar-nav-icon">
                            <Icon size={17} aria-hidden="true" />
                        </span>
                        {!isCollapsed && (
                            <span className="sidebar-nav-text">
                                {item.text}
                            </span>
                        )}
                        {!isCollapsed && isActive && <span className="sidebar-nav-active-dot" />}
                    </>
                )}
            </NavLink>
        </li>
    );
};

/* ── SidebarNavGroup ──────────────────────────────────────── */

const SidebarNavGroup = ({ group, isCollapsed, onItemClick, userRole, isFirst, isGroupActive }) => (
    <div className={`sidebar-nav-group ${isGroupActive ? 'is-active' : ''}`}>
        {isCollapsed ? (
            !isFirst && (
                <div className="sidebar-nav-divider" />
            )
        ) : (
            <div className="sidebar-nav-label">
                <span>{group.title}</span>
                {isGroupActive && <span className="sidebar-nav-label-pulse" />}
            </div>
        )}
        <ul className="sidebar-nav-list">
            {group.items.map((item, i) => (
                <SidebarNavItem
                    key={i}
                    item={item}
                    isCollapsed={isCollapsed}
                    onItemClick={onItemClick}
                    userRole={userRole}
                />
            ))}
        </ul>
    </div>
);

/* ── SidebarCollapseBtn ───────────────────────────────────── */

const SidebarCollapseBtn = ({ isCollapsed, onToggle }) => (
    <button
        type="button"
        onClick={onToggle}
        className="sidebar-collapse-btn"
        title={isCollapsed ? 'Expandir menú' : 'Compactar menú'}
        aria-label={isCollapsed ? 'Expandir menú' : 'Compactar menú'}
    >
        {isCollapsed
            ? <FiChevronsRight size={16} />
            : <><FiChevronsLeft size={16} /><span>Compactar</span></>
        }
    </button>
);

/* ── SidebarUserCard ──────────────────────────────────────── */

const SidebarUserCard = ({ user, userRole, isCollapsed }) => {
    const initials = user?.name?.charAt(0)?.toUpperCase() || 'U';
    const displayName = user?.name || 'Usuario';

    return (
        <div className={`sidebar-profile ${isCollapsed ? 'is-collapsed' : ''}`}>
            <div className="topbar-avatar sidebar-profile-avatar">
                {initials}
            </div>
            {!isCollapsed && (
                <div className="sidebar-profile-copy">
                    <div className="sidebar-profile-name">{displayName}</div>
                    <div className="sidebar-profile-role">{userRole}</div>
                </div>
            )}
        </div>
    );
};

/* ── Main Sidebar ─────────────────────────────────────────── */

const Sidebar = ({ onItemClick, isCollapsed = false, onToggleCollapse }) => {
    const { user } = useAuth();
    const location = useLocation();
    const navigationConfig = getNavigationConfig();
    const userRole = user?.role?.name || 'VISITOR';

    return (
        <aside
            className={`sidebar d-flex flex-column h-100 w-100 ${isCollapsed ? 'sidebar--collapsed' : ''}`}
        >
            <SidebarBrand isCollapsed={isCollapsed} />

            <nav className="sidebar-nav" aria-label="Navegación principal">
                {navigationConfig.map((group, i) => {
                    const isGroupActive = group.items.some(item => (
                        (!item.roles || item.roles.includes(userRole))
                        && (location.pathname === item.path || location.pathname.startsWith(`${item.path}/`))
                    ));

                    return (
                        <SidebarNavGroup
                            key={i}
                            group={group}
                            isCollapsed={isCollapsed}
                            onItemClick={onItemClick}
                            userRole={userRole}
                            isFirst={i === 0}
                            isGroupActive={isGroupActive}
                        />
                    );
                })}
            </nav>

            <div className="d-none d-md-block">
                <SidebarCollapseBtn isCollapsed={isCollapsed} onToggle={onToggleCollapse} />
            </div>

            <SidebarUserCard user={user} userRole={userRole} isCollapsed={isCollapsed} />
        </aside>
    );
};

export default Sidebar;
