import React from 'react';

export default function ToggleVisibilityBar(props) {
  const { highlighted, onClick } = props;

  //  The blue highlight for the cell
  return (
    <div
      className={highlighted ? 'block-light-selected' : 'block-light'}
      onClick={onClick}
    />
  );
}
