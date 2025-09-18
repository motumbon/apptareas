import React, { useState, useEffect } from 'react';
import { Task, CreateTaskData, UpdateTaskData, TaskCheckbox } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>;
  task?: Task | null;
  title: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, task, title }) => {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [checkboxes, setCheckboxes] = useState<TaskCheckbox[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setName(task.name);
      setComment(task.comment);
      setCheckboxes(task.checkboxes || []);
    } else {
      setName('');
      setComment('');
      setCheckboxes([]);
    }
    setError('');
  }, [task, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({ 
        name: name.trim(), 
        comment: comment.trim(),
        checkboxes: checkboxes
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar la tarea');
    } finally {
      setLoading(false);
    }
  };

  const addCheckbox = () => {
    const newCheckbox: TaskCheckbox = {
      id: Date.now().toString(),
      text: '',
      checked: false,
    };
    setCheckboxes([...checkboxes, newCheckbox]);
  };

  const updateCheckbox = (id: string, field: keyof TaskCheckbox, value: string | boolean) => {
    setCheckboxes(checkboxes.map(cb => 
      cb.id === id ? { ...cb, [field]: value } : cb
    ));
  };

  const removeCheckbox = (id: string) => {
    setCheckboxes(checkboxes.filter(cb => cb.id !== id));
  };

  const handleCancel = () => {
    setName('');
    setComment('');
    setCheckboxes([]);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ingresa el nombre de la tarea"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="comment">Comentario</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comentario opcional"
              disabled={loading}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label>Lista de Tareas</label>
              <button
                type="button"
                onClick={addCheckbox}
                disabled={loading}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                + Agregar Check
              </button>
            </div>
            
            {checkboxes.map((checkbox) => (
              <div key={checkbox.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '12px',
                padding: '8px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                border: '1px solid #e9ecef'
              }}>
                <input
                  type="checkbox"
                  checked={checkbox.checked}
                  onChange={(e) => updateCheckbox(checkbox.id, 'checked', e.target.checked)}
                  disabled={loading}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer'
                  }}
                />
                <input
                  type="text"
                  value={checkbox.text}
                  onChange={(e) => updateCheckbox(checkbox.id, 'text', e.target.value)}
                  placeholder="Texto del check"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px',
                    minHeight: '44px',
                    backgroundColor: 'white',
                    color: '#333',
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeCheckbox(checkbox.id)}
                  disabled={loading}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    minWidth: '40px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {error && <div className="error">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Aceptar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
