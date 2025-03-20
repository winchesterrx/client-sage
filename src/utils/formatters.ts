
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Format currency to BRL
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Format date to Brazilian format (dd/mm/yyyy)
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '—';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    console.error('Date format error:', error);
    return dateString.toString();
  }
};

// Format phone number to Brazilian format
export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove any non-digit character
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 11) {
    // Format as (XX) XXXXX-XXXX for mobile
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (digits.length === 10) {
    // Format as (XX) XXXX-XXXX for landline
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  // Return original if can't format
  return phone;
};

// Get status for payment with color
export const getPaymentStatusInfo = (status: string, dueDate?: string) => {
  const statusMap: Record<string, { label: string, color: string }> = {
    paid: { label: 'Pago', color: 'text-green-500 bg-green-50' },
    pending: { label: 'Pendente', color: 'text-yellow-500 bg-yellow-50' },
    overdue: { label: 'Atrasado', color: 'text-red-500 bg-red-50' },
  };

  // If it's pending but due date is in the past, mark as overdue
  if (status === 'pending' && dueDate) {
    const now = new Date();
    const due = parseISO(dueDate);
    if (due < now) {
      return { label: 'Atrasado', color: 'text-red-500 bg-red-50' };
    }
  }

  return statusMap[status] || { label: status, color: 'text-gray-500 bg-gray-50' };
};

// Get service status with color
export const getServiceStatusInfo = (status: string) => {
  const statusMap: Record<string, { label: string, color: string }> = {
    active: { label: 'Ativo', color: 'text-green-500 bg-green-50' },
    inactive: { label: 'Inativo', color: 'text-gray-500 bg-gray-50' },
    pending: { label: 'Pendente', color: 'text-yellow-500 bg-yellow-50' },
  };

  return statusMap[status] || { label: status, color: 'text-gray-500 bg-gray-50' };
};

// Get project status with color
export const getProjectStatusInfo = (status: string) => {
  const statusMap: Record<string, { label: string, color: string }> = {
    planning: { label: 'Planejamento', color: 'text-blue-500 bg-blue-50' },
    in_progress: { label: 'Em Andamento', color: 'text-yellow-500 bg-yellow-50' },
    completed: { label: 'Concluído', color: 'text-green-500 bg-green-50' },
    on_hold: { label: 'Em Espera', color: 'text-orange-500 bg-orange-50' },
  };

  return statusMap[status] || { label: status, color: 'text-gray-500 bg-gray-50' };
};

// Get task status with color
export const getTaskStatusInfo = (status: string) => {
  const statusMap: Record<string, { label: string, color: string }> = {
    todo: { label: 'A Fazer', color: 'text-blue-500 bg-blue-50' },
    in_progress: { label: 'Em Andamento', color: 'text-yellow-500 bg-yellow-50' },
    completed: { label: 'Concluído', color: 'text-green-500 bg-green-50' },
  };

  return statusMap[status] || { label: status, color: 'text-gray-500 bg-gray-50' };
};

// Get priority info with color
export const getPriorityInfo = (priority: string) => {
  const priorityMap: Record<string, { label: string, color: string }> = {
    low: { label: 'Baixa', color: 'text-green-500 bg-green-50' },
    medium: { label: 'Média', color: 'text-yellow-500 bg-yellow-50' },
    high: { label: 'Alta', color: 'text-red-500 bg-red-50' },
  };

  return priorityMap[priority] || { label: priority, color: 'text-gray-500 bg-gray-50' };
};

// Open WhatsApp with phone number
export const openWhatsApp = (phone: string) => {
  // Remove any non-digit character
  const digits = phone.replace(/\D/g, '');
  
  // Ensure it starts with country code (Brazil)
  const phoneWithCountry = digits.startsWith('55') ? digits : `55${digits}`;
  
  window.open(`https://wa.me/${phoneWithCountry}`, '_blank');
};

// Truncate text
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Get days remaining or passed
export const getDaysRemaining = (dateString: string | null | undefined): { days: number, status: 'future' | 'today' | 'past' } => {
  if (!dateString) return { days: 0, status: 'future' };
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    const today = new Date();
    const days = differenceInDays(date, today);
    
    if (days > 0) return { days, status: 'future' };
    if (days < 0) return { days: Math.abs(days), status: 'past' };
    return { days: 0, status: 'today' };
  } catch (error) {
    console.error('Date calculation error:', error);
    return { days: 0, status: 'future' };
  }
};

// Get file size in human readable format
export const formatFileSize = (sizeInBytes: number): string => {
  if (sizeInBytes < 1024) return `${sizeInBytes} B`;
  if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  if (sizeInBytes < 1024 * 1024 * 1024) return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};
