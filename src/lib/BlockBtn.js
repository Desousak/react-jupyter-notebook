import './scss/BlockBtn.scss';

export default function BlockBtn(props) {
  const { callback, text, className, children, ...btnProps } = props;
  return (
    <button
      onClick={callback}
      className={`block-btn ${className ? className : ''}`}
      {...btnProps}
    >
      {children ? children : text}
    </button>
  );
}
