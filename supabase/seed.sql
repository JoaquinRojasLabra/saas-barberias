-- SaaS Barberías v4 — seed demo (Barbería El Cauce)
-- Reemplazar <DEMO_ID>, <SEBASTIAN_ID>, <MAURICIO_ID> y <HOY> antes de aplicar.
insert into public.negocios (slug, nombre, telefono, direccion, tema, usuario_auth)
values ('el-cauce', 'Barbería El Cauce', '+56955551111', 'San Antonio 412, Santiago', 'elegante', '33ac1dd3-1d1b-427a-a6aa-7712e47d59eb')
on conflict (slug) do nothing;

-- empleados (por subselect del negocio para no depender del uuid)
insert into public.empleados (negocio_id, nombre, usuario_auth, activado)
select n.id, 'Mauricio', '131f30ae-3745-455e-a961-f10e57957db3', true from public.negocios n where n.slug='el-cauce'
on conflict (usuario_auth) do nothing;

insert into public.empleados (negocio_id, nombre, usuario_auth, activado)
select n.id, 'Sebastián', '8ce72957-8c5c-419c-b816-64f8eb8a3d6e', true from public.negocios n where n.slug='el-cauce'
on conflict (usuario_auth) do nothing;

insert into public.servicios (negocio_id, nombre, duracion, precio)
select n.id, x.nombre, x.duracion, x.precio
from public.negocios n
cross join (values
  ('Corte clásico', 40, 12000),
  ('Corte + barba', 60, 18000),
  ('Barba', 25, 8000),
  ('Tinte', 90, 25000)
) as x(nombre, duracion, precio)
where n.slug='el-cauce';

insert into public.slots_horario (negocio_id, hora)
select n.id, x::time
from public.negocios n
cross join unnest(array['09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00']) as x
where n.slug='el-cauce';

insert into public.preferencias (negocio_id, horas_recordatorio, whatsapp_numero)
select id, 2, '+56955551111' from public.negocios where slug='el-cauce'
on conflict (negocio_id) do nothing;

insert into public.clientes (negocio_id, nombre, whatsapp, visitas, empleado_id)
select n.id, c.nombre, c.whatsapp, c.visitas,
       case when c.barbero='M' then (select id from public.empleados where usuario_auth='131f30ae-3745-455e-a961-f10e57957db3') else (select id from public.empleados where usuario_auth='8ce72957-8c5c-419c-b816-64f8eb8a3d6e') end
from public.negocios n
cross join (values
  ('Jorge Muñoz', '+56911112222', 14, 'M'),
  ('Rodrigo Díaz', '+56933334444', 8, 'M'),
  ('Camilo Torres', '+56955556666', 3, 'S'),
  ('Matías Rojas', '+56977778888', 21, 'S')
) as c(nombre, whatsapp, visitas, barbero)
where n.slug='el-cauce';

-- turnos de días pasados con su venta (pagada), para la gráfica de la semana
insert into public.turnos (negocio_id, cliente_id, servicio_id, empleado_id, fecha, hora, estado, metodo_pago, pagado, origen)
select n.id,
       (select c.id from public.clientes c where c.nombre='Jorge Muñoz' and c.negocio_id=n.id),
       (select s.id from public.servicios s where s.nombre='Corte + barba' and s.negocio_id=n.id),
       (select e.id from public.empleados e where e.nombre='Mauricio' and e.negocio_id=n.id),
       ('2026-08-08'::date - interval '3 days')::date, '10:00', 'cumplido', 'Efectivo', true, 'panel'
from public.negocios n where n.slug='el-cauce';

insert into public.ventas (negocio_id, cliente_id, servicio_id, turno_id, empleado_id, monto, fecha_hora, metodo, pagado, pendiente_pago)
select t.negocio_id, t.cliente_id, t.servicio_id, t.id, t.empleado_id,
       (select s.precio from public.servicios s where s.id=t.servicio_id),
       (t.fecha::timestamptz + t.hora), 'Efectivo', true, false
from public.turnos t where t.estado='cumplido';

-- 1 turno de HOY con pago "En línea" pendiente (demo del flujo)
insert into public.turnos (negocio_id, cliente_id, servicio_id, empleado_id, fecha, hora, estado, metodo_pago, pagado, origen)
select n.id,
       (select c.id from public.clientes c where c.nombre='Matías Rojas' and c.negocio_id=n.id),
       (select s.id from public.servicios s where s.nombre='Corte clásico' and s.negocio_id=n.id),
       (select e.id from public.empleados e where e.nombre='Sebastián' and e.negocio_id=n.id),
       '2026-08-08', '11:00', 'confirmado', 'En línea', false, 'web-publico'
from public.negocios n where n.slug='el-cauce';

insert into public.ventas (negocio_id, cliente_id, servicio_id, turno_id, empleado_id, monto, fecha_hora, metodo, pagado, pendiente_pago)
select n.id,
       (select c.id from public.clientes c where c.nombre='Matías Rojas' and c.negocio_id=n.id),
       (select s.id from public.servicios s where s.nombre='Corte clásico' and s.negocio_id=n.id),
       (select t.id from public.turnos t where t.origen='web-publico' and t.cliente_id=(select c.id from public.clientes c where c.nombre='Matías Rojas' and c.negocio_id=n.id) and t.negocio_id=n.id limit 1),
       (select e.id from public.empleados e where e.nombre='Sebastián' and e.negocio_id=n.id),
       (select s.precio from public.servicios s where s.nombre='Corte clásico' and s.negocio_id=n.id),
       now(), 'En línea', false, true
from public.negocios n where n.slug='el-cauce';

insert into public.qr_stats (negocio_id, fecha_hora, fuente)
select n.id, now() - interval '2 days', 'QR mostrador'
from public.negocios n where n.slug='el-cauce';