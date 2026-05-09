import { useEffect, useMemo, useState } from 'react';
import './RentalModal.css';

const RentalModal = ({ isOpen, onClose, costume, onSave, students = [] }) => {
  const [studentNumberInput, setStudentNumberInput] = useState('');

  const normalizedStudents = useMemo(
    () =>
      students.map((std) => ({
        id: std.userId || std.id,
        name: std.userName || std.name,
        studentNumber: std.studentNumber?.studentNumber || std.student_number || std.studentNumber || '',
      })),
    [students],
  );

  const filteredStudents = useMemo(() => {
    const query = studentNumberInput.trim().toLowerCase();

    if (!query) {
      return normalizedStudents;
    }

    return normalizedStudents.filter((std) => std.studentNumber.toLowerCase().includes(query));
  }, [normalizedStudents, studentNumberInput]);

  const selectedStudent = useMemo(
    () =>
      normalizedStudents.find(
        (std) => std.studentNumber.trim().toLowerCase() === studentNumberInput.trim().toLowerCase(),
      ),
    [normalizedStudents, studentNumberInput],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setStudentNumberInput('');
  }, [isOpen]);

  if (!isOpen || !costume) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    if (!selectedStudent) {
      alert('Seleciona um aluno válido pelo número de aluno.');
      return;
    }

    const studentId = parseInt(selectedStudent.id, 10);

    const rentalData = {
      // Backend ignorara estes, mas mantemos caso precisemos no frontend
      costumeName: costume.title,
      studentId: studentId,
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
            <label>Número de Aluno</label>
            <input
              name="studentNumber"
              type="search"
              list="student-number-options"
              value={studentNumberInput}
              onChange={(e) => setStudentNumberInput(e.target.value)}
              placeholder="Pesquisar e selecionar número de aluno"
              required
            />
            <datalist id="student-number-options">
              {filteredStudents.map((std) => (
                <option key={std.id} value={std.studentNumber || ''} />
              ))}
            </datalist>
            {selectedStudent && (
              <p className="selected-student-name">Nome: {selectedStudent.name}</p>
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