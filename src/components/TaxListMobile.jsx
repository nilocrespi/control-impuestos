import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import TaxItemMobile from "./TaxItemMobile.jsx";

// Dropdown filtros mobile (bottom sheet)
const FilterSheet = ({ onClose, children }) => {
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

const TaxListMobile = ({ items, allItems, onToggle, onDelete, onAddCategoria, onRemoveCategoria, onTagClick, filtroCategoria, filtroPago, onPagoFilter, onUpdateFechaPago }) => {
    const [filterOpen, setFilterOpen] = useState(false);

    const todasCategorias = [...new Set(
        (allItems || items).flatMap((i) => Array.isArray(i.categorias) ? i.categorias : [])
    )].sort();

    const hayFiltros = filtroCategoria || filtroPago;

    return (
        <div className="mobileListWrapper">
            {/* Barra de filtros */}
            <div className="mobileFilterBar">
                <button
                    className={`mobileFilterBtn ${hayFiltros ? "mobileFilterBtn--activo" : ""}`}
                    onClick={() => setFilterOpen(true)}
                >
                    ⚙ Filtrar
                    {hayFiltros && <span className="mobileFilterCount">
                        {[filtroCategoria, filtroPago].filter(Boolean).length}
                    </span>}
                </button>
                {hayFiltros && (
                    <button className="filtroClear" onClick={() => { onPagoFilter(filtroPago); onTagClick(filtroCategoria); }}>
                        Limpiar
                    </button>
                )}
            </div>

            {/* Lista de cards */}
            {items.length === 0 ? (
                <p className="emptyStateMobile">
                    {hayFiltros ? "Sin resultados para el filtro aplicado" : "No hay impuestos registrados"}
                </p>
            ) : (
                items.map((item) => (
                    <TaxItemMobile
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

            {/* Filter bottom sheet */}
            {filterOpen && (
                <FilterSheet onClose={() => setFilterOpen(false)}>
                    <p className="bottomSheetTitle">Filtrar</p>

                    <p className="bottomSheetSectionLabel">Estado de pago</p>
                    {["pagado", "impago"].map((val) => (
                        <button
                            key={val}
                            className={`bottomSheetItem bottomSheetItem--check ${filtroPago === val ? "bottomSheetItem--checked" : ""}`}
                            onClick={() => onPagoFilter(val)}
                        >
                            <span className={`pagoDropdownDot pagoDropdownDot--${val}`} />
                            {val === "pagado" ? "Pagado" : "Impago"}
                            {filtroPago === val && <span className="bottomSheetCheck">✓</span>}
                        </button>
                    ))}

                    {todasCategorias.length > 0 && <>
                        <p className="bottomSheetSectionLabel">Categoría</p>
                        {todasCategorias.map((cat) => (
                            <button
                                key={cat}
                                className={`bottomSheetItem bottomSheetItem--check ${filtroCategoria === cat ? "bottomSheetItem--checked" : ""}`}
                                onClick={() => onTagClick(cat)}
                            >
                                <span className="categoriaDropdownDot" />
                                {cat}
                                {filtroCategoria === cat && <span className="bottomSheetCheck">✓</span>}
                            </button>
                        ))}
                        <button
                            className={`bottomSheetItem bottomSheetItem--check ${filtroCategoria === "__sin_categoria__" ? "bottomSheetItem--checked" : ""}`}
                            onClick={() => onTagClick("__sin_categoria__")}
                        >
                            <span className="categoriaDropdownDot categoriaDropdownDot--empty" />
                            <span style={{ fontStyle: "italic" }}>Sin categoría</span>
                            {filtroCategoria === "__sin_categoria__" && <span className="bottomSheetCheck">✓</span>}
                        </button>
                    </>}

                    <button className="bottomSheetCancel" onClick={() => setFilterOpen(false)}>Cerrar</button>
                </FilterSheet>
            )}
        </div>
    );
};

export default TaxListMobile;
