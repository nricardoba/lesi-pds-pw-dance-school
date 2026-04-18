import React, { useState } from 'react';
import '../pagesCss/CostumesPage.css';
import CostumeCard from '../components/costumeCard/CostumeCard';
import CostumeModal from '../components/costumeModal/CostumeModal';
import RentalItem from '../components/rentalItem/RentalItem';
import RentalModal from '../components/rentalModal/RentalModal';

const CostumesPage = () => {
  const [activeTab, setActiveTab] = useState('figurinos');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todas');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCostume, setEditingCostume] = useState(null);

  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [rentingCostume, setRentingCostume] = useState(null);
  const [costumeToDelete, setCostumeToDelete] = useState(null);

  // Dados dos Figurinos
  const [costumes, setCostumes] = useState([
    {
      id: 1, title: 'Tutu Branco Clássico', category: 'Ballet', size: 'M', condition: 'Novo', color: 'Branco', price: 25.00, lateFee: 2.50, isRental: true, stock: 3, status: 'Disponível', actionText: 'Alugar', image: 'https://images.unsplash.com/photo-1516477287754-526bf3b11874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2, title: 'Tutu Azul Royal', category: 'Ballet', size: 'S', condition: 'Usado', color: 'Azul', price: 30.00, lateFee: 3.00, isRental: true, stock: 2, status: 'Disponível', actionText: 'Alugar', image: 'https://images.unsplash.com/photo-1542139414-06109e44d32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3, title: 'Fato Hip Hop Preto', category: 'Hip Hop', size: 'L', condition: 'Novo', color: 'Preto', price: 45.00, lateFee: 0, isRental: false, stock: 5, status: 'Disponível', actionText: 'Alugar', image: 'https://images.unsplash.com/photo-1535597407571-0814ce3683f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 4, title: 'Maillot Jazz Rosa', category: 'Jazz', size: 'M', condition: 'Usado', color: 'Rosa', price: 15.00, lateFee: 1.50, isRental: true, stock: 4, status: 'Disponível', actionText: 'Alugar', image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 5, title: 'Vestido Contemporâneo', category: 'Contemporâneo', size: 'S', condition: 'Novo', color: 'Rosa', price: 20.00, lateFee: 2.00, isRental: true, stock: 0, status: 'Alugado', actionText: 'Indisponível', image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ]);

  // Dados dos Alugueres Ativos
  const [activeRentals , setActiveRentals] = useState([
    { id: 1, costumeName: 'Vestido Contemporâneo', studentName: 'Mariana Silva', startDate: '2026-01-10', endDate: '2026-01-20', price: 20.00, status: 'Ativo' },
    { id: 2, costumeName: 'Tutu Branco Clássico', studentName: 'Beatriz Oliveira', startDate: '2025-12-15', endDate: '2025-12-30', price: 25.00, status: 'Atrasado' }
  ]);

  // A LÓGICA DE FILTRAGEM COMPLETA (Isto faz os filtros funcionarem)
  const filteredCostumes = costumes.filter(costume => {
    // 1. Pesquisa por Nome
    if (searchTerm && !costume.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    // 2. Filtro Categoria
    if (categoryFilter !== 'todos' && costume.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    
    // 3. Filtro Estado
    if (statusFilter !== 'todas') {
      if (statusFilter === 'disponivel' && costume.status !== 'Disponível') return false;
      if (statusFilter === 'alugado' && costume.status !== 'Alugado') return false;
    }
    return true; 
  });

  // Controlo do Modal
  const handleOpenNewCostume = () => {
    setEditingCostume(null);
    setIsModalOpen(true);
  };

  const handleEditCostume = (costume) => {
    setEditingCostume(costume);
    setIsModalOpen(true);
  };

  const handleOpenRentalModal = (costume) => {
    setRentingCostume(costume);
    setIsRentalModalOpen(true);
  };
  const handleSaveRental = (rentalData) => {
    setActiveRentals([...activeRentals, rentalData]);
    
  };

  const handleSaveCostume = (costumeData) => {
    costumeData.isRental = true;
    costumeData.actionText = costumeData.status === 'Disponível' ? 'Alugar' : 'Indisponível';
    if (editingCostume) {
      setCostumes(costumes.map(c => c.id === costumeData.id ? costumeData : c));
    } else {
      setCostumes([...costumes, costumeData]);
    }
  };

  const handleAskDeleteCostume = (costume) => {
    setCostumeToDelete(costume);
  };

  const handleCancelDeleteCostume = () => {
    setCostumeToDelete(null);
  };

  const handleConfirmDeleteCostume = () => {
    if (!costumeToDelete) {
      return;
    }

    setCostumes(costumes.filter((costume) => costume.id !== costumeToDelete.id));
    setCostumeToDelete(null);
  };

  return (
    <div className="costumes-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Figurinos</h1>
          <p className="page-subtitle">Gestão de aluguer e venda de figurinos</p>
        </div>
        <button className="btn-primary" onClick={handleOpenNewCostume}>
          + Novo Figurino
        </button>
      </header>

      {/* TABS REFEITAS PARA SEREM CAIXAS CINZENTAS COMO NA FOTO */}
      <div className="costumes-tabs">
        <button 
          className={`tab-btn ${activeTab === 'figurinos' ? 'active' : ''}`}
          onClick={() => setActiveTab('figurinos')}
        >
          <span style={{opacity: 0.5}}>📦</span> Figurinos
        </button>
        <button 
          className={`tab-btn ${activeTab === 'alugueres' ? 'active' : ''}`}
          onClick={() => setActiveTab('alugueres')}
        >
          <span style={{opacity: 0.5}}>📋</span> Alugueres
        </button>
      </div>

      {activeTab === 'figurinos' ? (
        <>
          {/* BARRA DE FILTROS REFEITA PARA FICAR ALINHADA À ESQUERDA */}
          <div className="filters-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input 
                type="search" 
                placeholder="Pesquisar figurinos..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-dropdowns">
              <div className="dropdown">
                <span className="icon">♈</span>
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="ballet">Ballet</option>
                  <option value="hip hop">Hip Hop</option>
                  <option value="jazz">Jazz</option>
                  <option value="contemporâneo">Contemporâneo</option>
                </select>
              </div>
              
              <div className="dropdown">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="todas">Todas</option>
                  <option value="disponivel">Disponíveis</option>
                  <option value="alugado">Alugados</option>
                </select>
              </div>
            </div>
          </div>

          <div className="costumes-grid">
            {filteredCostumes.map(costume => (
                <CostumeCard 
                  key={costume.id} 
                  costume={costume} 
                  onEdit={() => handleEditCostume(costume)} 
                  onRent={() => handleOpenRentalModal(costume)}
                  onDelete={() => handleAskDeleteCostume(costume)}
                />
            ))}
            {filteredCostumes.length === 0 && (
              <div style={{ padding: '24px', color: '#64748B' }}>Nenhum figurino encontrado.</div>
            )}
          </div>
        </>
      ) : (
        <div className="rentals-section">
          <h3 className="section-title">Alugueres Ativos</h3>
          <div className="rentals-list">
            {activeRentals.map(rental => (
              <RentalItem key={rental.id} rental={rental} />
            ))}
          </div>
        </div>
      )}

      <CostumeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingCostume} 
        onSave={handleSaveCostume} 
      />
      <RentalModal 
        isOpen={isRentalModalOpen}
        onClose={() => setIsRentalModalOpen(false)}
        costume={rentingCostume}
        onSave={handleSaveRental}
      />

      {costumeToDelete && (
        <div className="delete-confirm-overlay" onClick={handleCancelDeleteCostume}>
          <div className="delete-confirm-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-confirm-title">Remover figurino</h3>
            <p className="delete-confirm-text">
              Tens a certeza que queres remover <strong>{costumeToDelete.title}</strong>?
            </p>
            <div className="delete-confirm-actions">
              <button type="button" className="delete-cancel-btn" onClick={handleCancelDeleteCostume}>
                Cancelar
              </button>
              <button type="button" className="delete-confirm-btn" onClick={handleConfirmDeleteCostume}>
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostumesPage;