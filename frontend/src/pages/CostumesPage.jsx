import React, { useEffect, useMemo, useState } from 'react';
import '../pagesCss/CostumesPage.css';
import CostumeCard from '../components/costumeCard/CostumeCard';
import CostumeModal from '../components/costumeModal/CostumeModal';
import RentalItem from '../components/rentalItem/RentalItem';
import RentalModal from '../components/rentalModal/RentalModal';

import { getItems, getRentals, createRental, returnRental, createItemCharacteristics, createItem, updateItemCharacteristics, updateItem, uploadCharacteristicImage, deleteItem } from '../services/inventory';
import { getUsers } from '../services/users';
import { useAuth } from '../context/useAuth';

const getCostumeGroupKey = (item) => {
  const chars = item.itemCharacteristics || {};
  const rentFee = Number(item.schoolItem?.rentFee ?? 0).toFixed(2);
  return `${chars.itemCharacteristicsId || 0}|${item.itemConditionId || 0}|${rentFee}`;
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

      const activeRentalItemIds = new Set(
        rentalsData
          .filter((rental) => !rental.actualRentDateEnd)
          .map((rental) => rental.itemId),
      );

      const schoolItems = itemsData.filter((item) => !!item.schoolItem);
      const groupedByCostume = new Map();

      schoolItems.forEach((item) => {
        const key = getCostumeGroupKey(item);
        const chars = item.itemCharacteristics || {};
        const isAvailable = !activeRentalItemIds.has(item.itemId);

        if (!groupedByCostume.has(key)) {
          groupedByCostume.set(key, {
            id: item.itemId,
            ids: [item.itemId],
            availableItemIds: isAvailable ? [item.itemId] : [],
            characteristicsId: chars.itemCharacteristicsId,
            title: chars.itemCharacteristicsName || 'Sem nome',
            name: chars.itemCharacteristicsName || '',
            categoryId: chars.categoryId,
            sizeId: chars.sizeId,
            colorId: chars.colorId,
            category: chars.category?.categoryName || 'Desconhecida',
            size: chars.size?.sizeName || 'N/A',
            condition: item.itemCondition?.itemConditionName || 'Novo',
            itemConditionId: item.itemConditionId,
            color: chars.color?.colorName || 'N/A',
            rentFee: Number(item.schoolItem?.rentFee ?? 0),
            isRental: true,
            image: chars.itemImage?.[0]?.itemImageUrl || 'https://via.placeholder.com/150',
            images: [chars.itemImage?.[0]?.itemImageUrl || ''],
          });
          return;
        }

        const group = groupedByCostume.get(key);
        group.ids.push(item.itemId);
        if (isAvailable) {
          group.availableItemIds.push(item.itemId);
        }
      });

      const formattedItems = Array.from(groupedByCostume.values()).map((group) => {
        const quantity = group.ids.length;
        const stock = group.availableItemIds.length;
        const representativeId = stock > 0 ? group.availableItemIds[0] : group.ids[0];
        const status = stock > 0 ? 'Disponível' : 'Alugado';

        return {
          ...group,
          id: representativeId,
          quantity,
          stock,
          status,
          actionText: status === 'Disponível' ? 'Alugar' : 'Indisponível',
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
        alert('Por favor seleciona um aluno válido.');
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
      console.error('Erro ao criar aluguer:', error);
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
      console.error('Erro ao processar devolução:', error);
      alert('Erro ao devolver o equipamento.');
    }
  };

  const handleSaveCostume = async (costumeData) => {
    try {
      if (editingCostume) {
        const currentQuantity = Math.max(1, Number(editingCostume.quantity || 1));
        const currentStock = Math.max(0, Number(editingCostume.stock ?? currentQuantity));
        const rentedQuantity = Math.max(0, currentQuantity - currentStock);
        const targetQuantity = Math.max(1, Number(costumeData.quantity || currentQuantity));

        if (targetQuantity < rentedQuantity) {
          alert(`Não é possível reduzir para ${targetQuantity}. Existem ${rentedQuantity} unidades alugadas.`);
          return;
        }

        await updateItemCharacteristics(
          editingCostume.characteristicsId || costumeData.characteristicsId,
          {
            name: costumeData.name,
            categoryId: costumeData.categoryId,
            sizeId: costumeData.sizeId,
            colorId: costumeData.colorId,
          },
          token
        );

        const allItemIds = editingCostume.ids?.length ? editingCostume.ids : [editingCostume.id];
        const availableItemIds = editingCostume.availableItemIds?.length
          ? editingCostume.availableItemIds
          : [editingCostume.id];

        const quantityDelta = targetQuantity - currentQuantity;
        let itemIdsToDelete = [];

        if (quantityDelta < 0) {
          const removeCount = Math.abs(quantityDelta);
          itemIdsToDelete = availableItemIds.slice(0, removeCount);

          if (itemIdsToDelete.length < removeCount) {
            alert('Não foi possível ajustar a quantidade porque algumas unidades estão alugadas.');
            return;
          }
        }

        const deleteSet = new Set(itemIdsToDelete);
        const itemIdsToUpdate = allItemIds.filter((itemId) => !deleteSet.has(itemId));

        await Promise.all(
          itemIdsToUpdate.map((itemId) =>
            updateItem(
              itemId,
              {
                itemConditionId: costumeData.itemConditionId,
                rentFee: costumeData.rentFee,
              },
              token,
            ),
          ),
        );

        if (itemIdsToDelete.length > 0) {
          await Promise.all(itemIdsToDelete.map((itemId) => deleteItem(itemId, token)));
        }

        if (quantityDelta > 0) {
          const createRequests = Array.from({ length: quantityDelta }, () =>
            createItem(
              {
                itemCharacteristicsId: editingCostume.characteristicsId || costumeData.characteristicsId,
                itemConditionId: costumeData.itemConditionId,
                ownerType: 'school',
                rentFee: costumeData.rentFee,
              },
              token,
            ),
          );
          await Promise.all(createRequests);
        }

        if (costumeData.imageFile && costumeData.imageFile.size > 0) {
          await uploadCharacteristicImage(
            editingCostume.characteristicsId || costumeData.characteristicsId,
            costumeData.imageFile,
            token
          );
        }
      } else {
        const charRes = await createItemCharacteristics({
          name: costumeData.name,
          categoryId: costumeData.categoryId,
          sizeId: costumeData.sizeId,
          colorId: costumeData.colorId,
        }, token);

        const quantity = Math.max(1, Number(costumeData.quantity || 1));
        const createRequests = Array.from({ length: quantity }, () => createItem({
          itemCharacteristicsId: charRes.itemCharacteristicsId,
          itemConditionId: costumeData.itemConditionId,
          ownerType: 'school',
          rentFee: costumeData.rentFee,
        }, token));

        await Promise.all(createRequests);

        if (costumeData.imageFile && costumeData.imageFile.size > 0) {
          await uploadCharacteristicImage(charRes.itemCharacteristicsId, costumeData.imageFile, token);
        }
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (e) {
      console.error('Erro ao guardar figurino:', e);
      alert('Erro ao guardar figurino.');
    }
  };

  const handleAskDeleteCostume = (costume) => {
    setCostumeToDelete(costume);
  };

  const handleCancelDeleteCostume = () => {
    setCostumeToDelete(null);
  };

  const handleConfirmDeleteCostume = async () => {
    if (!costumeToDelete) return;
    try {
      const itemIdsToDelete = costumeToDelete.ids?.length ? costumeToDelete.ids : [costumeToDelete.id];
      await Promise.all(itemIdsToDelete.map((itemId) => deleteItem(itemId, token)));
      await fetchData();
      setCostumeToDelete(null);
    } catch (e) {
      console.error('Erro ao remover figurino:', e);
      alert('Erro ao remover figurino.');
    }
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
        key={`${isModalOpen ? 'open' : 'closed'}-${editingCostume?.id || 'new'}`}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCostume(null);
        }}
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
