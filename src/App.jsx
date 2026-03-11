import { useState } from "react";
import { useAuth } from "./hooks/useAuth.js";
import { useImpuestos } from "./hooks/useImpuestos.js";
import LoginForm from "./components/LoginForm.jsx";
import TaxForm from "./components/TaxForm.jsx";
import TaxList from "./components/TaxList.jsx";

const App = () => {
    const { user, authReady, login, logout } = useAuth();
    const { impuestos, add, toggle, remove, addCategoria, removeCategoria, updateFechaPago } = useImpuestos(user?.uid ?? null);
    const [filtroCategoria, setFiltroCategoria] = useState(null);
    const [filtroPago, setFiltroPago] = useState(null); // null | "pagado" | "impago"

    if (!authReady) return null;

    // Orden: más reciente primero. Items sin creadoEn van al final.
    const impuestosOrdenados = [...impuestos].sort((a, b) => {
        const ta = a.creadoEn ?? 0;
        const tb = b.creadoEn ?? 0;
        return tb - ta;
    });

    const itemsFiltrados = impuestosOrdenados.filter((i) => {
        if (filtroCategoria) {
            const cats = Array.isArray(i.categorias) ? i.categorias : [];
            if (filtroCategoria === "__sin_categoria__") {
                if (cats.length > 0) return false;
            } else {
                if (!cats.includes(filtroCategoria)) return false;
            }
        }
        if (filtroPago === "pagado" && !i.pagado) return false;
        if (filtroPago === "impago" && i.pagado) return false;
        return true;
    });

    const handleTagClick = (cat) => setFiltroCategoria((prev) => prev === cat ? null : cat);
    const handlePagoFilter = (val) => setFiltroPago((prev) => prev === val ? null : val);

    const hayFiltros = filtroCategoria || filtroPago;

    return (
        <div className="pageWrapper">
            <header className="appHeader">
                <h1 className="appTitle">control de impuestos</h1>
                {user && <button className="logoutBtn" onClick={logout}>Logout</button>}
            </header>
            {!user ? (
                <main className="loginWrapper">
                    <LoginForm onLogin={login} />
                </main>
            ) : (
                <main className="appMain">
                    <TaxForm onAdd={add} />
                    <section className="tableSection">
                        <div className="tableSectionHeader">
                            <h2 className="sectionTitle">Impuestos registrados</h2>
                            {hayFiltros && (
                                <div className="filtroActivo">
                                    <span>Filtrando por:</span>
                                    {filtroCategoria && (
                                        <span className="categoriaTag categoriaTag--sm">
                                            <span className="categoriaTagLabel">
                                                {filtroCategoria === "__sin_categoria__" ? "Sin categoría" : filtroCategoria}
                                            </span>
                                        </span>
                                    )}
                                    {filtroPago && (
                                        <span className={`pagoFilterTag pagoFilterTag--${filtroPago}`}>
                                            {filtroPago === "pagado" ? "Pagado" : "Impago"}
                                        </span>
                                    )}
                                    <button className="filtroClear" onClick={() => { setFiltroCategoria(null); setFiltroPago(null); }}>
                                        Limpiar filtros
                                    </button>
                                </div>
                            )}
                        </div>
                        <TaxList
                            items={itemsFiltrados}
                            allItems={impuestosOrdenados}
                            onToggle={toggle}
                            onDelete={remove}
                            onAddCategoria={addCategoria}
                            onRemoveCategoria={removeCategoria}
                            onUpdateFechaPago={updateFechaPago}
                            onTagClick={handleTagClick}
                            filtroCategoria={filtroCategoria}
                            filtroPago={filtroPago}
                            onPagoFilter={handlePagoFilter}
                        />
                    </section>
                </main>
            )}
        </div>
    );
};

export default App;
