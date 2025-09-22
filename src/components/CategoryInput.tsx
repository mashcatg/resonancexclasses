import React, { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategoryInputProps {
  value: string[];
  onChange: (categories: string[]) => void;
  placeholder?: string;
}

const CategoryInput: React.FC<CategoryInputProps> = ({ 
  value = [], 
  onChange, 
  placeholder = "Add categories separated by commas..." 
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addCategory();
    }
  };

  const addCategory = () => {
    const newCategories = inputValue
      .split(',')
      .map(cat => cat.trim())
      .filter(cat => cat && !value.includes(cat));
    
    if (newCategories.length > 0) {
      onChange([...value, ...newCategories]);
      setInputValue('');
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    onChange(value.filter(cat => cat !== categoryToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={addCategory}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCategory}
          disabled={!inputValue.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((category) => (
            <Badge key={category} variant="secondary" className="flex items-center gap-1">
              {category}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => removeCategory(category)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryInput;