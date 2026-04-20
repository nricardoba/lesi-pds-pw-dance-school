import React from 'react';

const ScheduleApprovalsControls = ({ searchTerm, setSearchTerm, selectedStatus, setSelectedStatus }) => {
  return (
    <section className="controls-card">
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          type="search"
          placeholder="Pesquisar por professor..."
          className="search-input"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="filter-group">
        {['Todos', 'Pendente', 'Aprovado', 'Rejeitado'].map((status) => (
          <button
            key={status}
            type="button"
            className={`filter-pill ${selectedStatus === status ? 'active' : ''}`}
            onClick={() => setSelectedStatus(status)}
          >
            {status === 'Todos' ? status : status + 's'}
          </button>
        ))}
      </div>
    </section>
  );
};

export default ScheduleApprovalsControls;