export const negocio = {
  id: "n1",
  nombre: "Barbería El Cauce",
  direccion: "San Antonio 412, Santiago",
  telefono: "+56955551111",
  qrUrl: "https://wa.me/56955551111",
  tema: "elegante",
}

export const servicios = [
  { id: "s1", nombre: "Corte clásico", precio: 12000, duracion: 40 },
  { id: "s2", nombre: "Corte + barba", precio: 18000, duracion: 60 },
  { id: "s3", nombre: "Barba", precio: 8000, duracion: 25 },
  { id: "s4", nombre: "Tinte", precio: 25000, duracion: 90 },
]

export const clientesMock = [
  { id: "c1", nombre: "Jorge Muñoz", telefono: "+56911112222", notas: "Prefiere fade alto. Siempre mismo corte.", visitas: 14 },
  { id: "c2", nombre: "Rodrigo Díaz", telefono: "+56933334444", notas: "Barba perfilada, máquina sin cortar bigote.", visitas: 8 },
  { id: "c3", nombre: "Camilo Torres", telefono: "+56955556666", notas: "", visitas: 3 },
  { id: "c4", nombre: "Matías Rojas", telefono: "+56977778888", notas: "Solo cortes de máquina. Llega con los pelos húmedos.", visitas: 21 },
]

export const turnosMock = [
  { id: "t1", clienteId: "c1", servicioId: "s2", fecha: "2026-08-04", hora: "10:00", estado: "cumplido", empleadoId: "e1" },
  { id: "t2", clienteId: "c2", servicioId: "s1", fecha: "2026-08-04", hora: "11:00", estado: "confirmado", empleadoId: "e1" },
  { id: "t3", clienteId: "c3", servicioId: "s3", fecha: "2026-08-04", hora: "12:30", estado: "confirmado", empleadoId: "e1" },
  { id: "t4", clienteId: "c4", servicioId: "s2", fecha: "2026-08-04", hora: "15:00", estado: "confirmado", empleadoId: "e1" },
]

export const ventasMock = [
  { id: "v1", clienteId: "c1", servicioId: "s2", monto: 18000, fechaHora: "2026-08-04T10:40:00", metodo: "Efectivo" },
  { id: "v2", clienteId: "c2", servicioId: "s1", monto: 12000, fechaHora: "2026-08-04T11:35:00", metodo: "Transferencia" },
]

export const qrStatsMock = [
  { id: "q1", fechaHora: "2026-08-04T09:15:00", fuente: "QR mostrador", monto: 12000 },
  { id: "q2", fechaHora: "2026-08-04T10:02:00", fuente: "QR mostrador", monto: 18000 },
  { id: "q3", fechaHora: "2026-08-04T13:45:00", fuente: "QR lavabo", monto: 8000 },
  { id: "q4", fechaHora: "2026-08-04T15:30:00", fuente: "QR mostrador", monto: 25000 },
]

export const empleados = [
  { id: "e1", nombre: "Mauricio" },
  { id: "e2", nombre: "Sebastián" },
]
