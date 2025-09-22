export const stripHtml = (html: string): string => {
  if (!html) return '';
  
  // Create a temporary element and set its innerHTML
  const tempElement = document.createElement('div');
  tempElement.innerHTML = html;
  
  // Get the text content which strips all HTML tags
  return tempElement.textContent || tempElement.innerText || '';
};

export const truncateText = (text: string, maxLength: number = 150): string => {
  if (!text) return '';
  
  const stripped = stripHtml(text);
  
  if (stripped.length <= maxLength) return stripped;
  
  return stripped.substring(0, maxLength) + '...';
};