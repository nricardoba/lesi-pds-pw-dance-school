import React, { useEffect, useState } from 'react';
import { deleteSchoolYear, getSchoolYears } from '../../services/schoolYears';
import DeleteConfirmModal from '../deleteConfirmModal/DeleteConfirmModal';
import SchoolYearCreation from './SchoolYearCreation';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-PT');
};

const SchoolYearsManagement = ({ token }) => {
  const [schoolYears, setSchoolYears] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [schoolYearToDelete, setSchoolYearToDelete] = useState(null);

  const loadSchoolYears = async () => {
    if (!token) return;

    setIsLoading(true);
    setError('');

    try {
      const years = await getSchoolYears(token);
      setSchoolYears(Array.isArray(years) ? years : []);
    } catch (fetchError) {
      console.error('Erro ao carregar anos letivos:', fetchError);
      setError('Não foi possível carregar os anos letivos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchoolYears();
  }, [token]);

  const handleCreated = async () => {
    await loadSchoolYears();
  };

  const handleDelete = async (schoolYear) => {
    setSchoolYearToDelete(schoolYear);
  };

  const confirmDelete = async () => {
    if (!token || !schoolYearToDelete) {
      setSchoolYearToDelete(null);
      return;
    }

    setDeletingId(schoolYearToDelete.schoolYearId);

    try {
      await deleteSchoolYear(token, schoolYearToDelete.schoolYearId);
      await loadSchoolYears();
    } catch (deleteError) {
      console.error('Erro ao apagar ano letivo:', deleteError);
    } finally {
      setDeletingId(null);
      setSchoolYearToDelete(null);
    }
  };

  return (
    <section className="school-years-management-card">
      <div className="school-years-management-header">
        <div>
          <h2 className="school-years-management-title">Gestão de anos letivos</h2>
          <p className="school-years-management-subtitle">Criar, consultar e remover anos letivos.</p>
        </div>

        <button type="button" className="btn-submit" onClick={loadSchoolYears} disabled={isLoading}>
          {isLoading ? 'A atualizar...' : 'Atualizar lista'}
        </button>
      </div>

      <SchoolYearCreation token={token} onCreated={handleCreated} existingSchoolYears={schoolYears} />

      <div className="school-years-list-card">
        <div className="school-years-list-header">
          <span>Nome</span>
          <span>Início</span>
          <span>Fim</span>
          <span>Ações</span>
        </div>

        {error && <div className="school-years-empty school-years-error">{error}</div>}

        {!error && isLoading && <div className="school-years-empty">A carregar anos letivos...</div>}

        {!error && !isLoading && schoolYears.length === 0 && (
          <div className="school-years-empty">Ainda não existem anos letivos criados.</div>
        )}

        {!error && !isLoading && schoolYears.map((schoolYear) => (
          <div key={schoolYear.schoolYearId} className="school-year-row">
            <div className="school-year-main">
              <strong>{schoolYear.schoolYearName}</strong>
            </div>
            <div className="school-year-date">{formatDate(schoolYear.schoolYearStart)}</div>
            <div className="school-year-date">{formatDate(schoolYear.schoolYearEnd)}</div>
            <div className="school-year-actions">
              <button
                type="button"
                className="school-year-delete-btn"
                onClick={() => handleDelete(schoolYear)}
                disabled={deletingId === schoolYear.schoolYearId}
              >
                {deletingId === schoolYear.schoolYearId ? 'A apagar...' : 'Apagar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmModal
        isOpen={Boolean(schoolYearToDelete)}
        title="Eliminar ano letivo"
        message="Tens a certeza que queres eliminar"
        itemName={schoolYearToDelete?.schoolYearName || ''}
        onCancel={() => setSchoolYearToDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
};

export default SchoolYearsManagement;