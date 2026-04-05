import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiTerminal, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { useAuth } from '../auth/AuthContext';
import { getNavigationConfig } from '../registry/registryUtils';

/* ── SidebarBrand ─────────────────────────────────────────── */

const SidebarBrand = ({ isCollapsed }) => (
    <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
            <FiTerminal size={16} color="white" />
        </div>
        {!isCollapsed && (
            <span className="sidebar-brand-text">ERP System</span>
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
                        <Icon size={18} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.65 }} />
                        {!isCollapsed && (
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.text}
                            </span>
                        )}
                    </>
                )}
            </NavLink>
        </li>
    );
};

/* ── SidebarNavGroup ──────────────────────────────────────── */

const SidebarNavGroup = ({ group, isCollapsed, onItemClick, userRole, isFirst }) => (
    <div style={{ marginBottom: isCollapsed ? '4px' : '6px' }}>
        {isCollapsed ? (
            /* Collapsed: thin divider between groups (skip before first) */
            !isFirst && (
                <div style={{
                    height: '1px',
                    background: 'var(--bs-border-color)',
                    margin: '6px 14px 8px',
                }} />
            )
        ) : (
            <div className="sidebar-nav-label">{group.title}</div>
        )}
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
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
        onClick={onToggle}
        title={isCollapsed ? 'Expandir menú' : 'Compactar menú'}
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '8px',
            width: '100%',
            padding: isCollapsed ? '11px' : '10px 18px',
            border: 'none',
            borderTop: '1px solid var(--bs-border-color)',
            background: 'transparent',
            color: 'var(--bs-tertiary-color)',
            cursor: 'pointer',
            transition: 'color var(--transition), background var(--transition)',
            fontFamily: 'var(--font-display)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.03em',
        }}
        onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--bs-body-color)';
            e.currentTarget.style.background = 'rgba(var(--bs-primary-rgb),0.06)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--bs-tertiary-color)';
            e.currentTarget.style.background = 'transparent';
        }}
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

    return (
        <div className={`sidebar-profile ${isCollapsed ? 'justify-content-center' : ''}`}>
            <div className="topbar-avatar" style={{ flexShrink: 0 }}>
                {initials}
            </div>
            {!isCollapsed && (
                <div style={{ overflow: 'hidden', minWidth: 0 }}>
                    <div className="sidebar-profile-name">{user?.name}</div>
                    <div className="sidebar-profile-role">{userRole}</div>
                </div>
            )}
        </div>
    );
};

/* ── Main Sidebar ─────────────────────────────────────────── */

const Sidebar = ({ onItemClick, isCollapsed = false, onToggleCollapse }) => {
    const { user } = useAuth();
    const navigationConfig = getNavigationConfig();
    const userRole = user?.role?.name || 'VISITOR';

    return (
        <aside
            className={`sidebar d-flex flex-column h-100 w-100 ${isCollapsed ? 'sidebar--collapsed' : ''}`}
            style={{
                borderRight: '1px solid var(--bs-border-color)',
                background: 'var(--bs-secondary-bg)',
                overflow: 'hidden',
            }}
        >
            <SidebarBrand isCollapsed={isCollapsed} />

            <nav className="flex-grow-1 overflow-auto py-3" style={{ overflowX: 'hidden' }}>
                {navigationConfig.map((group, i) => (
                    <SidebarNavGroup
                        key={i}
                        group={group}
                        isCollapsed={isCollapsed}
                        onItemClick={onItemClick}
                        userRole={userRole}
                        isFirst={i === 0}
                    />
                ))}
            </nav>

            {/* Collapse toggle — desktop only */}
            <div className="d-none d-md-block">
                <SidebarCollapseBtn isCollapsed={isCollapsed} onToggle={onToggleCollapse} />
            </div>

            <SidebarUserCard user={user} userRole={userRole} isCollapsed={isCollapsed} />
        </aside>
    );
};

export default Sidebar;
