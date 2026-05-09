import React, { useEffect, useMemo, useState } from 'react';
import '../pagesCss/CostumesPage.css';
import CostumeCard from '../components/costumeCard/CostumeCard';
import CostumeModal from '../components/costumeModal/CostumeModal';
import RentalItem from '../components/rentalItem/RentalItem';
import RentalModal from '../components/rentalModal/RentalModal';

import { getItems, getRentals, createRental, returnRental, createItemCharacteristics, createItem, updateItemCharacteristics, updateItem, uploadCharacteristicImage, deleteItem, getCategories } from '../services/inventory';
import { getUsers } from '../services/users';
import { useAuth } from '../context/useAuth';

const getCostumeGroupKey = (item) => {
  const chars = item.itemCharacteristics || {};
  const rentFee = Number(item.schoolItem?.rentFee ?? 0).toFixed(2);
  return `${chars.itemCharacteristicsId || 0}|${item.itemConditionId || 0}|${rentFee}`;
};

const formatUserContacts = (user) => {
  const contacts = user?.userContact || [];

  return contacts
    .map((userContact) => ({
      id: userContact.userContactId,
      value: userContact.contact?.contactValue || '',
      type: userContact.contact?.contactType?.contactTypeDesc || 'Contacto',
      isMain: Boolean(userContact.isMainContact),
    }))
    .filter((contact) => contact.value);
};

const CostumesPage = () => {
  const { token, user, role } = useAuth();
  const isAdmin = role === 'admin';
  const isStudent = role === 'student';
  const canCreateCostume = isAdmin || isStudent;
  const currentUserId = user?.user_id ?? user?.userId ?? user?.id ?? null;
  const currentUserName = user?.user_name ?? user?.userName ?? user?.name ?? '';

  const [activeTab, setActiveTab] = useState('figurinos');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todas');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCostume, setEditingCostume] = useState(null);

  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [rentingCostume, setRentingCostume] = useState(null);
  const [costumeToDelete, setCostumeToDelete] = useState(null);
  const [selectedRental, setSelectedRental] = useState(null);
  const [selectedCostumeInfo, setSelectedCostumeInfo] = useState(null);

  const [costumes, setCostumes] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const [itemsData, rentalsData, usersData] = await Promise.all([
        getItems(token),
        getRentals(token),
        getUsers(token),
      ]);

      const categoriesData = await getCategories(token);

      setCategories(categoriesData || []);

      const studentsOnly = usersData.filter((u) => {
        const type = u.userType?.userTypeDesc?.toLowerCase() || '';
        return type === 'student' || type === 'aluno';
      });
      setStudents(studentsOnly);

      const formattedRentals = rentalsData.map((rental) => ({
        id: rental.rentId,
        userId: rental.userId,
        itemId: rental.itemId,
        costumeName:
          rental.schoolItem?.item?.itemCharacteristics?.itemCharacteristicsName ||
          'Figurino desconhecido',
        studentName: rental.user?.userName || 'Aluno desconhecido',
        studentNumber: rental.user?.studentNumber?.studentNumber || '',
        startDate: rental.rentDateStart ? rental.rentDateStart.split('T')[0] : '',
        endDate: rental.rentDateEnd ? rental.rentDateEnd.split('T')[0] : '',
        actualReturnDate: rental.actualRentDateEnd ? rental.actualRentDateEnd.split('T')[0] : '',
        price: Number(rental.schoolItem?.rentFee ?? 0),
        category:
          rental.schoolItem?.item?.itemCharacteristics?.category?.categoryName || 'Desconhecida',
        size:
          rental.schoolItem?.item?.itemCharacteristics?.size?.sizeName || 'N/A',
        color:
          rental.schoolItem?.item?.itemCharacteristics?.color?.colorName || 'N/A',
        condition: rental.schoolItem?.item?.itemCondition?.itemConditionName || 'Desconhecida',
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
            ownerType: 'school',
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

      const userCostumes = itemsData
        .filter((item) => !!item.userItem && !item.schoolItem)
        .map((item) => {
          const chars = item.itemCharacteristics || {};
          const owner = item.userItem?.user || {};
          const contacts = formatUserContacts(owner);

          return {
            id: item.itemId,
            ids: [item.itemId],
            availableItemIds: [item.itemId],
            ownerUserId: item.userItem?.userId,
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
            rentFee: 0,
            isRental: false,
            ownerType: 'user',
            sellerName: owner.userName || 'Aluno',
            sellerStudentNumber: owner.studentNumber?.studentNumber || '',
            sellerContacts: contacts,
            image: chars.itemImage?.[0]?.itemImageUrl || 'https://via.placeholder.com/150',
            images: [chars.itemImage?.[0]?.itemImageUrl || ''],
            quantity: 1,
            stock: 1,
            status: 'Disponível',
            actionText: 'Ver informações',
          };
        });

      const formattedItems = [
        ...Array.from(groupedByCostume.values()).map((group) => {
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
        }),
        ...userCostumes,
      ].sort((left, right) => left.title.localeCompare(right.title));

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

  const visibleRentals = useMemo(() => {
    if (isAdmin) return activeRentals;
    return activeRentals.filter((rental) => {
      const matchesUserId = currentUserId !== null && currentUserId !== undefined
        ? String(rental.userId) === String(currentUserId)
        : false;
      const matchesUserName = currentUserName
        ? rental.studentName?.toLowerCase() === currentUserName.toLowerCase()
        : false;

      return matchesUserId || matchesUserName;
    });
  }, [activeRentals, currentUserId, currentUserName, isAdmin]);

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

  const handleOpenRentalDetails = (rental) => {
    setSelectedRental(rental);
  };

  const handleCloseRentalDetails = () => {
    setSelectedRental(null);
  };

  const handleOpenCostumeInfo = (costume) => {
    setSelectedCostumeInfo(costume);
  };

  const handleCloseCostumeInfo = () => {
    setSelectedCostumeInfo(null);
  };

  const handleSaveCostume = async (costumeData) => {
    try {
      const ownerType = costumeData.ownerType || (isStudent ? 'user' : 'school');

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
                ...(editingCostume.ownerType === 'school'
                  ? { rentFee: costumeData.rentFee, ownerType: 'school' }
                  : { ownerType: 'user' }),
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
                ownerType: editingCostume.ownerType === 'user' ? 'user' : 'school',
                ...(editingCostume.ownerType === 'school'
                  ? { rentFee: costumeData.rentFee }
                  : { userId: currentUserId }),
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
        if (ownerType === 'user' && !currentUserId) {
          alert('Não foi possível identificar o teu utilizador para criar o figurino.');
          return;
        }

        const charRes = await createItemCharacteristics({
          name: costumeData.name,
          categoryId: costumeData.categoryId,
          sizeId: costumeData.sizeId,
          colorId: costumeData.colorId,
        }, token);

        const quantity = ownerType === 'school' ? Math.max(1, Number(costumeData.quantity || 1)) : 1;
        const createRequests = Array.from({ length: quantity }, () => createItem({
          itemCharacteristicsId: charRes.itemCharacteristicsId,
          itemConditionId: costumeData.itemConditionId,
          ownerType,
          ...(ownerType === 'school'
            ? { rentFee: costumeData.rentFee }
            : { userId: currentUserId }),
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
        {canCreateCostume && (
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
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="todos">Todos</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryName}>
                      {category.categoryName}
                    </option>
                  ))}
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
                onEdit={
                  (costume.ownerType === 'school' && (isAdmin || role === 'parent')) ||
                  (costume.ownerType === 'user' && role === 'student' && String(costume.ownerUserId) === String(currentUserId))
                    ? () => handleEditCostume(costume)
                    : undefined
                }
                onRent={isAdmin && costume.ownerType === 'school' ? () => handleOpenRentalModal(costume) : undefined}
                onViewInfo={costume.ownerType === 'user' ? () => handleOpenCostumeInfo(costume) : undefined}
                onDelete={
                  (costume.ownerType === 'school' && (isAdmin || role === 'parent')) ||
                  (costume.ownerType === 'user' && role === 'student' && String(costume.ownerUserId) === String(currentUserId))
                    ? () => handleAskDeleteCostume(costume)
                    : undefined
                }
              />
            ))}
            {filteredCostumes.length === 0 && (
              <div style={{ padding: '24px', color: '#64748B' }}>Nenhum figurino encontrado.</div>
            )}
          </div>
        </>
      ) : (
        <div className="rentals-section">
          <h3 className="section-title">{isAdmin ? 'Alugueres Ativos' : 'Os Meus Alugueres'}</h3>
          <div className="rentals-list">
            {visibleRentals.map((rental) => (
              <RentalItem
                key={rental.id}
                rental={rental}
                onReturn={isAdmin ? handleReturnRental : undefined}
                onViewDetails={handleOpenRentalDetails}
              />
            ))}
            {visibleRentals.length === 0 && (
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
        ownerType={editingCostume?.ownerType || (isStudent ? 'user' : 'school')}
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

      {selectedRental && (
        <div className="rental-details-overlay" onClick={handleCloseRentalDetails}>
          <div className="rental-details-card" onClick={(e) => e.stopPropagation()}>
            <div className="rental-details-header">
              <div>
                <h3 className="rental-details-title">Detalhes do figurino</h3>
                <p className="rental-details-subtitle">{selectedRental.costumeName}</p>
              </div>
              <button className="rental-details-close" onClick={handleCloseRentalDetails}>
                &times;
              </button>
            </div>

            <div className="rental-details-grid">
              <div className="rental-details-field">
                <span className="rental-details-label">Aluno</span>
                <span className="rental-details-value">
                  {selectedRental.studentName}
                  {selectedRental.studentNumber ? ` (${selectedRental.studentNumber})` : ''}
                </span>
              </div>
              <div className="rental-details-field">
                <span className="rental-details-label">Estado</span>
                <span className="rental-details-value">{selectedRental.status}</span>
              </div>
              <div className="rental-details-field">
                <span className="rental-details-label">Data de início</span>
                <span className="rental-details-value">{selectedRental.startDate || '-'}</span>
              </div>
              <div className="rental-details-field">
                <span className="rental-details-label">Data prevista</span>
                <span className="rental-details-value">{selectedRental.endDate || '-'}</span>
              </div>
              <div className="rental-details-field">
                <span className="rental-details-label">Data entregue</span>
                <span className="rental-details-value">
                  {selectedRental.actualReturnDate || 'Ainda não entregue'}
                </span>
              </div>
              <div className="rental-details-field">
                <span className="rental-details-label">Preço</span>
                <span className="rental-details-value">€ {Number(selectedRental.price || 0).toFixed(2)}</span>
              </div>
              <div className="rental-details-field">
                <span className="rental-details-label">Categoria</span>
                <span className="rental-details-value">{selectedRental.category}</span>
              </div>
              <div className="rental-details-field">
                <span className="rental-details-label">Tamanho</span>
                <span className="rental-details-value">{selectedRental.size}</span>
              </div>
              <div className="rental-details-field">
                <span className="rental-details-label">Cor</span>
                <span className="rental-details-value">{selectedRental.color}</span>
              </div>
              <div className="rental-details-field">
                <span className="rental-details-label">Condição</span>
                <span className="rental-details-value">{selectedRental.condition}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCostumeInfo && (
        <div className="rental-details-overlay" onClick={handleCloseCostumeInfo}>
          <div className="rental-details-card" onClick={(e) => e.stopPropagation()}>
            <div className="rental-details-header">
              <div>
                <h3 className="rental-details-title">Informações do figurino</h3>
                <p className="rental-details-subtitle">{selectedCostumeInfo.title}</p>
              </div>
              <button className="rental-details-close" onClick={handleCloseCostumeInfo}>
                &times;
              </button>
            </div>

            <div className="rental-details-grid">
              <div className="rental-details-field">
                <span className="rental-details-label">Aluno vendedor</span>
                <span className="rental-details-value">
                  {selectedCostumeInfo.sellerName}
                  {selectedCostumeInfo.sellerStudentNumber
                    ? ` (${selectedCostumeInfo.sellerStudentNumber})`
                    : ''}
                </span>
              </div>
              <div className="rental-details-field">
                <span className="rental-details-label">Estado</span>
                <span className="rental-details-value">{selectedCostumeInfo.status}</span>
              </div>
              <div className="rental-details-field">
                <span className="rental-details-label">Categoria</span>
                <span className="rental-details-value">{selectedCostumeInfo.category}</span>
              </div>
              <div className="rental-details-field">
                <span className="rental-details-label">Tamanho</span>
                <span className="rental-details-value">{selectedCostumeInfo.size}</span>
              </div>
              <div className="rental-details-field">
                <span className="rental-details-label">Cor</span>
                <span className="rental-details-value">{selectedCostumeInfo.color}</span>
              </div>
              <div className="rental-details-field">
                <span className="rental-details-label">Condição</span>
                <span className="rental-details-value">{selectedCostumeInfo.condition}</span>
              </div>
            </div>

            <div className="seller-contact-section">
              <h4 className="seller-contact-title">Contactos</h4>
              <div className="seller-contact-list">
                {selectedCostumeInfo.sellerContacts?.length > 0 ? (
                  selectedCostumeInfo.sellerContacts.map((contact) => (
                    <div className="seller-contact-item" key={contact.id}>
                      <span className="seller-contact-type">
                        {contact.type}{contact.isMain ? ' · principal' : ''}
                      </span>
                      <span className="seller-contact-value">{contact.value}</span>
                    </div>
                  ))
                ) : (
                  <div className="seller-contact-empty">Sem contactos disponíveis.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostumesPage;
