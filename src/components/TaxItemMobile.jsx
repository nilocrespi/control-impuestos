import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

// ─── Bottom sheet context menu (mobile) ──────────────────────────
const BottomSheet = ({ onClose, children }) => {
    useEffect(() => {
        const handler = (e) => { if (e.target.classList.contains("bottomSheetBackdrop")) onClose(); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return createPortal(
        <>
            <div className="bottomSheetBackdrop" />
            <div className="bottomSheet">
                <div className="bottomSheetHandle" />
                {children}
            </div>
        </>,
        document.body
    );
};

// ─── Tag individual ───────────────────────────────────────────────
const CategoriaTag = ({ label, onRemove, onTagClick, activo }) => (
    <span
        className={`categoriaTag${activo ? " categoriaTag--activo" : ""}`}
        onClick={() => onTagClick(label)}
    >
        <span className="categoriaTagLabel">{label}</span>
        <button
            className="categoriaTagRemove"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
        >×</button>
    </span>
);

const esDateToISO = (esDate) => {
    if (!esDate) return "";
    const parts = esDate.split("/");
    if (parts.length !== 3) return "";
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};
const isoToEsDate = (iso) => {
    if (!iso) return null;
    const [y, m, d] = iso.split("-");
    return `${parseInt(d)}/${parseInt(m)}/${y}`;
};

// ─── TaxItemMobile ────────────────────────────────────────────────
const TaxItemMobile = ({ item, onToggle, onDelete, onAddCategoria, onRemoveCategoria, onTagClick, filtroCategoria, onUpdateFechaPago }) => {
    const [sheetOpen, setSheetOpen]       = useState(false);
    const [popupOpen, setPopupOpen]       = useState(false);
    const [fechaPopupOpen, setFechaPopupOpen] = useState(false);
    const [inputVal, setInputVal]         = useState("");
    const [fechaVal, setFechaVal]         = useState("");
    const inputRef = useRef(null);
    const fechaRef = useRef(null);

    const categorias = Array.isArray(item.categorias) ? item.categorias : [];

    useEffect(() => {
        if (popupOpen) { setInputVal(""); setTimeout(() => inputRef.current?.focus(), 50); }
    }, [popupOpen]);

    useEffect(() => {
        if (fechaPopupOpen) { setFechaVal(esDateToISO(item.fechaPago)); setTimeout(() => fechaRef.current?.focus(), 50); }
    }, [fechaPopupOpen]);

    const handleCategoriaSubmit = (e) => {
        e.preventDefault();
        const val = inputVal.trim();
        if (!val) return;
        onAddCategoria(item.id, val, categorias);
        setPopupOpen(false);
    };

    const handleFechaSubmit = (e) => {
        e.preventDefault();
        if (!fechaVal) return;
        onUpdateFechaPago(item.id, isoToEsDate(fechaVal));
        setFechaPopupOpen(false);
    };

    return (
        <>
            <div className={`taxCard ${item.pagado ? "taxCard--pagado" : "taxCard--impago"}`}>
                {/* Top row: nombre + botón ··· */}
                <div className="taxCardHeader">
                    <span className="taxCardNombre">{item.impuesto}</span>
                    <button className="menuTrigger taxCardMenu" onClick={() => setSheetOpen(true)} aria-label="Opciones">···</button>
                </div>

                {/* Middle row: importe + vencimiento + estado */}
                <div className="taxCardMeta">
                    <div className="taxCardMetaItem">
                        <span className="taxCardMetaLabel">Importe</span>
                        <span className="taxCardMetaValue">
                            ${item.importe.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="taxCardMetaItem">
                        <span className="taxCardMetaLabel">Vencimiento</span>
                        <span className="taxCardMetaValue">{item.vencimiento || "—"}</span>
                    </div>
                    <button
                        className={`statusBtn ${item.pagado ? "pagado" : "impago"}`}
                        onClick={() => onToggle(item)}
                    >
                        {item.pagado ? `✓ ${item.fechaPago}` : "Impago"}
                    </button>
                </div>

                {/* Tags */}
                {categorias.length > 0 && (
                    <div className="categoriaList taxCardTags">
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
                )}
            </div>

            {/* Bottom sheet menu */}
            {sheetOpen && (
                <BottomSheet onClose={() => setSheetOpen(false)}>
                    <p className="bottomSheetTitle">{item.impuesto}</p>
                    <button className="bottomSheetItem" onClick={() => { setSheetOpen(false); setPopupOpen(true); }}>
                        Asignar categoría
                    </button>
                    {item.pagado && (
                        <button className="bottomSheetItem" onClick={() => { setSheetOpen(false); setFechaPopupOpen(true); }}>
                            Modificar fecha de pago
                        </button>
                    )}
                    <button className="bottomSheetItem bottomSheetItem--danger" onClick={() => { setSheetOpen(false); onDelete(item.id); }}>
                        Eliminar
                    </button>
                    <button className="bottomSheetCancel" onClick={() => setSheetOpen(false)}>Cancelar</button>
                </BottomSheet>
            )}

            {/* Popup: asignar categoría */}
            {popupOpen && createPortal(
                <>
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
                            <input ref={inputRef} className="categoriaInput" type="text" placeholder="Nueva categoría..." value={inputVal} onChange={(e) => setInputVal(e.target.value)} required />
                            <div className="categoriaPopupBtns">
                                <button type="submit" className="categoriaConfirm">Agregar</button>
                                <button type="button" className="categoriaCancel" onClick={() => setPopupOpen(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </>,
                document.body
            )}

            {/* Popup: fecha de pago */}
            {fechaPopupOpen && createPortal(
                <>
                    <div className="categoriaPopupBackdrop" onClick={() => setFechaPopupOpen(false)} />
                    <div className="categoriaPopup">
                        <p className="categoriaPopupTitle">Modificar fecha de pago</p>
                        <p className="categoriaPopupSub">{item.impuesto}</p>
                        <form className="categoriaPopupForm" onSubmit={handleFechaSubmit}>
                            <input ref={fechaRef} className="categoriaInput" type="date" value={fechaVal} onChange={(e) => setFechaVal(e.target.value)} required />
                            <div className="categoriaPopupBtns">
                                <button type="submit" className="categoriaConfirm">Confirmar</button>
                                <button type="button" className="categoriaCancel" onClick={() => setFechaPopupOpen(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </>,
                document.body
            )}
        </>
    );
};

export default TaxItemMobile;
