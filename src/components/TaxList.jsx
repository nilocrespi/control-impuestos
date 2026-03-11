import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import TaxItem from "./TaxItem";

// ─── Dropdown genérico via portal ────────────────────────────────
const HeaderDropdown = ({ anchorRef, onClose, children }) => {
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const menuRef = useRef(null);

    useEffect(() => {
        if (!anchorRef.current) return;
        const rect = anchorRef.current.getBoundingClientRect();
        setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
        const handler = (e) => {
            if (!anchorRef.current?.contains(e.target) && !menuRef.current?.contains(e.target))
                onClose();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return createPortal(
        <div ref={menuRef} className="categoriaDropdown" style={{ position: "absolute", top: pos.top, left: pos.left }}>
            {children}
        </div>,
        document.body
    );
};

// ─── TaxList ──────────────────────────────────────────────────────
const TaxList = ({ items, allItems, onToggle, onDelete, onAddCategoria, onRemoveCategoria, onTagClick, filtroCategoria, filtroPago, onPagoFilter, onUpdateFechaPago }) => {
    const [catOpen, setCatOpen]   = useState(false);
    const [pagoOpen, setPagoOpen] = useState(false);
    const catRef  = useRef(null);
    const pagoRef = useRef(null);

    const todasCategorias = [...new Set(
        (allItems || items).flatMap((i) => Array.isArray(i.categorias) ? i.categorias : [])
    )].sort();

    const OPCIONES_PAGO = [
        { val: "pagado", label: "Pagado" },
        { val: "impago", label: "Impago" },
    ];

    return (
        <div className="tableWrapper">
            <table className="taxTable">
                <thead>
                    <tr className="tableHeader">
                        <th className="col-menu"></th>
                        <th className="col-impuesto">Impuesto</th>
                        <th className="col-importe">Importe</th>
                        <th className="col-vencimiento">Vencimiento</th>

                        {/* ── Estado (pago) ── */}
                        <th
                            ref={pagoRef}
                            className={`col-pagado col-categoria--clickeable ${filtroPago ? "col-categoria--activo" : ""}`}
                            onClick={() => { setPagoOpen((v) => !v); setCatOpen(false); }}
                        >
                            Estado
                            <span className="categoriaThChevron">{pagoOpen ? "▲" : "▼"}</span>
                            {filtroPago && <span className="categoriaThDot" />}
                        </th>

                        {/* ── Categoría ── */}
                        <th
                            ref={catRef}
                            className={`col-categoria col-categoria--clickeable ${filtroCategoria ? "col-categoria--activo" : ""}`}
                            onClick={() => { setCatOpen((v) => !v); setPagoOpen(false); }}
                        >
                            Categoría
                            <span className="categoriaThChevron">{catOpen ? "▲" : "▼"}</span>
                            {filtroCategoria && <span className="categoriaThDot" />}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="emptyState">
                                {filtroCategoria || filtroPago
                                    ? "Sin resultados para el filtro aplicado"
                                    : "No hay impuestos registrados"}
                            </td>
                        </tr>
                    ) : (
                        items.map((item) => (
                            <TaxItem
                                key={item.id}
                                item={item}
                                onToggle={onToggle}
                                onDelete={onDelete}
                                onAddCategoria={onAddCategoria}
                                onRemoveCategoria={onRemoveCategoria}
                                onTagClick={onTagClick}
                                filtroCategoria={filtroCategoria}
                                onUpdateFechaPago={onUpdateFechaPago}
                            />
                        ))
                    )}
                </tbody>
            </table>

            {/* Dropdown estado pago */}
            {pagoOpen && (
                <HeaderDropdown anchorRef={pagoRef} onClose={() => setPagoOpen(false)}>
                    <p className="categoriaDropdownTitle">Estado de pago</p>
                    <div className="categoriaDropdownList">
                        {OPCIONES_PAGO.map(({ val, label }) => (
                            <button
                                key={val}
                                className={`categoriaDropdownItem ${filtroPago === val ? "categoriaDropdownItem--activo" : ""}`}
                                onClick={() => { onPagoFilter(val); setPagoOpen(false); }}
                            >
                                <span className={`pagoDropdownDot pagoDropdownDot--${val}`} />
                                {label}
                                {filtroPago === val && <span className="categoriaDropdownCheck">✓</span>}
                            </button>
                        ))}
                    </div>
                    {filtroPago && (
                        <button className="categoriaDropdownClear" onClick={() => { onPagoFilter(filtroPago); setPagoOpen(false); }}>
                            Limpiar filtro
                        </button>
                    )}
                </HeaderDropdown>
            )}

            {/* Dropdown categorías */}
            {catOpen && (
                <HeaderDropdown anchorRef={catRef} onClose={() => setCatOpen(false)}>
                    <p className="categoriaDropdownTitle">Categorías</p>
                    <div className="categoriaDropdownList">
                        {todasCategorias.map((cat) => (
                            <button
                                key={cat}
                                className={`categoriaDropdownItem ${filtroCategoria === cat ? "categoriaDropdownItem--activo" : ""}`}
                                onClick={() => { onTagClick(cat); setCatOpen(false); }}
                            >
                                <span className="categoriaDropdownDot" />
                                {cat}
                                {filtroCategoria === cat && <span className="categoriaDropdownCheck">✓</span>}
                            </button>
                        ))}
                        {todasCategorias.length > 0 && <div className="categoriaDropdownSeparator" />}
                        <button
                            className={`categoriaDropdownItem categoriaDropdownItem--sincat ${filtroCategoria === "__sin_categoria__" ? "categoriaDropdownItem--activo" : ""}`}
                            onClick={() => { onTagClick("__sin_categoria__"); setCatOpen(false); }}
                        >
                            <span className="categoriaDropdownDot categoriaDropdownDot--empty" />
                            Sin categoría
                            {filtroCategoria === "__sin_categoria__" && <span className="categoriaDropdownCheck">✓</span>}
                        </button>
                    </div>
                    {filtroCategoria && (
                        <button className="categoriaDropdownClear" onClick={() => { onTagClick(filtroCategoria); setCatOpen(false); }}>
                            Limpiar filtro
                        </button>
                    )}
                </HeaderDropdown>
            )}
        </div>
    );
};

export default TaxList;
