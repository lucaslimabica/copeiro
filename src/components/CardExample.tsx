import React from 'react';

export const CardExample: React.FC = () => {
  return (
    <div className="card">
      <div className="card-header">
        <h2>Card Title</h2>
      </div>
      <div className="card-body">
        <p>This is a placeholder card component.</p>
      </div>
      <div className="card-footer">
        <button>Action</button>
      </div>
    </div>
  );
};

export default CardExample;