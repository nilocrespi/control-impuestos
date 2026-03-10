import TaxItem from "./TaxItem.jsx";

const TaxList = ({ items, onToggle, onDelete, onAddCategoria, onRemoveCategoria }) => (
    <div className="tableWrapper">
        <table className="taxTable">
            <thead>
                <tr className="tableHeader">
                    <th className="col-menu"></th>
                    <th className="col-impuesto">Impuesto</th>
                    <th className="col-importe">Importe</th>
                    <th className="col-vencimiento">Vencimiento</th>
                    <th className="col-pagado">Pagado</th>
                    <th className="col-categoria">Categoría</th>
                </tr>
            </thead>
            <tbody>
                {items.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="emptyState">
                            No hay impuestos registrados
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
                        />
                    ))
                )}
            </tbody>
        </table>
    </div>
);

export default TaxList;
