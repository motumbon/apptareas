import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';
import { Task, TaskCheckbox } from '../types';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';
import AccountPage from '../components/AccountPage';
import { LogOut, Plus, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';

const Tasks: React.FC = () => {
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Menu states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'alphabetical' | 'date' | 'none'>('none');
  const [showAccountPage, setShowAccountPage] = useState(false);
  
  const { user, logout } = useAuth();

  const loadTasks = async () => {
    try {
      setLoading(true);
      const [pending, completed] = await Promise.all([
        tasksAPI.getPending(),
        tasksAPI.getCompleted(),
      ]);
      setPendingTasks(pending);
      setCompletedTasks(completed);
      setError('');
    } catch (err: any) {
      setError('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('[data-menu="dropdown"]')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleCreateTask = async (data: any) => {
    await tasksAPI.create(data);
    await loadTasks();
  };

  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;
    await tasksAPI.update(editingTask.id, data);
    await loadTasks();
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      try {
        await tasksAPI.delete(taskId);
        await loadTasks();
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
      }
    }
  };

  const handleUpdateCheckbox = async (taskId: string, checkboxes: TaskCheckbox[]) => {
    try {
      await tasksAPI.update(taskId, { checkboxes });
      await loadTasks();
    } catch (error) {
      console.error('Error al actualizar checkbox:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    await tasksAPI.complete(taskId);
    await loadTasks();
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // Función para ordenar tareas
  const sortTasks = (tasks: Task[], order: 'alphabetical' | 'date' | 'none') => {
    if (order === 'none') return tasks;
    
    return [...tasks].sort((a, b) => {
      if (order === 'alphabetical') {
        return a.name.localeCompare(b.name);
      } else if (order === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    const allTasks = [...pendingTasks, ...completedTasks];
    
    const excelData = allTasks.map(task => {
      const row: any = {
        'Fecha de Creación': new Date(task.createdAt).toLocaleDateString('es-ES'),
        'Nombre de la Tarea': task.name,
        'Comentario': task.comment || '',
      };
      
      // Agregar checkboxes como columnas separadas
      if (task.checkboxes && task.checkboxes.length > 0) {
        task.checkboxes.forEach((checkbox, index) => {
          row[`Check ${index + 1}`] = `${checkbox.checked ? '✓' : '○'} ${checkbox.text}`;
        });
      }
      
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tareas');
    
    // Generar y descargar el archivo
    XLSX.writeFile(workbook, `tareas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const currentTasks = sortTasks(
    activeTab === 'pending' ? pendingTasks : completedTasks,
    sortOrder
  );

  // Si está mostrando la página de cuenta, renderizar AccountPage
  if (showAccountPage) {
    return <AccountPage onBack={() => setShowAccountPage(false)} />;
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Mis Tareas</h1>
          <p style={{ color: '#666', marginTop: '5px' }}>
            Bienvenido, {user?.username}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {activeTab === 'pending' && (
            <button className="btn btn-success" onClick={handleNewTask}>
              <Plus size={16} />
              Nueva Tarea
            </button>
          )}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Menú desplegable */}
            <div style={{ position: 'relative' }} data-menu="dropdown">
              <button 
                className="btn btn-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
              >
                Opciones
                <ChevronDown size={16} />
              </button>
              
              {isMenuOpen && (
                <div 
                  style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  zIndex: 1000,
                  minWidth: '200px',
                  marginTop: '5px'
                }}>
                  <button
                    className="dropdown-menu-item"
                    onClick={() => {
                      setShowAccountPage(true);
                      setIsMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      borderBottom: '1px solid #eee'
                    }}
                  >
                    👤 Cuenta
                  </button>
                  <button
                    className="dropdown-menu-item"
                    onClick={() => {
                      setSortOrder('alphabetical');
                      setIsMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      borderBottom: '1px solid #eee'
                    }}
                  >
                    📝 Ordenar por orden alfabético
                  </button>
                  <button
                    className="dropdown-menu-item"
                    onClick={() => {
                      setSortOrder('date');
                      setIsMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      borderBottom: '1px solid #eee'
                    }}
                  >
                    📅 Ordenar por fecha de creación
                  </button>
                  <button
                    className="dropdown-menu-item"
                    onClick={() => {
                      exportToExcel();
                      setIsMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#28a745'
                    }}
                  >
                    📊 Exportar a Excel
                  </button>
                </div>
              )}
            </div>
            
            <button className="btn btn-secondary" onClick={logout}>
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pendientes ({pendingTasks.length})
        </button>
        <button
          className={`nav-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completadas ({completedTasks.length})
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando tareas...</div>
      ) : error ? (
        <div className="error" style={{ textAlign: 'center', padding: '40px' }}>
          {error}
          <br />
          <button 
            className="btn btn-primary" 
            onClick={loadTasks}
            style={{ marginTop: '10px' }}
          >
            Reintentar
          </button>
        </div>
      ) : currentTasks.length === 0 ? (
        <div className="empty-state">
          <h3>
            {activeTab === 'pending' 
              ? 'No tienes tareas pendientes' 
              : 'No tienes tareas completadas'
            }
          </h3>
          <p>
            {activeTab === 'pending' 
              ? 'Haz clic en "Nueva Tarea" para crear tu primera tarea' 
              : 'Las tareas que completes aparecerán aquí'
            }
          </p>
        </div>
      ) : (
        <div>
          {currentTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onComplete={handleCompleteTask}
              onDelete={activeTab === 'completed' ? handleDeleteTask : undefined}
              onUpdateCheckbox={handleUpdateCheckbox}
              showCompleteButton={activeTab === 'pending'}
            />
          ))}
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        title={editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
      />
    </div>
  );
};

export default Tasks;
