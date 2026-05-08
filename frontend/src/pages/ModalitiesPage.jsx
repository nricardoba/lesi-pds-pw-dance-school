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

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (window.confirm("Tem a certeza que deseja eliminar esta modalidade?")) {
      try {
        await deleteModality(id, token);
        await fetchModalities();
      } catch (error) {
        console.error('Erro ao eliminar modalidade:', error);
        alert('Não foi possível eliminar a modalidade.');
      }
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
    <div className="modalities-page" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: '24px', color: '#0F172A' }}>Modalidades</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0', color: '#64748B' }}>Gestão de estilos de dança e honorários</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={handleOpenNew} style={{ backgroundColor: '#176B87', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
            + Nova Modalidade
          </button>
        )}
      </header>

      
      <div className="table-container">
        <div className="table-header">
          <div>NOME DA MODALIDADE</div>
          <div>PREÇO / HORA</div>
          <div className="text-right">AÇÕES</div>
        </div>

        <div className="table-body">
          {isLoading ? (
             <div style={{ padding: '16px', textAlign: 'center' }}>A carregar...</div>
          ) : (
            filteredModalities.map((modality) => (
              <div key={modality.modalityId || modality.modality_id} className="table-row">
                <div className="modality-name">{modality.modalityName || modality.modality_name}</div>
                <div className="modality-price">€ {Number(modality.modalityHourlyFee || modality.modality_hourly_fee || 0).toFixed(2)}</div>
                <div className="table-actions">
                  {isAdmin && (
                    <>
                      <button className="action-btn edit-btn" onClick={() => handleEdit(modality)} title="Editar">✏</button>
                      <button className="action-btn delete-btn" onClick={() => handleDelete(modality.modalityId || modality.modality_id)} title="Eliminar">🗑</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ModalityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingModality} 
        onSave={handleSave} 
      />
    </div>
  );
};

export default ModalitiesPage;
