import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

// ─── Portal context menu ──────────────────────────────────────────
const ContextMenu = ({ anchorRef, onClose, children }) => {
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const menuRef = useRef(null);

    useEffect(() => {
        if (!anchorRef.current) return;
        const rect = anchorRef.current.getBoundingClientRect();
        setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
        const handler = (e) => {
            const clickedAnchor = anchorRef.current?.contains(e.target);
            const clickedMenu   = menuRef.current?.contains(e.target);
            if (!clickedAnchor && !clickedMenu) onClose();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return createPortal(
        <div ref={menuRef} className="contextMenu" style={{ position: "absolute", top: pos.top, left: pos.left }}>
            {children}
        </div>,
        document.body
    );
};

// ─── Tag individual ───────────────────────────────────────────────
const CategoriaTag = ({ label, onRemove, onTagClick, activo }) => (
    <span
        className={`categoriaTag${activo ? " categoriaTag--activo" : ""}`}
        onClick={() => onTagClick(label)}
        title="Filtrar por esta categoría"
    >
        <span className="categoriaTagLabel">{label}</span>
        <button
            className="categoriaTagRemove"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            title="Eliminar categoría"
        >
            ×
        </button>
    </span>
);

// Convierte "d/m/yyyy" a "yyyy-mm-dd" para el input date
const esDateToISO = (esDate) => {
    if (!esDate) return "";
    const parts = esDate.split("/");
    if (parts.length !== 3) return "";
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};

// Convierte "yyyy-mm-dd" a "d/m/yyyy"
const isoToEsDate = (iso) => {
    if (!iso) return null;
    const [y, m, d] = iso.split("-");
    return `${parseInt(d)}/${parseInt(m)}/${y}`;
};

// ─── TaxItem ──────────────────────────────────────────────────────
const TaxItem = ({ item, onToggle, onDelete, onAddCategoria, onRemoveCategoria, onTagClick, filtroCategoria, onUpdateFechaPago }) => {
    const [menuOpen, setMenuOpen]         = useState(false);
    const [popupOpen, setPopupOpen]       = useState(false);  // categoría
    const [fechaPopupOpen, setFechaPopupOpen] = useState(false);
    const [inputVal, setInputVal]         = useState("");
    const [fechaVal, setFechaVal]         = useState("");
    const triggerRef = useRef(null);
    const inputRef   = useRef(null);
    const fechaRef   = useRef(null);

    const categorias = Array.isArray(item.categorias) ? item.categorias : [];

    useEffect(() => {
        if (popupOpen) {
            setInputVal("");
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [popupOpen]);

    useEffect(() => {
        if (fechaPopupOpen) {
            setFechaVal(esDateToISO(item.fechaPago));
            setTimeout(() => fechaRef.current?.focus(), 50);
        }
    }, [fechaPopupOpen]);

    const handleCategoriaSubmit = (e) => {
        e.preventDefault();
        const val = inputVal.trim();
        if (!val) return;
        onAddCategoria(item.id, val, categorias);
        setPopupOpen(false);
        setInputVal("");
    };

    const handleFechaSubmit = (e) => {
        e.preventDefault();
        if (!fechaVal) return;
        onUpdateFechaPago(item.id, isoToEsDate(fechaVal));
        setFechaPopupOpen(false);
    };

    return (
        <>
            <tr className={`taxRow ${item.pagado ? "row-pagado" : "row-impago"}`}>
                <td className="col-menu">
                    <button
                        ref={triggerRef}
                        className="menuTrigger"
                        onClick={() => setMenuOpen((v) => !v)}
                        aria-label="Opciones"
                    >
                        ···
                    </button>
                    {menuOpen && (
                        <ContextMenu anchorRef={triggerRef} onClose={() => setMenuOpen(false)}>
                            <button
                                className="contextMenuItem"
                                onClick={() => { setMenuOpen(false); setPopupOpen(true); }}
                            >
                                Asignar categoría
                            </button>
                            {item.pagado && (
                                <button
                                    className="contextMenuItem"
                                    onClick={() => { setMenuOpen(false); setFechaPopupOpen(true); }}
                                >
                                    Modificar fecha de pago
                                </button>
                            )}
                            <button
                                className="contextMenuItem contextMenuItem--danger"
                                onClick={() => { setMenuOpen(false); onDelete(item.id); }}
                            >
                                Eliminar
                            </button>
                        </ContextMenu>
                    )}
                </td>

                <td className="col-impuesto">{item.impuesto}</td>
                <td className="col-importe">
                    ${item.importe.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="col-vencimiento">{item.vencimiento || "—"}</td>
                <td className="col-pagado">
                    <button
                        className={`statusBtn ${item.pagado ? "pagado" : "impago"}`}
                        onClick={() => onToggle(item)}
                    >
                        {item.pagado ? `✓ ${item.fechaPago}` : "Impago"}
                    </button>
                </td>
                <td className="col-categoria">
                    {categorias.length > 0 ? (
                        <div className="categoriaList">
                            {categorias.map((cat) => (
                                <CategoriaTag
                                    key={cat}
                                    label={cat}
                                    onRemove={() => onRemoveCategoria(item.id, cat, categorias)}
                                    onTagClick={onTagClick}
                                    activo={filtroCategoria === cat}
                                />
                            ))}
                        </div>
                    ) : (
                        <span className="categoriaEmpty">—</span>
                    )}
                </td>
            </tr>

            {/* Popup: asignar categoría */}
            {popupOpen && (
                <tr className="popupRow">
                    <td colSpan={6} className="popupCell">
                        <div className="categoriaPopupBackdrop" onClick={() => setPopupOpen(false)} />
                        <div className="categoriaPopup">
                            <p className="categoriaPopupTitle">Asignar categoría</p>
                            <p className="categoriaPopupSub">{item.impuesto}</p>
                            {categorias.length > 0 && (
                                <div className="categoriaPopupExistentes">
                                    {categorias.map((cat) => (
                                        <span key={cat} className="categoriaTag categoriaTag--sm">
                                            <span className="categoriaTagLabel">{cat}</span>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <form className="categoriaPopupForm" onSubmit={handleCategoriaSubmit}>
                                <input
                                    ref={inputRef}
                                    className="categoriaInput"
                                    type="text"
                                    placeholder="Nueva categoría..."
                                    value={inputVal}
                                    onChange={(e) => setInputVal(e.target.value)}
                                    required
                                />
                                <div className="categoriaPopupBtns">
                                    <button type="submit" className="categoriaConfirm">Agregar</button>
                                    <button type="button" className="categoriaCancel" onClick={() => setPopupOpen(false)}>Cancelar</button>
                                </div>
                            </form>
                        </div>
                    </td>
                </tr>
            )}

            {/* Popup: modificar fecha de pago */}
            {fechaPopupOpen && (
                <tr className="popupRow">
                    <td colSpan={6} className="popupCell">
                        <div className="categoriaPopupBackdrop" onClick={() => setFechaPopupOpen(false)} />
                        <div className="categoriaPopup">
                            <p className="categoriaPopupTitle">Modificar fecha de pago</p>
                            <p className="categoriaPopupSub">{item.impuesto}</p>
                            <form className="categoriaPopupForm" onSubmit={handleFechaSubmit}>
                                <input
                                    ref={fechaRef}
                                    className="categoriaInput"
                                    type="date"
                                    value={fechaVal}
                                    onChange={(e) => setFechaVal(e.target.value)}
                                    required
                                />
                                <div className="categoriaPopupBtns">
                                    <button type="submit" className="categoriaConfirm">Confirmar</button>
                                    <button type="button" className="categoriaCancel" onClick={() => setFechaPopupOpen(false)}>Cancelar</button>
                                </div>
                            </form>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

export default TaxItem;
