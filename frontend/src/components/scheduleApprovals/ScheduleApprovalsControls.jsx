import React from 'react';

const ScheduleApprovalsControls = ({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedSchoolYear,
  setSelectedSchoolYear,
  schoolYearOptions,
}) => {
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

      <div className="controls-filters">
        <select
          className="year-select"
          aria-label="Filtrar por ano letivo"
          value={selectedSchoolYear}
          onChange={(event) => setSelectedSchoolYear(event.target.value)}
        >
          <option value="Todos">Todos os anos</option>
          {schoolYearOptions.map((year) => (
            <option key={year.id} value={year.id}>
              {year.name}
            </option>
          ))}
        </select>

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
      </div>
    </section>
  );
};

export default ScheduleApprovalsControls;