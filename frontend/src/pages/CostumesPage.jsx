import React, { useEffect, useMemo, useState } from 'react';
import '../pagesCss/CostumesPage.css';
import CostumeCard from '../components/costumeCard/CostumeCard';
import CostumeModal from '../components/costumeModal/CostumeModal';
import RentalItem from '../components/rentalItem/RentalItem';
import RentalModal from '../components/rentalModal/RentalModal';

import { getItems, getRentals, createRental, returnRental } from '../services/inventory';
import { getUsers } from '../services/users';
import { useAuth } from '../context/useAuth';

const getCostumeStatus = (itemId, rentals) => {
  const hasActiveRental = rentals.some(
    (rental) => rental.itemId === itemId && !rental.actualRentDateEnd,
  );

  return hasActiveRental ? 'Alugado' : 'Disponível';
};

const CostumesPage = () => {
  const { token, user, role } = useAuth();
  const isAdmin = role === 'admin';

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
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const [itemsData, rentalsData, usersData] = await Promise.all([
        getItems(token),
        getRentals(token),
        getUsers(token),
      ]);

      const studentsOnly = usersData.filter((u) => {
        const type = u.userType?.userTypeDesc?.toLowerCase() || '';
        return type === 'student' || type === 'aluno';
      });
      setStudents(studentsOnly);

      const formattedRentals = rentalsData.map((rental) => ({
        id: rental.rentId,
        itemId: rental.itemId,
        costumeName:
          rental.schoolItem?.item?.itemCharacteristics?.itemCharacteristicsName ||
          'Figurino desconhecido',
        studentName: rental.user?.userName || 'Aluno desconhecido',
        startDate: rental.rentDateStart ? rental.rentDateStart.split('T')[0] : '',
        endDate: rental.rentDateEnd ? rental.rentDateEnd.split('T')[0] : '',
        actualReturnDate: rental.actualRentDateEnd ? rental.actualRentDateEnd.split('T')[0] : '',
        price: Number(rental.schoolItem?.rentFee ?? 0),
        status: rental.actualRentDateEnd ? 'Concluído' : 'Ativo',
      }));

      const formattedItems = itemsData.map((item) => {
        const chars = item.itemCharacteristics || {};
        const category = chars.category?.categoryName || 'Desconhecida';
        const status = getCostumeStatus(item.itemId, rentalsData);

        return {
          id: item.itemId,
          title: chars.itemCharacteristicsName || 'Sem nome',
          category,
          size: chars.size?.sizeName || 'N/A',
          condition: item.itemCondition?.itemConditionName || 'Novo',
          color: chars.color?.colorName || 'N/A',
          price: Number(item.schoolItem?.rentFee ?? 0),
          lateFee: Number(item.schoolItem?.lateFee ?? 0),
          isRental: true,
          stock: status === 'Disponível' ? 1 : 0,
          status,
          actionText: status === 'Disponível' ? 'Alugar' : 'Indisponível',
          image: chars.itemImage?.[0]?.itemImageUrl || 'https://via.placeholder.com/150',
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
    if (token) {
      fetchData();
    }
  }, [token]);

  const filteredCostumes = useMemo(() => {
    return costumes.filter((costume) => {
      if (searchTerm && !costume.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (categoryFilter !== 'todos' && costume.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;

      if (statusFilter !== 'todas') {
        if (statusFilter === 'disponivel' && costume.status !== 'Disponível') return false;
        if (statusFilter === 'alugado' && costume.status !== 'Alugado') return false;
      }

      return true;
    });
  }, [costumes, searchTerm, categoryFilter, statusFilter]);

  const handleOpenNewCostume = () => {
    setEditingCostume(null);
    setIsModalOpen(true);
  };

  const handleEditCostume = (costume) => {
    setEditingCostume(costume);
    setIsModalOpen(true);
  };

  const handleOpenRentalModal = (costume) => {
    if (costume.status !== 'Disponível') {
      return;
    }

    setRentingCostume(costume);
    setIsRentalModalOpen(true);
  };

  const handleSaveRental = async (rentalData) => {
    try {
      if (!rentalData.studentId) {
        alert('Por favor selecione um aluno válido.');
        return;
      }

      const payload = {
        userId: Number(rentalData.studentId),
        itemId: rentingCostume.id,
        rentDateStart: new Date(rentalData.startDate).toISOString(),
        rentDateEnd: new Date(rentalData.endDate).toISOString(),
      };

      await createRental(payload, token);
      await fetchData();
      setIsRentalModalOpen(false);
      setRentingCostume(null);
    } catch (error) {
      console.error(error);
      alert('Erro ao criar aluguer.');
    }
  };

  const handleReturnRental = async (rentalId) => {
    try {
      await returnRental(
        rentalId,
        {
          actualRentDateEnd: new Date().toISOString(),
          itemDamaged: false,
        },
        token,
      );
      await fetchData();
    } catch (error) {
      console.error(error);
      alert('Erro ao devolver o equipamento.');
    }
  };

  const handleSaveCostume = (costumeData) => {
    costumeData.isRental = true;
    costumeData.actionText = costumeData.status === 'Disponível' ? 'Alugar' : 'Indisponível';
    if (editingCostume) {
      setCostumes(costumes.map((c) => (c.id === costumeData.id ? costumeData : c)));
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
    if (!costumeToDelete) return;
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
        {isAdmin && (
          <button className="btn-primary" onClick={handleOpenNewCostume}>
            + Novo Figurino
          </button>
        )}
      </header>

      <div className="costumes-tabs">
        <button
          className={`tab-btn ${activeTab === 'figurinos' ? 'active' : ''}`}
          onClick={() => setActiveTab('figurinos')}
        >
          <span style={{ opacity: 0.5 }}>📦</span> Figurinos
        </button>
        <button
          className={`tab-btn ${activeTab === 'alugueres' ? 'active' : ''}`}
          onClick={() => setActiveTab('alugueres')}
        >
          <span style={{ opacity: 0.5 }}>📋</span> Alugueres
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: '24px', color: '#64748B' }}>A carregar...</div>
      ) : activeTab === 'figurinos' ? (
        <>
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
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="todos">Todos</option>
                  <option value="ballet">Ballet</option>
                  <option value="hip hop">Hip Hop</option>
                  <option value="jazz">Jazz</option>
                  <option value="contemporâneo">Contemporâneo</option>
                </select>
              </div>

              <div className="dropdown">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="todas">Todas</option>
                  <option value="disponivel">Disponíveis</option>
                  <option value="alugado">Alugados</option>
                </select>
              </div>
            </div>
          </div>

          <div className="costumes-grid">
            {filteredCostumes.map((costume) => (
              <CostumeCard
                isAdmin={isAdmin}
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
            {activeRentals.map((rental) => (
              <RentalItem key={rental.id} rental={rental} onReturn={handleReturnRental} />
            ))}
            {activeRentals.length === 0 && (
              <div style={{ padding: '24px', color: '#64748B' }}>Não existem alugueres registados.</div>
            )}
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
