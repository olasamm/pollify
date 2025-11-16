import React from 'react';
import { Badge } from 'react-bootstrap';

const CategoryBadge = ({ category, onClick }) => {
  const getCategoryColor = (cat) => {
    const colors = {
      'General': 'secondary',
      'Sports': 'success',
      'Politics': 'danger',
      'Entertainment': 'warning',
      'Technology': 'info',
      'Business': 'primary',
      'Education': 'primary',
      'Health': 'danger',
      'Food': 'warning',
      'Travel': 'info',
      'Other': 'secondary'
    };
    return colors[cat] || 'secondary';
  };

  const getCategoryIcon = (cat) => {
    const icons = {
      'General': 'bi-grid',
      'Sports': 'bi-trophy',
      'Politics': 'bi-flag',
      'Entertainment': 'bi-camera-reels',
      'Technology': 'bi-laptop',
      'Business': 'bi-briefcase',
      'Education': 'bi-book',
      'Health': 'bi-heart',
      'Food': 'bi-cup-hot',
      'Travel': 'bi-geo-alt',
      'Other': 'bi-three-dots'
    };
    return icons[cat] || 'bi-grid';
  };

  if (!category) return null;

  return (
    <Badge 
      bg={getCategoryColor(category)} 
      className="me-2"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <i className={`bi ${getCategoryIcon(category)} me-1`}></i>
      {category}
    </Badge>
  );
};

export default CategoryBadge;

