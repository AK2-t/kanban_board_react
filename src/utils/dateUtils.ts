export const formatDate = (dateString: string | null): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const isOverdue = (dateString: string | null): boolean => {
  if (!dateString) return false;
  
  const dueDate = new Date(dateString);
  dueDate.setHours(23, 59, 59, 999); // End of day
  
  const now = new Date();
  return now > dueDate;
};

export const isToday = (dateString: string | null): boolean => {
  if (!dateString) return false;
  
  const dueDate = new Date(dateString);
  const today = new Date();
  
  return (
    dueDate.getDate() === today.getDate() &&
    dueDate.getMonth() === today.getMonth() &&
    dueDate.getFullYear() === today.getFullYear()
  );
};

export const isUpcoming = (dateString: string | null, daysThreshold = 3): boolean => {
  if (!dateString) return false;
  
  const dueDate = new Date(dateString);
  const today = new Date();
  const threshold = new Date();
  threshold.setDate(today.getDate() + daysThreshold);
  
  return dueDate > today && dueDate <= threshold;
};
