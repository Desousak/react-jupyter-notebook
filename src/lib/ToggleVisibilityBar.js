import React from 'react';
import './scss/ToggleVisibilityBar.scss';

export default React.memo(function ToggleVisibilityBar(props) {
  const { highlighted, onClick } = props;

  // The blue highlight for the cell
  return (
    <div
      className={highlighted ? 'block-light-selected' : 'block-light'}
      onClick={onClick}
    />
  );
});
