import React from 'react';
import { Form } from 'react-bootstrap';
import './Comments.css';

const CategoryFilter = ({ selectedCategory, onCategoryChange, showAll = true }) => {
  const categories = ['General', 'Sports', 'Politics', 'Entertainment', 'Technology', 'Business', 'Education', 'Health', 'Food', 'Travel', 'Other'];

  return (
    <Form.Group className="mb-3">
      <Form.Label className="fw-bold">Filter by Category:</Form.Label>
      <div className="d-flex flex-wrap gap-2">
        {showAll && (
          <Form.Check
            type="radio"
            id="category-all"
            label="All Categories"
            name="categoryFilter"
            checked={selectedCategory === 'All'}
            onChange={() => onCategoryChange('All')}
            className="category-filter-radio"
          />
        )}
        {categories.map((category) => (
          <Form.Check
            key={category}
            type="radio"
            id={`category-${category}`}
            label={category}
            name="categoryFilter"
            checked={selectedCategory === category}
            onChange={() => onCategoryChange(category)}
            className="category-filter-radio"
          />
        ))}
      </div>
    </Form.Group>
  );
};

export default CategoryFilter;

