import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';
import { Task, TaskCheckbox } from '../types';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';
import AccountScreen from './AccountScreen';

const TasksScreen: React.FC = () => {
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Menu and account states
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showAccountScreen, setShowAccountScreen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'alphabetical' | 'date' | 'none'>('none');
  
  const { user, logout } = useAuth();

  const loadTasks = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const [pending, completed] = await Promise.all([
        tasksAPI.getPending(),
        tasksAPI.getCompleted(),
      ]);
      
      setPendingTasks(pending);
      setCompletedTasks(completed);
    } catch (error: any) {
      Alert.alert('Error', 'Error al cargar las tareas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (data: { name: string; comment?: string }) => {
    await tasksAPI.create(data);
    await loadTasks();
  };

  const handleUpdateTask = async (data: { name: string; comment?: string }) => {
    if (!editingTask) return;
    await tasksAPI.update(editingTask.id, data);
    await loadTasks();
    setEditingTask(null);
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await tasksAPI.complete(taskId);
      await loadTasks();
    } catch (error: any) {
      Alert.alert('Error', 'Error al completar la tarea');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksAPI.delete(taskId);
      await loadTasks();
    } catch (error: any) {
      Alert.alert('Error', 'Error al eliminar la tarea');
    }
  };

  const handleUpdateCheckbox = async (taskId: string, checkboxes: TaskCheckbox[]) => {
    try {
      await tasksAPI.update(taskId, { checkboxes });
      await loadTasks();
    } catch (error: any) {
      Alert.alert('Error', 'Error al actualizar los checkboxes');
    }
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

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: logout },
      ]
    );
  };

  const currentTasks = sortTasks(
    activeTab === 'pending' ? pendingTasks : completedTasks,
    sortOrder
  );

  // Si está mostrando la página de cuenta, renderizar AccountScreen
  if (showAccountScreen) {
    return <AccountScreen onBack={() => setShowAccountScreen(false)} />;
  }

  const renderTask = ({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onEdit={handleEditTask}
      onComplete={handleCompleteTask}
      onDelete={activeTab === 'completed' ? handleDeleteTask : undefined}
      onUpdateCheckbox={handleUpdateCheckbox}
      showCompleteButton={activeTab === 'pending'}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name={activeTab === 'pending' ? 'clipboard-outline' : 'checkmark-circle-outline'} 
        size={64} 
        color="#ccc" 
      />
      <Text style={styles.emptyTitle}>
        {activeTab === 'pending' 
          ? 'No tienes tareas pendientes' 
          : 'No tienes tareas completadas'
        }
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'pending' 
          ? 'Toca el botón + para crear tu primera tarea' 
          : 'Las tareas que completes aparecerán aquí'
        }
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Cargando tareas...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mis Tareas</Text>
          <Text style={styles.subtitle}>Bienvenido, {user?.username}</Text>
        </View>
        <View style={styles.headerActions}>
          {activeTab === 'pending' && (
            <TouchableOpacity style={styles.addButton} onPress={handleNewTask}>
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.optionsButton} 
            onPress={() => setShowOptionsMenu(true)}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#6c757d" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pendientes ({pendingTasks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completadas ({completedTasks.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={() => loadTasks(true)}
      />

      {activeTab === 'pending' && (
        <TouchableOpacity style={styles.fab} onPress={handleNewTask}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}

      <TaskModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        title={editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
      />

      {/* Modal de opciones */}
      <Modal
        visible={showOptionsMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptionsMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsMenu(false)}
        >
          <View style={styles.optionsModal}>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowAccountScreen(true);
                setShowOptionsMenu(false);
              }}
            >
              <Ionicons name="person" size={20} color="#333" />
              <Text style={styles.optionText}>👤 Cuenta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setSortOrder('alphabetical');
                setShowOptionsMenu(false);
              }}
            >
              <Ionicons name="text" size={20} color="#333" />
              <Text style={styles.optionText}>📝 Ordenar alfabéticamente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setSortOrder('date');
                setShowOptionsMenu(false);
              }}
            >
              <Ionicons name="calendar" size={20} color="#333" />
              <Text style={styles.optionText}>📅 Ordenar por fecha</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, styles.logoutOption]}
              onPress={() => {
                setShowOptionsMenu(false);
                handleLogout();
              }}
            >
              <Ionicons name="log-out" size={20} color="#dc3545" />
              <Text style={[styles.optionText, styles.logoutText]}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    backgroundColor: '#28a745',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsButton: {
    padding: 8,
  },
  logoutButton: {
    padding: 8,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginTop: 1,
  },
  tab: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007bff',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  optionsModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  logoutOption: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
    paddingTop: 16,
  },
  logoutText: {
    color: '#dc3545',
  },
});

export default TasksScreen;
