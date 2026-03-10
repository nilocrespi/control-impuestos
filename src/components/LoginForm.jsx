import { useState } from "react";

const LoginForm = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await onLogin(username, password);
        } catch {
            setError("Error al ingresar. Verificá tus datos.");
        }
        setLoading(false);
    };

    return (
        <form className="loginForm" id="loginForm" onSubmit={handleSubmit}>
            <input
                className="loginInput"
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                className="loginInput"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            {error && <p style={{ color: "red", marginTop: "0.5em", marginInline: "1em" }}>{error}</p>}
            <button className="loginBtn" type="submit" disabled={loading}>
                {loading ? "Cargando..." : "Login / Registro"}
            </button>
        </form>
    );
};

export default LoginForm;
