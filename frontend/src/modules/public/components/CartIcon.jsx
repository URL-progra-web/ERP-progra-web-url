import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';

export const CartIcon = ({ count, onClick }) => {
  return (
    <button className="btn btn-store-primary position-relative" onClick={onClick}>
      <FiShoppingCart size={18} />
      <span className="d-none d-sm-inline">Carrito</span>
      {count > 0 && (
        <span
          key={count}
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill store-cart-badge"
          style={{ fontSize: '0.75rem', background: '#f43f5e' }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};
