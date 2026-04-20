import React, { useState, useEffect } from 'react';
import '../pagesCss/CostumesPage.css';
import CostumeCard from '../components/costumeCard/CostumeCard';
import CostumeModal from '../components/costumeModal/CostumeModal';
import RentalItem from '../components/rentalItem/RentalItem';
import RentalModal from '../components/rentalModal/RentalModal';

import { getItems, getRentals, createRental, returnRental } from '../services/inventory';
import { getUsers } from '../services/users';
import { useAuth } from '../context/useAuth';

const CostumesPage = () => {
  const { token, user } = useAuth();
  const isAdmin = user?.user_type_desc === 'Admin';

  const [activeTab, setActiveTab] = useState('figurinos');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todas');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCostume, setEditingCostume] = useState(null);

  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [rentingCostume, setRentingCostume] = useState(null);
  const [costumeToDelete, setCostumeToDelete] = useState(null);

  const [costumes, setCostumes] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [students, setStudents] = useState([]); // Array de alunos para o modal
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const [itemsData, rentalsData, usersData] = await Promise.all([
        getItems(token),
        getRentals(token),
        getUsers(token)
      ]);

      // Filtrar apenas utilizadores do tipo "Student" ou "Aluno"
      const studentsOnly = usersData.filter(u => 
        u.userType?.userTypeDesc?.toLowerCase() === 'student' || 
        u.userType?.userTypeDesc?.toLowerCase() === 'aluno'
      );
      setStudents(studentsOnly);

      // Mapeamento dos Items do Backend para 'costumes' no Frontend
      const formattedItems = itemsData.map(item => {
        const chars = item.itemCharacteristics || {};
        const cat = chars.category?.categoryName || 'Desconhecida';
        const isRental = true; // Assumido se houver preço associado ou logicamente
        
        return {
          id: item.itemId,
          title: chars.itemCharacteristicsName || 'Sem nome',
          category: cat,
          size: chars.size?.sizeName || 'N/A',
          condition: item.itemCondition?.itemConditionName || 'Novo',
          color: chars.color?.colorName || 'N/A',
          price: Number(item.schoolItem?.rentFee) || 0,
          lateFee: 2.50, // Pode vir de configurações globais futuramente
          isRental: isRental,
          stock: 1, // Atualmente é uma unidade por item tracking
          status: 'Disponível', // Determinado consoante o estado de aluguer atual
          actionText: 'Alugar',
          image: chars.itemImage?.[0]?.itemImageUrl || 'https://via.placeholder.com/150'
        };
      });

      // Mapeamento dos Alugueres
      const formattedRentals = rentalsData.map(rental => {
        return {
          id: rental.rentalId,
          costumeName: rental.item?.itemCharacteristics?.itemCharacteristicsName || 'Figurino desconhecido',
          studentName: rental.user?.userName || 'Aluno desconhecido',
          startDate: rental.rentalStartDate ? rental.rentalStartDate.split('T')[0] : '',
          endDate: rental.rentalEndDate ? rental.rentalEndDate.split('T')[0] : '',
          price: Number(rental.rentalAmount) || 0,
          status: rental.rentalIsReturned ? 'Concluído' : 'Ativo'
        };
      });

      setCostumes(formattedItems);
      setActiveRentals(formattedRentals);

    } catch (error) {
      console.error('Erro ao carregar dados dos figurinos/alugueres:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

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

  const handleSaveRental = async (rentalData) => {
    try {
      if (!rentalData.studentId) {
        alert("Por favor selecione um aluno válido.");
        return;
      }
      
      const payload = {
        userId: Number(rentalData.studentId),
        itemId: rentingCostume.id, // O ID do item guardado na pág
        rentDateStart: new Date(rentalData.startDate).toISOString(),
        rentDateEnd: new Date(rentalData.endDate).toISOString()
      };

      await createRental(payload, token);
      
      // Recarrega tudo para atualizar estados do item e as tabs de Rentals
      fetchData(); 
      setIsRentalModalOpen(false);

    } catch (error) {
      console.error(error);
      alert("Erro ao criar aluguer.");
    }
  };

  const handleReturnRental = async (rentalId) => {
    try {
      await returnRental(rentalId, token);
      fetchData(); // Atualiza a lista
    } catch (error) {
      console.error(error);
      alert("Erro ao devolver o equipamento.");
    }
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
        {isAdmin && (<button className="btn-primary" onClick={handleOpenNewCostume}>
          + Novo Figurino
        </button>)}
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
                <CostumeCard isAdmin={isAdmin} 
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
              <RentalItem key={rental.id} rental={rental} onReturn={handleReturnRental} />
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
        students={students}
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
