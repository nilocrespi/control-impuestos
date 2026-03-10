import { useState } from "react";

const formatDateToES = (isoValue) => {
    if (!isoValue) return null;
    const [y, m, d] = isoValue.split("-");
    return `${parseInt(d)}/${parseInt(m)}/${y}`;
};

const TaxForm = ({ onAdd }) => {
    const [impuesto, setImpuesto] = useState("");
    const [importe, setImporte] = useState("");
    const [vencimiento, setVencimiento] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!impuesto || !importe) return;
        onAdd({
            impuesto,
            importe: parseFloat(importe),
            vencimiento: formatDateToES(vencimiento),
            pagado: false,
            fechaPago: null,
        });
        setImpuesto("");
        setImporte("");
        setVencimiento("");
    };

    return (
        <section className="formSection">
            <h2 className="sectionTitle">Nuevo impuesto</h2>
            <form className="taxForm" onSubmit={handleSubmit}>
                <div className="inputRow">
                    <div className="inputGroup">
                        <label className="inputLabel">Impuesto</label>
                        <input
                            className="taxInput"
                            type="text"
                            placeholder="Ej: IVA, Ingresos Brutos..."
                            value={impuesto}
                            onChange={(e) => setImpuesto(e.target.value)}
                            required
                        />
                    </div>
                    <div className="inputGroup">
                        <label className="inputLabel">Importe</label>
                        <input
                            className="valueInput"
                            type="number"
                            step="any"
                            placeholder="0.00"
                            value={importe}
                            onChange={(e) => setImporte(e.target.value)}
                            required
                        />
                    </div>
                    <div className="inputGroup">
                        <label className="inputLabel">Vencimiento</label>
                        <input
                            className="dateInput"
                            type="date"
                            value={vencimiento}
                            onChange={(e) => setVencimiento(e.target.value)}
                        />
                    </div>
                    <button className="addButton" type="submit">
                        + Agregar
                    </button>
                </div>
            </form>
        </section>
    );
};

export default TaxForm;
