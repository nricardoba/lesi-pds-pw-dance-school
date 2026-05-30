import React, { useState } from 'react';
import { createSchoolYear } from '../../services/schoolYears';
import SchoolYearNoticeModal from './SchoolYearNoticeModal';

const parseDate = (value) => new Date(`${value}T00:00:00`);

const findOverlappingSchoolYear = (schoolYears, schoolYearStart, schoolYearEnd) => {
  const startDate = parseDate(schoolYearStart);
  const endDate = parseDate(schoolYearEnd);

  return schoolYears.find((schoolYear) => {
    const existingStart = new Date(schoolYear.schoolYearStart);
    const existingEnd = new Date(schoolYear.schoolYearEnd);

    return startDate <= existingEnd && endDate >= existingStart;
  });
};

const SchoolYearCreation = ({ token, onCreated, existingSchoolYears = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [formData, setFormData] = useState({
    schoolYearName: '',
    schoolYearStart: '',
    schoolYearEnd: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      schoolYearName: '',
      schoolYearStart: '',
      schoolYearEnd: '',
    });
  };

  const showNotice = (title, message) => {
    setNotice({ title, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.schoolYearName.trim()) {
      showNotice('Dados em falta', 'Preencha o nome do ano letivo.');
      return;
    }

    if (!formData.schoolYearStart) {
      showNotice('Dados em falta', 'Preencha a data de início do ano letivo.');
      return;
    }

    if (!formData.schoolYearEnd) {
      showNotice('Dados em falta', 'Preencha a data de fim do ano letivo.');
      return;
    }

    if (parseDate(formData.schoolYearStart) > parseDate(formData.schoolYearEnd)) {
      showNotice('Datas inválidas', 'A data de início deve ser anterior à data de fim.');
      return;
    }

    const conflictingSchoolYear = findOverlappingSchoolYear(
      existingSchoolYears,
      formData.schoolYearStart,
      formData.schoolYearEnd,
    );

    if (conflictingSchoolYear) {
      showNotice(
        'Sobreposição de datas',
        `O intervalo selecionado coincide com o ano letivo "${conflictingSchoolYear.schoolYearName}".`,
      );
      return;
    }

    if (!token) {
      showNotice('Sessão indisponível', 'Não foi possível autenticar o pedido.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createSchoolYear(token, {
        schoolYearName: formData.schoolYearName.trim(),
        schoolYearStart: formData.schoolYearStart,
        schoolYearEnd: formData.schoolYearEnd,
      });

      resetForm();
      setIsOpen(false);

      if (onCreated) {
        onCreated(created);
      }
    } catch (error) {
      console.error('Erro ao criar ano letivo:', error);

      if (error?.message?.includes('coincide')) {
        showNotice('Sobreposição de datas', error.message);
        return;
      }

      showNotice('Erro ao criar ano letivo', error?.message || 'Erro ao criar ano letivo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsOpen(false);
  };

  return (
    <>
      <section style={{ margin: '20px 0', padding: '16px', border: '1px solid #d1d5db', borderRadius: '12px', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Criar ano letivo</h2>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.95rem' }}>Criar um novo período académico antes de abrir pedidos.</p>
          </div>
          <button type="button" className="btn-submit" onClick={() => setIsOpen((prev) => !prev)}>
            {isOpen ? 'Fechar' : 'Novo ano letivo'}
          </button>
        </div>

      </section>

      {isOpen && (
        <form onSubmit={handleSubmit} style={{ marginTop: '16px', display: 'grid', gap: '12px' }}>
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              name="schoolYearName"
              value={formData.schoolYearName}
              onChange={handleChange}
              placeholder="Ex.: 2026/2027"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div className="form-group">
              <label>Início</label>
              <input
                type="date"
                name="schoolYearStart"
                value={formData.schoolYearStart}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Fim</label>
              <input
                type="date"
                name="schoolYearEnd"
                value={formData.schoolYearEnd}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'A criar...' : 'Criar ano letivo'}
            </button>
          </div>
        </form>
      )}

      <SchoolYearNoticeModal
        isOpen={Boolean(notice)}
        title={notice?.title || ''}
        message={notice?.message || ''}
        onClose={() => setNotice(null)}
      />
    </>
  );
};

export default SchoolYearCreation;
