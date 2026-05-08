import React, { useState, useEffect } from 'react';
import '../pagesCss/ModalitiesPage.css'; 
import ModalityModal from '../components/modalityModal/ModalityModal';
import { useAuth } from '../context/useAuth';
import { getModalities, createModality, updateModality, deleteModality } from '../services/modalities';

const ModalitiesPage = () => {
  const { token, user } = useAuth();
  const isAdmin = user?.user_type_desc?.toLowerCase() === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModality, setEditingModality] = useState(null);
  const [modalityToDelete, setModalityToDelete] = useState(null);
  const [modalities, setModalities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchModalities = async () => {
    try {
      setIsLoading(true);
      const data = await getModalities(token);
      setModalities(data);
    } catch (error) {
      console.error('Erro ao carregar modalidades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchModalities();
  }, [token]);

  const filteredModalities = modalities.filter(mod => 
    (mod.modalityName || mod.modality_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenNew = () => {
    setEditingModality(null);
    setIsModalOpen(true);
  };

  const handleEdit = (modality) => {
    setEditingModality(modality);
    setIsModalOpen(true);
  };

  const handleAskDelete = (modality) => {
    setModalityToDelete(modality);
  };

  const handleCancelDelete = () => {
    setModalityToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!isAdmin || !modalityToDelete) return;
    try {
      await deleteModality(modalityToDelete.modalityId || modalityToDelete.modality_id, token);
      await fetchModalities();
      setModalityToDelete(null);
    } catch (error) {
      console.error('Erro ao eliminar modalidade:', error);
      alert('Não foi possível eliminar a modalidade.');
    }
  };

  const handleSave = async (modalityData) => {
    try {
      const payload = {
         modalityName: modalityData.modality_name,
         modalityHourlyFee: modalityData.modality_hourly_fee,
      };

      if (editingModality) {
        await updateModality(editingModality.modalityId || editingModality.modality_id, payload, token);
      } else {
        await createModality(payload, token);
      }
      
      await fetchModalities();
      setIsModalOpen(false);
    } catch(err) {
      console.error('Erro a guardar modalidade:', err);
      alert('Não foi possível guardar a modalidade.');
    }
  };

  return (
    <div className="modalities-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Modalidades</h1>
          <p className="page-subtitle">Gestão de estilos de dança e honorários</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={handleOpenNew}>
            + Nova Modalidade
          </button>
        )}
      </header>

      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input 
          type="search" 
          placeholder="Pesquisar modalidades..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>A carregar...</div>
      ) : (
      <div className="table-container">
        <div className="table-header">
          <div className="th-col">NOME DA MODALIDADE</div>
          <div className="th-col">PREÇO / HORA</div>
          <div className="th-col text-right">AÇÕES</div>
        </div>

        <div className="table-body">
          {filteredModalities.map((modality) => (
            <div key={modality.modalityId || modality.modality_id} className="table-row">
              <div className="td-col">
                <span className="modality-name">{modality.modalityName || modality.modality_name}</span>
              </div>
              <div className="td-col">
                <span className="modality-price">€ {Number(modality.modalityHourlyFee || modality.modality_hourly_fee || 0).toFixed(2)}</span>
              </div>
              <div className="td-col col-actions">
                {isAdmin && (
                  <>
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => handleEdit(modality)} 
                      title="Editar"
                    >
                      ✎
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleAskDelete(modality)} 
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {filteredModalities.length === 0 && (
            <div className="empty-results">Nenhuma modalidade encontrada.</div>
          )}
        </div>
      </div>
      )}

      <ModalityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingModality} 
        onSave={handleSave} 
      />

      {modalityToDelete && (
        <div className="delete-confirm-overlay" onClick={handleCancelDelete}>
          <div className="delete-confirm-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-confirm-title">Remover modalidade</h3>
            <p className="delete-confirm-text">
              Tens a certeza que queres remover <strong>{modalityToDelete.modalityName || modalityToDelete.modality_name}</strong>?
            </p>
            <div className="delete-confirm-actions">
              <button type="button" className="delete-cancel-btn" onClick={handleCancelDelete}>
                Cancelar
              </button>
              <button type="button" className="delete-confirm-btn" onClick={handleConfirmDelete}>
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalitiesPage;
