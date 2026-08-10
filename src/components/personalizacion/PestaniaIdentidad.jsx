const input = "w-full surface px-3 py-2.5 text-sm"

export default function PestañaIdentidad({ draft, set }) {
  return (
    <div className="space-y-3">
      <Label texto="Nombre de la barbería">
        <input className={input} value={draft.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Barbería El Cauce" />
      </Label>
      <Label texto="Dirección">
        <input className={input} value={draft.direccion} onChange={(e) => set("direccion", e.target.value)} placeholder="Av. Siempre Viva 123" />
      </Label>
      <Label texto="Ciudad o comuna">
        <input className={input} value={draft.ciudad} onChange={(e) => set("ciudad", e.target.value)} placeholder="Santiago" />
      </Label>
      <div className="grid grid-cols-2 gap-3">
        <Label texto="Apertura">
          <input type="time" className={input} value={draft.horaApertura} onChange={(e) => set("horaApertura", e.target.value)} />
        </Label>
        <Label texto="Cierre">
          <input type="time" className={input} value={draft.horaCierre} onChange={(e) => set("horaCierre", e.target.value)} />
        </Label>
      </div>
      <Label texto="Teléfono">
        <input className={input} value={draft.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="+56 9 5555 1111" inputMode="tel" />
      </Label>
    </div>
  )
}

function Label({ texto, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide">{texto}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  )
}