import React, { useState } from 'react';
import TeacherModal from '../components/teacherModal/TeacherModal';
import '../pagesCss/TeachersPage.css';

const TeachersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [teacherToDelete, setTeacherToDelete] = useState(null);


  const [teachers, setTeachers] = useState([
    {
      user_id: 1,
      name: 'Sofia Martins',
      bio: '15 anos de experiência em ballet cl...',
      email: 'sofia@entartes.pt',
      phone: '912345678',
      specialties: ['Ballet', 'Contemporâneo'],
      classesCount: 0,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    },
    {
      user_id: 2,
      name: 'Ricardo Santos',
      bio: 'Campeão nacional de hip hop 2020',
      email: 'ricardo@entartes.pt',
      phone: '913456789',
      specialties: ['Hip Hop', 'Street Dance'],
      classesCount: 0,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    },
    {
      user_id: 3,
      name: 'Ana Ferreira',
      bio: 'Formação no Royal Ballet',
      email: 'ana@entartes.pt',
      phone: '914567890',
      specialties: ['Jazz', 'Dança Moderna'],
      classesCount: 0,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    }
  ]);

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
    if (editingTeacher) {
      setTeachers(teachers.map(t => t.user_id === teacherData.user_id ? teacherData : t));
    } else {
      setTeachers([...teachers, teacherData]);
    }
  };

  const handleAskDeleteTeacher = (teacher) => {
    setTeacherToDelete(teacher);
  };

  const handleCancelDeleteTeacher = () => {
    setTeacherToDelete(null);
  };

  const handleConfirmDeleteTeacher = () => {
    if (!teacherToDelete) {
      return;
    }

    setTeachers(teachers.filter((teacher) => teacher.user_id !== teacherToDelete.user_id));
    setTeacherToDelete(null);
  };

  return (
    <div className="teachers-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Professores</h1>
          <p className="page-subtitle">{teachers.length} professores registados</p>
        </div>
        <button className="btn-primary" onClick={handleOpenNewTeacher}>
          + Novo Professor
        </button>
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
          <div className="th-col col-actions">
            <span>AÇÕES</span>
          </div>
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
              <div className="td-col col-actions">
                <div className="row-actions">
                  <button className="action-btn edit-btn" onClick={() => handleEditTeacher(teacher)}>✎</button>
                  <button className="action-btn delete-btn" onClick={() => handleAskDeleteTeacher(teacher)}>🗑️</button>
                </div>
              </div>

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