import { useAuth } from "./hooks/useAuth.js";
import { useImpuestos } from "./hooks/useImpuestos.js";
import LoginForm from "./components/LoginForm.jsx";
import TaxForm from "./components/TaxForm.jsx";
import TaxList from "./components/TaxList.jsx";

const App = () => {
    const { user, authReady, login, logout } = useAuth();
    const { impuestos, add, toggle, remove, addCategoria, removeCategoria } = useImpuestos(user?.uid ?? null);

    if (!authReady) return null;

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
                        <h2 className="sectionTitle">Impuestos registrados</h2>
                        <TaxList
                            items={impuestos}
                            onToggle={toggle}
                            onDelete={remove}
                            onAddCategoria={addCategoria}
                            onRemoveCategoria={removeCategoria}
                        />
                    </section>
                </main>
            )}
        </div>
    );
};

export default App;
