import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { ArrowLeft, User, Lock, Trash2 } from 'lucide-react';

interface AccountPageProps {
  onBack: () => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ onBack }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para editar perfil
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Estados para cambiar contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados para mostrar secciones
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authAPI.updateProfile({ username, email });
      setSuccess('Perfil actualizado correctamente');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      setSuccess('Contraseña cambiada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      return;
    }

    if (!window.confirm('Se eliminarán TODOS tus datos permanentemente. ¿Continuar?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authAPI.deleteAccount();
      alert('Cuenta eliminada correctamente');
      logout();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al eliminar la cuenta');
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={onBack}
            style={{ padding: '8px' }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1>Mi Cuenta</h1>
            <p style={{ color: '#666', marginTop: '5px' }}>
              Gestiona tu información personal
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '1px solid #c3e6cb'
          }}>
            {success}
          </div>
        )}

        {/* Información del perfil */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <User size={20} />
            Información Personal
          </h3>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label htmlFor="username">Nombre de Usuario</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Cambiar contraseña */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Lock size={20} />
            Seguridad
          </h3>

          {!showChangePassword ? (
            <button 
              className="btn btn-secondary"
              onClick={() => setShowChangePassword(true)}
            >
              Cambiar Contraseña
            </button>
          ) : (
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label htmlFor="currentPassword">Contraseña Actual</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Nueva Contraseña</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowChangePassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setError('');
                  }}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Eliminar cuenta */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #dc3545'
        }}>
          <h3 style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '20px',
            color: '#dc3545'
          }}>
            <Trash2 size={20} />
            Zona Peligrosa
          </h3>

          <p style={{ color: '#666', marginBottom: '15px' }}>
            Una vez que elimines tu cuenta, no hay vuelta atrás. Se eliminarán permanentemente 
            todas tus tareas y datos personales.
          </p>

          {!showDeleteAccount ? (
            <button 
              className="btn"
              style={{ backgroundColor: '#dc3545', color: 'white' }}
              onClick={() => setShowDeleteAccount(true)}
            >
              Eliminar Cuenta
            </button>
          ) : (
            <div>
              <p style={{ color: '#dc3545', fontWeight: 'bold', marginBottom: '15px' }}>
                ⚠️ Esta acción eliminará permanentemente tu cuenta y todos tus datos.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn"
                  style={{ backgroundColor: '#dc3545', color: 'white' }}
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  {loading ? 'Eliminando...' : 'Confirmar Eliminación'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteAccount(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
