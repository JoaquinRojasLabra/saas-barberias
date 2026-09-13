import Cargando from "./Cargando"
import EstadoError from "./EstadoError"
import EstadoVacio from "./EstadoVacio"

export default function useEstadoVista({
  cargando,
  error,
  onReintentar,
  vacio,
  icono,
  titulo,
  descripcion,
  cta,
  onCta,
}) {
  if (cargando) return <Cargando />
  if (error) return <EstadoError mensaje={error} onReintentar={onReintentar} />
  if (vacio) return <EstadoVacio icono={icono} titulo={titulo} descripcion={descripcion} cta={cta} onCta={onCta} />
  return null
}