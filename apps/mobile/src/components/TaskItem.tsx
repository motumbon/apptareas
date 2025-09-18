import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const handlePress = () => {
    if (!task.completed) {
      onEdit(task);
    }
  };

  const handleComplete = () => {
    onComplete(task.id);
  };

  const handleDelete = () => {
    if (onDelete) {
      Alert.alert(
        'Eliminar Tarea',
        '¿Estás seguro de que deseas eliminar esta tarea?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(task.id) },
        ]
      );
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
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.content}>
        <Text style={styles.name}>{task.name}</Text>
        {task.comment ? (
          <Text style={styles.comment}>{task.comment}</Text>
        ) : null}
        
        {/* Mostrar checkboxes si existen */}
        {task.checkboxes && task.checkboxes.length > 0 && (
          <View style={styles.checkboxContainer}>
            {task.checkboxes.map((checkbox) => (
              <TouchableOpacity
                key={checkbox.id}
                style={styles.checkboxItem}
                onPress={() => handleCheckboxChange(checkbox.id, !checkbox.checked)}
                disabled={task.completed}
              >
                <Ionicons 
                  name={checkbox.checked ? "checkbox" : "square-outline"} 
                  size={16} 
                  color={checkbox.checked ? "#28a745" : "#666"} 
                />
                <Text 
                  style={[
                    styles.checkboxText,
                    checkbox.checked && styles.checkboxTextCompleted
                  ]}
                >
                  {checkbox.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        <Text style={styles.date}>
          {task.completed ? (
            `Completada: ${task.completedAt ? formatDate(task.completedAt) : 'Fecha desconocida'}`
          ) : (
            `Creada: ${formatDate(task.createdAt)}`
          )}
        </Text>
      </View>
      
      <View style={styles.actions}>
        {/* Botón completar para tareas pendientes */}
        {showCompleteButton && !task.completed && (
          <TouchableOpacity style={styles.checkButton} onPress={handleComplete}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#28a745" />
            <Text style={styles.checkText}>Completada</Text>
          </TouchableOpacity>
        )}
        
        {/* Botón eliminar para tareas completadas */}
        {task.completed && onDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="white" />
            <Text style={styles.deleteText}>Eliminar</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    flexDirection: 'row',
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
  content: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  comment: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  checkboxContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkboxText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  checkboxTextCompleted: {
    color: '#28a745',
    textDecorationLine: 'line-through',
    fontWeight: 'bold',
  },
  actions: {
    alignItems: 'center',
    paddingLeft: 16,
  },
  checkButton: {
    alignItems: 'center',
  },
  checkText: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 2,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default TaskItem;
