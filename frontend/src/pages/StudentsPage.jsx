import React, { useState } from 'react';
import '../pagesCss/StudentsPage.css';
import StudentModal from '../components/StudentModal/StudentModal';

const StudentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Dados simulados baseados na tua imagem
  const [students, setStudents] = useState([
    { id: 1, name: 'Mariana Silva', email: 'mariana@email.com', phone: '921111111', guardianName: 'Helena Silva', guardianPhone: '961111111', birthdate: '2010-05-15', avatarColor: '#E0E7FF' },
    { id: 2, name: 'João Costa', email: 'joao@email.com', phone: '922222222', guardianName: 'Pedro Costa', guardianPhone: '962222222', birthdate: '2008-08-20', avatarColor: '#E0E7FF' },
    { id: 3, name: 'Beatriz Oliveira', email: 'beatriz@email.com', phone: '923333333', guardianName: 'Carla Oliveira', guardianPhone: '963333333', birthdate: '2012-01-10', avatarColor: '#E0E7FF' },
    { id: 4, name: 'Miguel Ferreira', email: 'miguel@email.com', phone: '924444444', guardianName: 'Ana Ferreira', guardianPhone: '964444444', birthdate: '2011-11-25', avatarColor: '#EDE9FE' },
    { id: 5, name: 'Sara Rodrigues', email: 'sara@email.com', phone: '925555555', guardianName: 'Rui Rodrigues', guardianPhone: '965555555', birthdate: '2009-03-30', avatarColor: '#E0E7FF' },
    { id: 6, name: 'Tiago Almeida', email: 'tiago@email.com', phone: '926666666', guardianName: 'Marta Almeida', guardianPhone: '966666666', birthdate: '2013-07-12', avatarColor: '#EDE9FE' },
  ]);

  // Função para extrair as iniciais (ex: "Mariana Silva" -> "MS")
  const getInitials = (name) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Filtrar alunos pela pesquisa
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenNewStudent = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleSaveStudent = (studentData) => {
    if (editingStudent) {
      setStudents(students.map(s => s.id === studentData.id ? studentData : s));
    } else {
      setStudents([...students, studentData]);
    }
  };

  const handleAskDeleteStudent = (student) => {
    setStudentToDelete(student);
  };

  const handleCancelDeleteStudent = () => {
    setStudentToDelete(null);
  };

  const handleConfirmDeleteStudent = () => {
    if (!studentToDelete) {
      return;
    }

    setStudents(students.filter((student) => student.id !== studentToDelete.id));
    setStudentToDelete(null);
  };

  const getContactValue = (student, type) => {
    if (type === 'email') {
      return student.email || student.contacts?.find((c) => c.type === 'email')?.value || '-';
    }

    return student.phone || student.contacts?.find((c) => c.type === 'phone')?.value || '-';
  };

  return (
    <div className="students-page">
      {/* Cabeçalho */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Alunos</h1>
          <p className="page-subtitle">{students.length} alunos registados</p>
        </div>
        <button className="btn-primary" onClick={handleOpenNewStudent}>
          + Novo Aluno
        </button>
      </header>

      {/* Barra de Pesquisa */}
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input 
          type="search" 
          placeholder="Pesquisar alunos..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabela de Alunos */}
      <div className="table-container">
        {/* Cabeçalho da Tabela */}
        <div className="table-header">
          <div className="th-col">ALUNO</div>
          <div className="th-col">CONTACTO</div>
          <div className="th-col">ENCARREGADO</div>
          <div className="th-col text-right">AÇÕES</div>
        </div>

        {/* Corpo da Tabela */}
        <div className="table-body">
          {filteredStudents.map((student) => (
            <div key={student.id} className="table-row">
              
              {/* Coluna 1: Aluno (Avatar de Iniciais + Nome) */}
              <div className="td-col col-student">
                <div 
                  className="student-avatar" 
                  style={{ backgroundColor: student.avatarColor }}
                >
                  {getInitials(student.name)}
                </div>
                <span className="student-name">{student.name}</span>
              </div>

              {/* Coluna 2: Contacto */}
              <div className="td-col col-contact">
                <div className="info-item">
                  <span className="info-icon">✉️</span> {getContactValue(student, 'email')}
                </div>
                <div className="info-item">
                  <span className="info-icon">📞</span> {getContactValue(student, 'phone')}
                </div>
              </div>

              {/* Coluna 3: Encarregado */}
              <div className="td-col col-guardian">
                <div className="info-item">
                  <span className="info-icon">👤</span> {student.guardianName}
                </div>
                <div className="info-item text-muted">
                  {student.guardianPhone}
                </div>
              </div>

           

              {/* Coluna 5: Ações */}
              <div className="td-col col-actions">
                <button 
                  className="action-btn edit-btn" 
                  title="Editar"
                  onClick={() => handleEditStudent(student)}
                >
                  ✎
                </button>
                <button
                  className="action-btn delete-btn"
                  title="Eliminar"
                  onClick={() => handleAskDeleteStudent(student)}
                >
                  🗑️
                </button>
              </div>

            </div>
          ))}
          
          {filteredStudents.length === 0 && (
            <div className="empty-results">Nenhum aluno encontrado.</div>
          )}
        </div>
      </div>
      <StudentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingStudent} 
        onSave={handleSaveStudent} 
      />

      {studentToDelete && (
        <div className="delete-confirm-overlay" onClick={handleCancelDeleteStudent}>
          <div className="delete-confirm-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-confirm-title">Remover aluno</h3>
            <p className="delete-confirm-text">
              Tens a certeza que queres remover <strong>{studentToDelete.name}</strong>?
            </p>
            <div className="delete-confirm-actions">
              <button type="button" className="delete-cancel-btn" onClick={handleCancelDeleteStudent}>
                Cancelar
              </button>
              <button type="button" className="delete-confirm-btn" onClick={handleConfirmDeleteStudent}>
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;