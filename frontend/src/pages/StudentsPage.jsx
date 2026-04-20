import React, { useState, useEffect } from 'react';
import '../pagesCss/StudentsPage.css';
import StudentModal from '../components/studentModal/StudentModal';
import { getUsers, updateUser } from '../services/users';
import { useAuth } from '../context/useAuth';

const StudentsPage = () => {
  const { token, user } = useAuth();
  const isAdmin = user?.user_type_desc === 'Admin';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      // Chama a listagem de utilizadores do backend
      const data = await getUsers(token);
      
      // Filtra apenas os alunos (assume que o Backend usa 'Student' ou 'Aluno' no userTypeDesc)
      const studentsOnly = data.filter(u => 
        u.userType?.userTypeDesc?.toLowerCase() === 'student' || 
        u.userType?.userTypeDesc?.toLowerCase() === 'aluno'
      );
      
      // Mapeamento para o formato do Frontend
      const formattedStudents = studentsOnly.map(u => {
        // Encontrar emails e telemóveis nos contactos do utilizador
        const emailContact = u.userContact?.find(
          c => c.contact?.contactType?.contactTypeDesc?.toLowerCase() === 'email'
        );
        const phoneContact = u.userContact?.find(
          c => c.contact?.contactType?.contactTypeDesc?.toLowerCase() === 'telemóvel' || 
               c.contact?.contactType?.contactTypeDesc?.toLowerCase() === 'phone'
        );

        return {
          id: u.userId,
          name: u.userName,
          email: emailContact?.contact?.contactValue || '',
          phone: phoneContact?.contact?.contactValue || '',
          guardianName: '-',  // Será implementado futuramente
          guardianPhone: '-', // Será implementado futuramente
          birthdate: u.userBirthDate ? u.userBirthDate.split('T')[0] : '', // Formatar para YYYY-MM-DD
          avatarColor: '#E0E7FF' // Podes gerar dinamicamente se quiseres
        };
      });

      setStudents(formattedStudents);
    } catch (error) {
      console.error('Erro a carregar alunos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega os alunos ao abrir a página
  useEffect(() => {
    if (token) fetchStudents();
  }, [token]);

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

  const handleSaveStudent = async (studentData) => {
    // Quando guardamos (Criar/Editar) no Modal, recarregamos a lista da BD
    await fetchStudents();
  };

  const handleAskDeleteStudent = (student) => {
    setStudentToDelete(student);
  };

  const handleCancelDeleteStudent = () => {
    setStudentToDelete(null);
  };

  const handleConfirmDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      // Exemplo de delete no backend (caso implementes o DELETE /users/:id)
      // await apiClient(`/users/${studentToDelete.id}`, { method: 'DELETE', token });
      
      // Ou alternativamente apenas meter inativo (soft delete) usando PUT /users/:id
      await updateUser(studentToDelete.id, { userIsActive: false }, token);

      setStudentToDelete(null);
      await fetchStudents(); // Re-fetch
    } catch (error) {
      console.error('Erro a remover aluno:', error);
    }
  };

  const getContactValue = (student, type) => {
    if (type === 'email') return student.email || '-';
    return student.phone || '-';
  };

  return (
    <div className="students-page">
      {/* Cabeçalho */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Alunos</h1>
          <p className="page-subtitle">{students.length} alunos registados</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={handleOpenNewStudent}>
            + Novo Aluno
          </button>
        )}
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

      {isLoading ? (
         <div style={{ textAlign: 'center', marginTop: '2rem' }}>A carregar alunos...</div>
      ) : (
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
                {isAdmin && (
                  <>
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
                  </>
                )}
              </div>

            </div>
          ))}
          
          {filteredStudents.length === 0 && (
            <div className="empty-results">Nenhum aluno encontrado.</div>
          )}
        </div>
      </div>
      )}
      <StudentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingStudent} 
        onSave={handleSaveStudent} 
        token={token}
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