import React, { useState, useEffect } from 'react';
import '../coachingModal/CoachingModal.css'; // Reusing some base styles
import { readExtraFeesFromStorage, writeExtraFeesToStorage } from '../../utils/scheduleStorage';

const ExtraFeeModal = ({ isOpen, onClose }) => {
  const [fees, setFees] = useState([]);
  const [teacher, setTeacher] = useState('');
  const [reason, setReason] = useState('');
  const [cost, setCost] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFees(readExtraFeesFromStorage());
    }
  }, [isOpen]);

  const handleAddFee = (e) => {
    e.preventDefault();
    if (!teacher || !reason || !cost) return;
    
    const newFee = { id: Date.now(), teacher, reason, cost: parseFloat(cost) };
    const updated = [...fees, newFee];
    setFees(updated);
    writeExtraFeesToStorage(updated);
    
    setTeacher('');
    setReason('');
    setCost('');
  };

  const handleRemove = (id) => {
    const updated = fees.filter(f => f.id !== id);
    setFees(updated);
    writeExtraFeesToStorage(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Gerir Motivos de Taxa Extra (Deslocação)</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>

        <form onSubmit={handleAddFee} style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem' }}>Professor</label>
            <select value={teacher} onChange={e => setTeacher(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="" disabled>Selecionar</option>
              <option value="Sofia Martins">Sofia Martins</option>
              <option value="Ricardo Santos">Ricardo Santos</option>
              <option value="Ana Ferreira">Ana Ferreira</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem' }}>Motivo da Deslocação</label>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)} required placeholder="Ex: Deslocação intercidades" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem' }}>Custo Extra (€)</label>
            <input type="number" step="0.01" value={cost} onChange={e => setCost(e.target.value)} required placeholder="Ex: 15" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <button type="submit" style={{ padding: '8px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '8px' }}>Adicionar Taxa</button>
        </form>

        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Taxas Atuais</h3>
          {fees.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: '#666' }}>Nenhuma taxa configurada.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {fees.map(fee => (
                <li key={fee.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #eee' }}>
                  <div>
                    <strong>{fee.teacher}</strong> - {fee.reason} ({fee.cost}€)
                  </div>
                  <button onClick={() => handleRemove(fee.id)} style={{ padding: '4px 8px', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Remover</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtraFeeModal;