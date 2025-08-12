import { toast } from 'react-toastify';

export const notify = {
  success: (message) => toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  }),
  
  error: (message) => toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  }),
  
  warning: (message) => toast.warning(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  }),
  
  loading: (message) => toast.loading(message),
  
  dismiss: (toastId) => toast.dismiss(toastId),
  
  dismissAll: () => toast.dismiss(),
  
  // Для асинхронных операций
  promise: (promise, messages) => toast.promise(promise, {
    pending: messages.pending || 'Загрузка...',
    success: messages.success || 'Успешно!',
    error: messages.error || 'Произошла ошибка',
  })
};

export default notify;
