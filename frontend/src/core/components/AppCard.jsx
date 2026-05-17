import React from 'react';

const AppCard = ({ children, className = '', accent }) => (
    <div
        className={`app-card${className ? ` ${className}` : ''}`}
        style={accent ? { '--card-accent': accent } : undefined}
    >
        {children}
    </div>
);

AppCard.Section = ({ label, children }) => (
    <>
        <div className="section-header">{label}</div>
        {children}
    </>
);

export default AppCard;
