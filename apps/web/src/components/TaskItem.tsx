import React from 'react';
import { Task, TaskCheckbox } from '../types';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onComplete: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onUpdateCheckbox?: (taskId: string, checkboxes: TaskCheckbox[]) => void;
  showCompleteButton?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onEdit, 
  onComplete, 
  onDelete,
  onUpdateCheckbox,
  showCompleteButton = true 
}) => {
  const handleDoubleClick = () => {
    if (!task.completed) {
      onEdit(task);
    }
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete(task.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(task.id);
    }
  };

  const handleCheckboxChange = (checkboxId: string, checked: boolean) => {
    if (onUpdateCheckbox && task.checkboxes) {
      const updatedCheckboxes = task.checkboxes.map(cb =>
        cb.id === checkboxId ? { ...cb, checked } : cb
      );
      onUpdateCheckbox(task.id, updatedCheckboxes);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="task-item" onDoubleClick={handleDoubleClick}>
      <div className="task-content">
        <div className="task-name">{task.name}</div>
        {task.comment && (
          <div className="task-comment">{task.comment}</div>
        )}
        
        {/* Mostrar checkboxes si existen */}
        {task.checkboxes && task.checkboxes.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            {task.checkboxes.map((checkbox) => (
              <div key={checkbox.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <input
                  type="checkbox"
                  checked={checkbox.checked}
                  onChange={(e) => handleCheckboxChange(checkbox.id, e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  disabled={task.completed}
                  style={{ cursor: task.completed ? 'default' : 'pointer' }}
                />
                <span 
                  style={{ 
                    fontSize: '14px', 
                    color: checkbox.checked ? '#28a745' : '#666',
                    textDecoration: checkbox.checked ? 'line-through' : 'none',
                    fontWeight: checkbox.checked ? 'bold' : 'normal'
                  }}
                >
                  {checkbox.text}
                </span>
              </div>
            ))}
          </div>
        )}
        
        <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
          <div>Creada: {formatDate(task.createdAt)}</div>
          {task.updatedAt && task.updatedAt !== task.createdAt && (
            <div style={{ marginTop: '2px' }}>
              Modificada: {formatDate(task.updatedAt)}
            </div>
          )}
          {task.completed && (
            <div style={{ marginTop: '2px' }}>
              Completada: {task.completedAt ? formatDate(task.completedAt) : 'Fecha desconocida'}
            </div>
          )}
        </div>
      </div>
      
      <div className="task-actions">
        {/* Botón completar para tareas pendientes */}
        {showCompleteButton && !task.completed && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              className="checkbox"
              checked={false}
              onChange={(e) => {
                e.stopPropagation();
                handleComplete(e as any);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <span style={{ fontSize: '14px', color: '#666' }}>Completada</span>
          </label>
        )}
        
        {/* Botón eliminar para tareas completadas */}
        {task.completed && onDelete && (
          <button
            onClick={handleDelete}
            style={{
              padding: '6px 12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              marginLeft: '8px'
            }}
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
