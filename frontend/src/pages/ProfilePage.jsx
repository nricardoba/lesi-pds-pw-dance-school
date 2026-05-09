import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getMyProfile, updateMyProfile } from '../services/users';
import '../pagesCss/ProfilePage.css';

const toInputDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const ProfilePage = () => {
  const { token, user, role, updateStoredUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    userName: '',
    userBirthDate: '',
    userStartDate: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!token) return;
        const profile = await getMyProfile(token);
        setForm({
          userName: profile?.userName || profile?.user_name || '',
          userBirthDate: toInputDate(profile?.userBirthDate || profile?.user_birth_date),
          userStartDate: toInputDate(profile?.userStartDate || profile?.user_start_date),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível carregar o perfil.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const updatedProfile = await updateMyProfile(
        {
          userName: form.userName,
          userBirthDate: form.userBirthDate || null,
          userStartDate: form.userStartDate || null,
        },
        token,
      );

      updateStoredUser({
        ...user,
        user_name: updatedProfile?.userName || form.userName,
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível guardar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-page"><div className="profile-card">A carregar perfil...</div></div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-card__header">
          <div>
            <h1>Meu Perfil</h1>
            <p>Atualiza os teus dados pessoais e volta ao painel.</p>
          </div>
          <button type="button" className="profile-back-btn" onClick={() => navigate(-1)}>
            Voltar
          </button>
        </div>

        <div className="profile-summary">
          <div className="profile-summary__item">
            <span>Nome</span>
            <strong>{user?.user_name || 'Utilizador'}</strong>
          </div>
          <div className="profile-summary__item">
            <span>Perfil</span>
            <strong>{role || 'sem perfil'}</strong>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <label>
            Nome
            <input name="userName" value={form.userName} onChange={handleChange} required />
          </label>

          <label>
            Data de nascimento
            <input name="userBirthDate" type="date" value={form.userBirthDate} onChange={handleChange} />
          </label>

          <label>
            Contacto
            <input name="userContact" value={form.userContact} onChange={handleChange} />
          </label>
          <label>
            Telefone
            <input name="userPhone" value={form.userPhone} onChange={handleChange} />
          </label>

           <label>
            Data de entrada
            <input name="userStartDate" type="date" value={form.userStartDate} onChange={handleChange} />
          </label>


          {error && <p className="profile-error">{error}</p>}

          <div className="profile-form__actions">
            <button type="button" className="profile-secondary-btn" onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button type="submit" className="profile-primary-btn" disabled={saving}>
              {saving ? 'A guardar...' : 'Guardar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;