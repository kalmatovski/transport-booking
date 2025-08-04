import { useState } from 'react';

const initialFormData = {
  brand: '',
  model: '',
  color: '',
  seats: '',
  plate_number: '',
  vehicle_image: null
};

export function useVehicleForm(onSuccess) {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'vehicle_image') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Очищаем ошибку для этого поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.brand) newErrors.brand = ['Укажите марку'];
    if (!formData.model) newErrors.model = ['Укажите модель'];
    if (!formData.color) newErrors.color = ['Укажите цвет'];
    if (!formData.seats) newErrors.seats = ['Укажите количество мест'];
    if (!formData.plate_number) newErrors.plate_number = ['Укажите номер'];

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  const handleSubmit = (e, onSubmit) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    // Подготавливаем данные
    const vehicleData = {
      ...formData,
      seats: parseInt(formData.seats)
    };

    onSubmit(vehicleData);
  };

  const setServerErrors = (serverErrors) => {
    setErrors(serverErrors);
  };

  return {
    formData,
    errors,
    handleInputChange,
    handleSubmit,
    resetForm,
    setServerErrors,
    isValid: Object.keys(errors).length === 0
  };
}
