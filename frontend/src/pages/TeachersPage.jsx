import React, { useState, useEffect } from 'react';
import TeacherModal from '../components/teacherModal/TeacherModal';
import '../pagesCss/TeachersPage.css';
import { getUsers, updateUser } from '../services/users';
import { useAuth } from '../context/useAuth';

const TeachersPage = () => {
  const { token, user } = useAuth();
  const isAdmin = user?.user_type_desc === 'Admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers(token);

      const teachersOnly = data.filter(u =>
        u.userType?.userTypeDesc?.toLowerCase() === 'teacher' ||
        u.userType?.userTypeDesc?.toLowerCase() === 'professor' ||
        u.userType?.userTypeDesc?.toLowerCase() === 'professora'
      );

      const formattedTeachers = teachersOnly.map(u => {
        const emailContact = u.userContact?.find(
          c => c.contact?.contactType?.contactTypeDesc?.toLowerCase() === 'email'
        );
        const phoneContact = u.userContact?.find(
          c => c.contact?.contactType?.contactTypeDesc?.toLowerCase() === 'telemóvel' ||
            c.contact?.contactType?.contactTypeDesc?.toLowerCase() === 'phone'
        );

        return {
          user_id: u.userId,
          name: u.userName,
          bio: 'Sem biografia disponível', // Pode vir de outro campo no futuro
          email: emailContact?.contact?.contactValue || '',
          phone: phoneContact?.contact?.contactValue || '',
          specialties: [], // Ainda a implementar a lógica de especialidades ou ler das qualificações
          classesCount: 0,
          isActive: u.userIsActive,
          avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(u.userName) + '&background=random'
        };
      });

      const activeTeachers = formattedTeachers.filter(u => u.isActive !== false);
      setTeachers(activeTeachers);
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenNewTeacher = () => {
    setEditingTeacher(null);
    setIsModalOpen(true);
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleSaveTeacher = (teacherData) => {
    fetchTeachers(); // Recarrega a lista
    setIsModalOpen(false);
  };

  const handleAskDeleteTeacher = (teacher) => {
    setTeacherToDelete(teacher);
  };

  const handleCancelDeleteTeacher = () => {
    setTeacherToDelete(null);
  };

  const handleConfirmDeleteTeacher = async () => {
    if (!teacherToDelete) return;

    try {
      // Soft delete no backend
      await updateUser(teacherToDelete.user_id, { userIsActive: false }, token);

      setTeacherToDelete(null);
      await fetchTeachers();
    } catch (error) {
      console.error('Erro ao remover professor:', error);
    }
  };

  return (
    <div className="teachers-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Professores</h1>
          <p className="page-subtitle">{teachers.length} professores registados</p>
        </div>
        {isAdmin && (
        <button className="btn-primary" onClick={handleOpenNewTeacher}>
          + Novo Professor
        </button>
        )}
      </header>

      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          type="search"
          placeholder="Pesquisar professores..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        {/* CABEÇALHO: 3 Colunas */}
        <div className="table-header">
          <div className="th-col col-left">
            <span>PROFESSOR</span>
          </div>
          <div className="th-col col-center">
            <span>CONTACTO</span>
          </div>
          <div className="th-col col-right">
            <span>ESPECIALIDADES</span>
          </div>
          {isAdmin && (
          <div className="th-col col-actions">
            <span>AÇÕES</span>
          </div>
          )}
        </div>

        {/* CORPO DA TABELA */}
        <div className="table-body">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.user_id} className="table-row">

              {/* Coluna 1: Info (Topo) e Aulas (Fundo) */}
              <div className="td-col col-professor">
                <div className="prof-top">
                  <img src={teacher.avatar} alt={teacher.name} className="prof-avatar" />
                  <div className="prof-details">
                    <span className="prof-name">{teacher.name}</span>
                    <span className="prof-bio">{teacher.bio}</span>
                  </div>
                </div>

              </div>

              {/* Coluna 2: Contactos (Apenas Topo) */}
              <div className="td-col col-contact">
                <div className="contact-item">
                  <span className="icon" style={{ opacity: 0.5 }}>✉️</span> {teacher.email}
                </div>
                <div className="contact-item">
                  <span className="icon" style={{ color: '#db2777', opacity: 0.8 }}>📞</span> {teacher.phone}
                </div>
              </div>

              {/* Coluna 3: Especialidades */}
              <div className="td-col col-specialties">
                <div className="specialties-tags">
                  {teacher.specialties.map((spec, index) => (
                    <span key={index} className="tag">{spec}</span>
                  ))}
                </div>
              </div>

              {/* Coluna 4: Ações */}
              {isAdmin && (
              <div className="td-col col-actions">
                <div className="row-actions">
                  
                    <div className="row-actions">
                      <button className="action-btn edit-btn" onClick={() => handleEditTeacher(teacher)}>
                        ✎
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleAskDeleteTeacher(teacher)}>
                        🗑️
                      </button>
                    </div>
                 
                </div>
              </div>
               )}
            </div>
          ))}
          {filteredTeachers.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>Nenhum professor encontrado.</div>
          )}
        </div>
      </div>

      <TeacherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingTeacher}
        onSave={handleSaveTeacher}
        token={token}
      />

      {teacherToDelete && (
        <div className="delete-confirm-overlay" onClick={handleCancelDeleteTeacher}>
          <div className="delete-confirm-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-confirm-title">Remover professor</h3>
            <p className="delete-confirm-text">
              Tens a certeza que queres remover <strong>{teacherToDelete.name}</strong>?
            </p>
            <div className="delete-confirm-actions">
              <button type="button" className="delete-cancel-btn" onClick={handleCancelDeleteTeacher}>
                Cancelar
              </button>
              <button type="button" className="delete-confirm-btn" onClick={handleConfirmDeleteTeacher}>
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersPage;