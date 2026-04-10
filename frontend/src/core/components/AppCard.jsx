import React from 'react';

const AppCard = ({ children, className = '', accent }) => (
    <div
        className={`rounded-4 border shadow-sm overflow-hidden bg-body${className ? ` ${className}` : ''}`}
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
