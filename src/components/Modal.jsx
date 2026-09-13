import { useEffect, useId, useRef } from "react";
export default function Modal({
  title,
  onClose,
  children,
  className = "",
  onKeyDown,
}) {
  const ref = useRef(null),
    id = useId(),
    close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const node = ref.current,
      previous = document.activeElement;
    node.showModal();
    const cancel = (e) => {
      e.preventDefault();
      close.current();
    };
    node.addEventListener("cancel", cancel);
    return () => {
      node.removeEventListener("cancel", cancel);
      node.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby={id}
      onKeyDown={onKeyDown}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="modal-head">
        <h2 id={id}>{title}</h2>
        <button className="close" onClick={onClose} aria-label="关闭弹窗">
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
