import { useEffect, useMemo, useState } from 'react';
import './RentalModal.css';

const RentalModal = ({ isOpen, onClose, costume, onSave, users = [], searchByEmail = false, allowTeacherSelection = false }) => {
  const [userInput, setUserInput] = useState('');

  const normalizedUsers = useMemo(
    () =>
      users.map((user) => ({
        id: user.userId || user.id,
        name: user.userName || user.name,
        email:
          user.userContact?.find((contactLink) => {
            const contactType = contactLink.contact?.contactType?.contactTypeDesc?.toLowerCase();
            return contactType === 'email';
          })?.contact?.contactValue || user.email || '',
        studentNumber: user.studentNumber?.studentNumber || user.student_number || user.studentNumber || '',
        role: user.userType?.userTypeDesc?.toLowerCase() || user.role || '',
      })),
    [users],
  );

  const selectableUsers = useMemo(() => {
    return normalizedUsers.filter((user) => {
      if (!allowTeacherSelection) {
        return user.role === 'student' || user.role === 'aluno';
      }

      return user.role === 'student' || user.role === 'aluno' || user.role === 'teacher' || user.role === 'professor';
    });
  }, [allowTeacherSelection, normalizedUsers]);

  const filteredUsers = useMemo(() => {
    const query = userInput.trim().toLowerCase();

    if (!query) {
      return selectableUsers;
    }

    if (searchByEmail) {
      return selectableUsers.filter((user) => user.email.toLowerCase().includes(query));
    }

    return selectableUsers.filter((user) => {
      const searchableValues = [user.email, user.studentNumber, user.name]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      return searchableValues.some((value) => value.includes(query));
    });
  }, [selectableUsers, userInput]);

  const selectedUser = useMemo(
    () =>
      selectableUsers.find((user) => {
        if (searchByEmail) {
          return user.email.trim().toLowerCase() === userInput.trim().toLowerCase();
        }

        return user.studentNumber.trim().toLowerCase() === userInput.trim().toLowerCase();
      }),
    [selectableUsers, searchByEmail, userInput],
  );

  const inputLabel = searchByEmail ? 'Email' : 'Número de Aluno';
  const inputPlaceholder = searchByEmail
    ? 'Pesquisar e selecionar email'
    : 'Pesquisar e selecionar número de aluno';
  const inputListId = searchByEmail ? 'user-email-options' : 'user-number-options';

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setUserInput('');
  }, [isOpen]);

  if (!isOpen || !costume) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    if (!selectedUser) {
      alert(searchByEmail ? 'Seleciona um utilizador válido pelo email.' : 'Seleciona um utilizador válido pelo número de aluno.');
      return;
    }

    const userId = parseInt(selectedUser.id, 10);

    const rentalData = {
      // Backend ignorara estes, mas mantemos caso precisemos no frontend
      costumeName: costume.title,
      studentId: userId,
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
    };

    onSave(rentalData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalClick}>
        
        <div className="modal-header">
          <h2 className="modal-title">Novo Aluguer</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          
          <div className="form-group full-width">
            <label>{inputLabel}</label>
            <input
              name={searchByEmail ? 'email' : 'studentNumber'}
              type="search"
              list={inputListId}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={inputPlaceholder}
              required
            />
            <datalist id={inputListId}>
              {filteredUsers.map((user) => (
                <option key={user.id} value={searchByEmail ? user.email || '' : user.studentNumber || ''} />
              ))}
            </datalist>
            {selectedUser && (
              <p className="selected-student-name">Nome: {selectedUser.name}</p>
            )}
          </div>

          <div className="form-grid-2 mt-16">
            <div className="form-group">
              <label>Data Início</label>
              {/* O defaultValue aqui seria hoje num cenário real, mas na foto está dia 16/04/2026 */}
              <input name="startDate" type="date" defaultValue="2026-04-16" required />
            </div>
            <div className="form-group">
              <label>Data Fim</label>
              <input name="endDate" type="date" required />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-submit">Criar Aluguer</button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default RentalModal;