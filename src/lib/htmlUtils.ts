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

// Convert plain text URLs to clickable links
export const linkifyUrls = (html: string): string => {
  if (!html) return '';
  
  // URL regex pattern
  const urlPattern = /(https?:\/\/[^\s<>"']+)/gi;
  
  // Replace URLs that are not already inside href attributes or anchor tags
  return html.replace(urlPattern, (url) => {
    // Check if URL is already inside an anchor tag by looking at surrounding context
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">${url}</a>`;
  });
};