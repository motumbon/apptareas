import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, CreateTaskData, UpdateTaskData, TaskCheckbox } from '../types';

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>;
  task?: Task | null;
  title: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ visible, onClose, onSubmit, task, title }) => {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [checkboxes, setCheckboxes] = useState<TaskCheckbox[]>([]);
  const [loading, setLoading] = useState(false);

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
  }, [task, visible]);

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

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ 
        name: name.trim(), 
        comment: comment.trim(),
        checkboxes: checkboxes
      });
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Error al guardar la tarea');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setComment('');
    setCheckboxes([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{title}</Text>
            
            <View style={styles.form}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ingresa el nombre de la tarea"
                editable={!loading}
              />

              <Text style={styles.label}>Comentario</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={comment}
                onChangeText={setComment}
                placeholder="Comentario opcional"
                multiline
                numberOfLines={4}
                editable={!loading}
              />

              <View style={styles.checkboxSection}>
                <View style={styles.checkboxHeader}>
                  <Text style={styles.label}>Lista de Tareas</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={addCheckbox}
                    disabled={loading}
                  >
                    <Ionicons name="add" size={16} color="white" />
                    <Text style={styles.addButtonText}>Agregar Check</Text>
                  </TouchableOpacity>
                </View>
                
                {checkboxes.map((checkbox) => (
                  <View key={checkbox.id} style={styles.checkboxItem}>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => updateCheckbox(checkbox.id, 'checked', !checkbox.checked)}
                      disabled={loading}
                    >
                      <Ionicons 
                        name={checkbox.checked ? "checkbox" : "square-outline"} 
                        size={20} 
                        color={checkbox.checked ? "#28a745" : "#666"} 
                      />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.checkboxInput}
                      value={checkbox.text}
                      onChangeText={(text) => updateCheckbox(checkbox.id, 'text', text)}
                      placeholder="Texto del check"
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeCheckbox(checkbox.id)}
                      disabled={loading}
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Aceptar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  checkboxSection: {
    marginTop: 10,
  },
  checkboxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
    marginRight: 8,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    padding: 6,
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  submitButton: {
    backgroundColor: '#007bff',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TaskModal;
