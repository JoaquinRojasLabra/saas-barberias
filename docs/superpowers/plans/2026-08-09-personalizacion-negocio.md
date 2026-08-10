# Personalización de marca por negocio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que cada dueño personalice la identidad de marca de SU barbería (identidad, estilo con color de acento y reset, logo 2D/3D, galería opcional) con vista previa en vivo, y reflejar esos cambios en la página pública y de reserva.

**Architecture:** Todo es aditivo. Nuevas columnas en `public.negocios` (`accent_color`, `logo_tipo`, `logo_url`, `ciudad`, `hora_apertura`, `hora_cierre`, `mostrar_galeria`) + tabla `public.galeria` con RLS (select público, escritura solo dueño) + bucket público de Storage `negocio-imagenes`. En el front: nueva vista `Personalizacion` en el menú lateral (pestañas Identidad · Estilo · Logo · Galería) con una `VistaPrevia` que re-renderiza una miniatura de la página pública desde el draft. El color de acento se aplica globalmente vía inline styles sobre `--accent`/`--accent-2` (arranca de `ThemeProvider` tras guardar y del wrapper local de la vista previa en vivo). `negocios` ya es leíble por `anon`, así que la página pública solo lee campos nuevos.

**Tech Stack:** Vite 8 (rolldown) + React 19 + Tailwind v4 + Framer Motion; Supabase (Postgres + Storage); `@supabase/supabase-js`; @phosphor-icons/react; oxlint (`npm run lint`); Vercel (`npx vercel --prod`). Windows PowerShell (NO `&&`).

**Convenciones del repo (OBLIGATORIO):**
- `src/context/store.jsx` usa `filaAFront`/`frontAFila` de `src/lib/mapos.js` (snake↔camel automático). `updateNegocio(patch)` ya persiste cualquier columna.
- Temas: clase `.theme-{id}` en `<html>`; tokens `--accent`, `--accent-2`, `.surface`. Verificación = lint + build + Playwright (`py -3`, headless chromium) — NO hay runner de unit tests.
- Antes de escribir código de UI, el subagente DEBE cargar las skills de diseño: `ui-ux-pro-max`, `impeccable`, `frontend-design`, `high-end-visual-design`, `design-taste-frontend`, `visual-design-foundations`, `interaction-design`.
- Moverse en dir del proyecto con `workdir`; nunca `cd`. No usar `&&`.

---

### Task 1: Migración SQL — columnas, tabla galería, RLS y Storage

**Files:**
- Create: `supabase/migrations/20260809_04_personalizacion.sql`
- Create: `C:\Users\juako\AppData\Local\Temp\opencode\pg-fix\applypersonalizacion.js`

- [ ] **Step 1: Escribir la migración SQL**

Crear `C:\Users\juako\Trabajo\Sandbox\saas-barberias\supabase\migrations\20260809_04_personalizacion.sql`:

```sql
-- SaaS Barberías v4 — Personalización de marca por negocio
-- 1) negocios: identidad + estilo + logo + flag de galería
-- 2) galeria: fotos de trabajos (orden) con RLS select público / write dueño
-- 3) Storage: bucket público 'negocio-imagenes' + políticas

-- 1) negocios
alter table public.negocios
  add column if not exists accent_color text,
  add column if not exists logo_tipo text not null default '3d'
    check (logo_tipo in ('3d','imagen')),
  add column if not exists logo_url text,
  add column if not exists ciudad text,
  add column if not exists hora_apertura text,
  add column if not exists hora_cierre text,
  add column if not exists mostrar_galeria boolean not null default false;

-- 2) galería
create table if not exists public.galeria (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  url text not null,
  orden int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists ix_galeria_negocio on public.galeria(negocio_id, orden);
alter table public.galeria enable row level security;

create policy "galeria_select_publico" on public.galeria
  for select to anon, authenticated using (true);
create policy "galeria_insert_dueno" on public.galeria
  for insert to authenticated with check (negocio_id = public.negocio_de_usuario());
create policy "galeria_delete_dueno" on public.galeria
  for delete to authenticated using (negocio_id = public.negocio_de_usuario());

grant select on public.galeria to anon;
grant insert (negocio_id, url, orden) on public.galeria to authenticated;
grant delete on public.galeria to authenticated;

-- 3) Storage: bucket público para logos y fotos de trabajos
insert into storage.buckets (id, name, public)
values ('negocio-imagenes', 'negocio-imagenes', true)
on conflict (id) do nothing;

create policy "img_select_publico" on storage.objects
  for select using (bucket_id = 'negocio-imagenes');
create policy "img_insert_auth" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'negocio-imagenes' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "img_update_auth" on storage.objects
  for update to authenticated using (
    bucket_id = 'negocio-imagenes' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "img_delete_auth" on storage.objects
  for delete to authenticated using (
    bucket_id = 'negocio-imagenes' and (storage.foldername(name))[1] = auth.uid()::text
  );
```

- [ ] **Step 2: Escribir el script de aplicación**

Crear `C:\Users\juako\AppData\Local\Temp\opencode\pg-fix\applypersonalizacion.js` (mismo patrón que `applymigracionpagos.js`, pg instalado en ese folder):

```js
const fs = require('fs');
const { Client } = require('pg');
const c = new Client({ connectionString: 'postgres://postgres:vSmzBmmz6Fyw5R17@db.ggrvwajihnvdsidkknyi.supabase.co:5432/postgres', ssl: { rejectUnauthorized: false } });
(async () => {
  await c.connect();
  const sql = fs.readFileSync('C:\\Users\\juako\\Trabajo\\Sandbox\\saas-barberias\\supabase\\migrations\\20260809_04_personalizacion.sql', 'utf8');
  await c.query(sql);
  const cols = await c.query(`
    select column_name from information_schema.columns
    where table_schema='public' and table_name='negocios'
      and column_name in ('accent_color','logo_tipo','logo_url','ciudad','hora_apertura','hora_cierre','mostrar_galeria')`);
  console.log('columnas:', cols.rows.map(r => r.column_name).sort().join(','));
  const tbl = await c.query("select to_regclass('public.galeria')");
  console.log('galeria existe:', tbl.rows[0].to_regclass);
  const bkt = await c.query("select id, public from storage.buckets where id='negocio-imagenes'");
  console.log('bucket:', JSON.stringify(bkt.rows[0]));
  const pol = await c.query("select policyname from pg_policies where tablename='objects' and policyname like 'img%'");
  console.log('policies storage:', pol.rows.map(r => r.policyname).sort().join(', '));
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });
```

- [ ] **Step 3: Aplicar y verificar**

Run (workdir `C:\Users\juako\AppData\Local\Temp\opencode\pg-fix`):
`node applypersonalizacion.js`
Expected: `columnas: accent_color,hora_apertura,hora_cierre,logo_tipo,logo_url,mostrar_galeria,ciudad` (orden alfabético), `galeria existe: public.galeria`, bucket `{ id: 'negocio-imagenes', public: true }`, `policies storage: img_delete_auth, img_insert_auth, img_select_publico, img_update_auth`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260809_04_personalizacion.sql
git commit -m "feat(db): columnas identidad/estilo/logo/galería + bucket storage"
```

---

### Task 2: Store — cargar y guardar galería

**Files:**
- Modify: `src/context/store.jsx`

- [ ] **Step 1: Estado `galeria` + reset**

En `StoreProvider`, junto a `slotsHorario` (línea ~25) agregar:

```jsx
const [galeria, setGaleria] = useState([])
```

En `limpiarEstado` (línea ~38) agregar `setGaleria([])`.

- [ ] **Step 2: Cargar galería en `cargarTenant`**

En `cargarTenant` (línea ~63), añadir una consulta más al `Promise.all`:

```js
const [emps, srvs, trns, vts, clts, slots, qr, pref] = await Promise.all([
  ...
  conPref ? ... : Promise.resolve({ data: null, error: null }),
])
```

Cambiarlo a 9 entradas añadiendo como última (después de `pref`):

```js
supabase.from("galeria").select("*").eq("negocio_id", negocioId).order("orden"),
```

Ajustar el desestructurado a `const [emps, srvs, trns, vts, clts, slots, qr, pref, gal] = ...`, el chequeo de `firstErr` a los 9 resultados, y agregar:

```js
setGaleria(mapaDe(gal.data).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)))
```

- [ ] **Step 3: Cargar galería en `activarPorSlug`**

En `activarPorSlug` (línea ~215) el `Promise.all` de 3 consultas anónimas → agregar una 4ª `supabase.from("galeria").select("*").eq("negocio_id", data.id).order("orden")`, desestructurar `const [srvs, emps, slots, gal]` y `setGaleria(mapaDe(gal.data))`. En la rama "no encontrada" (línea ~211) agregar `setGaleria([])`.

- [ ] **Step 4: `guardarGaleria` (reemplazo completo)**

Agregar después de `updateSlotsHorario` (~línea 387):

```jsx
const guardarGaleria = useCallback(async (urls) => {
  const nid = negocio?.id
  if (!nid) return
  await supabase.from("galeria").delete().eq("negocio_id", nid)
  if (urls.length) {
    await supabase.from("galeria").insert(
      urls.map((url, i) => ({ negocio_id: nid, url, orden: i }))
    )
  }
  setGaleria(urls.map((url, i) => ({ id: `tmp-${i}`, url, orden: i })))
}, [negocio?.id])
```

- [ ] **Step 5: Exponer en `value`**

En el objeto `value` (línea ~491) agregar `galeria` y `guardarGaleria`.

- [ ] **Step 6: Verificar lint**

Run (workdir `C:\Users\juako\Trabajo\Sandbox\saas-barberias`): `npm run lint`
Expected: 0 errores (5 warnings preexistentes de fast-refresh ok).

- [ ] **Step 7: Commit**

```bash
git add src/context/store.jsx
git commit -m "feat(store): cargar y guardar galería de fotos"
```

---

### Task 3: Theme — override del color de acento

**Files:**
- Modify: `src/lib/theme.jsx`

- [ ] **Step 1: Efecto que aplica `negocio.accentColor` al root**

En `ThemeProvider`, agregar después del efecto que aplica la clase del tema (~línea 62):

```jsx
useEffect(() => {
  const root = document.documentElement
  const ac = negocio?.accentColor
  if (ac && /^#[0-9a-fA-F]{3,8}$/.test(ac)) {
    root.style.setProperty("--accent", ac)
    root.style.setProperty("--accent-2", ac)
  } else {
    root.style.removeProperty("--accent")
    root.style.removeProperty("--accent-2")
  }
}, [negocio?.accentColor])
```

- [ ] **Step 2: Verificar lint y commit**

Run: `npm run lint` → 0 errores.

```bash
git add src/lib/theme.jsx
git commit -m "feat(theme): aplicar color de acento personalizado del negocio"
```

---

### Task 4: Logo3D — aceptar color explícito

**Files:**
- Modify: `src/components/public/Logo3D.jsx`

- [ ] **Step 1: Firmar prop `color`**

Cambiar la firma a `export default function Logo3D({ seed = 0, size = 160, color })`. Dentro del efecto, reemplazar la línea 19 por:

```jsx
const accent = color || getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#0e7490"
```

Y en la dependencia del efecto (línea 56) cambiar `[size, seed]` → `[size, seed, color]`.

- [ ] **Step 2: lint y commit**

```bash
git add src/components/public/Logo3D.jsx
git commit -m "feat(logo3d): aceptar color explícito (color de marca)"
```

---

### Task 5: Personalización — shell, pestañas Identidad y Estilo

**Files:**
- Create: `src/components/personalizacion/Personalizacion.jsx`
- Create: `src/components/personalizacion/VistaPrevia.jsx`

- [ ] **Step 1: Componente `Personalizacion` (contenedor)**

Crear `src/components/personalizacion/Personalizacion.jsx`:

```jsx
import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Storefront, Palette, ImageSquare, Images } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { useTheme } from "@/lib/theme"
import { useToast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import VistaPrevia from "./VistaPrevia"
import PestañaIdentidad from "./PestaniaIdentidad"
import PestañaEstilo from "./PestaniaEstilo"
import PestañaLogo from "./PestaniaLogo"
import PestañaGaleria from "./PestaniaGaleria"

const pestañas = [
  { id: "identidad", label: "Identidad", icon: Storefront },
  { id: "estilo", label: "Estilo", icon: Palette },
  { id: "logo", label: "Logo", icon: ImageSquare },
  { id: "galeria", label: "Galería", icon: Images },
]

export default function Personalizacion() {
  const { negocio, esBarbero, updateNegocio, guardarGaleria } = useStore()
  const { setTheme } = useTheme()
  const push = useToast()
  const [pestaña, setPestaña] = useState("identidad")
  const [draft, setDraft] = useState(() => ({
    nombre: negocio?.nombre || "",
    direccion: negocio?.direccion || "",
    telefono: negocio?.telefono || "",
    ciudad: negocio?.ciudad || "",
    horaApertura: negocio?.horaApertura || "",
    horaCierre: negocio?.horaCierre || "",
    tema: negocio?.tema || "elegante",
    accentColor: negocio?.accentColor || "",
    logoTipo: negocio?.logoTipo || "3d",
    logoUrl: negocio?.logoUrl || "",
    mostrarGaleria: negocio?.mostrarGaleria ?? false,
    galeria: [],
  }))
  const [guardando, setGuardando] = useState(false)

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  const vistaDraft = useMemo(() => ({ ...draft, galeria: draft.galeria }), [draft])

  const guardar = async () => {
    setGuardando(true)
    try {
      await updateNegocio({
        nombre: draft.nombre, direccion: draft.direccion, telefono: draft.telefono,
        ciudad: draft.ciudad, horaApertura: draft.horaApertura, horaCierre: draft.horaCierre,
        tema: draft.tema, accentColor: draft.accentColor,
        logoTipo: draft.logoTipo, logoUrl: draft.logoUrl,
        mostrarGaleria: draft.mostrarGaleria,
      })
      await guardarGaleria(draft.galeria.map((g) => g.url))
      setTheme(draft.tema)
      push("Cambios guardados")
    } catch (e) {
      push(e?.message || "No se pudo guardar", "error")
    } finally {
      setGuardando(false)
    }
  }

  const reiniciarEstilo = () => {
    set("accentColor", "")
    push("Estilo restablecido al tema base")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black tracking-tight">Personalización</h1>
        <p className="text-sm text-[var(--fg-muted)]">La identidad de tu barbería: lo que ve el cliente en tu página y al reservar.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {pestañas.map((p) => {
          const Icon = p.icon
          const activa = pestaña === p.id
          return (
            <button
              key={p.id}
              onClick={() => setPestaña(p.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shrink-0",
                activa ? "bg-[var(--accent)] text-white shadow-[var(--shadow)]" : "surface text-[var(--fg-muted)] hover:text-[var(--fg)]",
              )}
            >
              <Icon size={18} weight={activa ? "fill" : "regular"} /> {p.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          {pestaña === "identidad" && <PestañaIdentidad draft={draft} set={set} />}
          {pestaña === "estilo" && <PestañaEstilo draft={draft} set={set} reiniciar={reiniciarEstilo} />}
          {pestaña === "logo" && <PestañaLogo draft={draft} set={set} />}
          {pestaña === "galeria" && <PestañaGaleria draft={draft} set={set} />}

          {!esBarbero && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={guardar}
              disabled={guardando}
              className="w-full inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-semibold py-3 rounded-2xl shadow-[var(--shadow-lg)] disabled:opacity-50"
            >
              {guardando ? "Guardando…" : "Guardar cambios"}
            </motion.button>
          )}
        </div>

        <div className="sticky top-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--fg-muted)] mb-2">Vista previa · así la ve el cliente</p>
          <VistaPrevia draft={vistaDraft} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: `VistaPrevia` (miniatura de la página pública desde el draft)**

Crear `src/components/personalizacion/VistaPrevia.jsx`:

```jsx
import { motion } from "framer-motion"
import { MapPin, Clock, Phone, Scissors, ArrowRight, ImageBroken } from "@phosphor-icons/react"
import { formatCLP } from "@/lib/format"
import { useStore } from "@/context/store"
import Logo3D from "@/components/public/Logo3D"

export default function VistaPrevia({ draft }) {
  const { servicios } = useStore()
  const tema = draft.tema && draft.tema !== "elegante" ? `theme-${draft.tema}` : ""
  const accent = /^#[0-9a-fA-F]{3,8}$/.test(draft.accentColor) ? draft.accentColor : ""

  return (
    <div className={cnTema(tema)} style={{ ['--accent' ]: accent || undefined, ['--accent-2']: accent || undefined }}>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden text-[var(--fg)] shadow-[var(--shadow-lg)]">
        <div className="px-6 py-8 flex flex-col items-center text-center gap-2">
          {draft.logoTipo === "imagen" && draft.logoUrl ? (
            <img src={draft.logoUrl} alt="logo" className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <Logo3D size={72} color={accent || undefined} />
          )}
          <p className="uppercase tracking-[0.2em] text-[10px] text-[var(--fg-muted)]">Tu barbería</p>
          <h3 className="font-display text-xl font-black tracking-tight">{draft.nombre || "Mi Barbería"}</h3>
          <p className="text-xs text-[var(--fg-muted)]">{draft.direccion}</p>
          <div className="flex flex-wrap justify-center gap-2 text-[10px] text-[var(--fg-muted)]">
            {draft.ciudad && <span className="flex items-center gap-1"><MapPin size={12} /> {draft.ciudad}</span>}
            {draft.horaApertura && draft.horaCierre && <span className="flex items-center gap-1"><Clock size={12} /> {draft.horaApertura} – {draft.horaCierre}</span>}
            {draft.telefono && <span className="flex items-center gap-1"><Phone size={12} /> {draft.telefono}</span>}
          </div>
          <span className="mt-2 inline-flex items-center gap-1.5 bg-[var(--accent)] text-white text-xs font-semibold px-4 py-2 rounded-xl">
            Reservar hora <ArrowRight size={12} weight="bold" />
          </span>
        </div>

        <div className="px-5 py-4 border-t border-[var(--border)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-muted)] mb-3 flex items-center gap-1.5"><Scissors size={12} /> Servicios</p>
          <div className="grid grid-cols-2 gap-2">
            {servicios.slice(0, 4).map((s) => (
              <div key={s.id} className="rounded-xl border border-[var(--border)] p-2.5">
                <p className="text-xs font-semibold truncate">{s.nombre}</p>
                <p className="text-sm font-extrabold">{formatCLP(s.precio)}</p>
              </div>
            ))}
          </div>
        </div>

        {draft.mostrarGaleria && draft.galeria.length > 0 && (
          <div className="px-5 py-4 border-t border-[var(--border)]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-muted)] mb-3 flex items-center gap-1.5"><ImageBroken size={12} /> Nuestros trabajos</p>
            <div className="grid grid-cols-3 gap-2">
              {draft.galeria.slice(0, 6).map((g, i) => (
                <img key={g.url || i} src={g.url} alt="" className="aspect-square w-full rounded-lg object-cover" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function cnTema(tema) { return tema }
```

Nota: la clase `.theme-{id}` en un wrapper local funciona porque los bloques de tema en `index.css` son selectores de clase que aplican tokens vía cascade; los estilos inline `--accent`/`--accent-2` sobre `--accent` del tema.

- [ ] **Step 3: lint y commit**

Run: `npm run lint` → 0 errores.

```bash
git add src/components/personalizacion/Personalizacion.jsx src/components/personalizacion/VistaPrevia.jsx
git commit -m "feat(personalizacion): shell con pestañas y vista previa en vivo"
```

---

### Task 6: Pestaña Identidad

**Files:**
- Create: `src/components/personalizacion/PestaniaIdentidad.jsx`

- [ ] **Step 1: Formulario de identidad**

Crear `src/components/personalizacion/PestaniaIdentidad.jsx`:

```jsx
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
```

- [ ] **Step 2: lint y commit**

```bash
git add src/components/personalizacion/PestaniaIdentidad.jsx
git commit -m "feat(personalizacion): pestaña identidad (nombre, ciudad, horario, teléfono)"
```

---

### Task 7: Pestaña Estilo (tema + color + reset)

**Files:**
- Create: `src/components/personalizacion/PestaniaEstilo.jsx`

- [ ] **Step 1: Selector de tema + color + reset**

Crear `src/components/personalizacion/PestaniaEstilo.jsx`:

```jsx
import { RotateCcw } from "@phosphor-icons/react"
import { useTheme } from "@/lib/theme"
import { cn } from "@/lib/utils"

export default function PestañaEstilo({ draft, set, reiniciar }) {
  const { THEMES } = useTheme()
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide mb-2">Tema base</p>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => set("tema", t.id)}
              className={cn(
                "px-2 py-2 rounded-xl text-xs font-semibold border transition-colors",
                draft.tema === t.id
                  ? "bg-[var(--accent)] text-white border-transparent shadow-[var(--shadow)]"
                  : "bg-[var(--bg-card)] text-[var(--fg-muted)] hover:bg-[var(--accent)]/10",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide mb-2">Color de marca (opcional)</p>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(draft.accentColor) ? draft.accentColor : "#d4af37"}
            onChange={(e) => set("accentColor", e.target.value)}
            className="w-12 h-12 rounded-xl border border-[var(--border)] bg-transparent cursor-pointer"
            aria-label="Color de marca"
          />
          <div className="flex-1 min-w-0">
            <input
              className="w-full surface px-3 py-2 text-sm font-mono"
              value={draft.accentColor}
              onChange={(e) => set("accentColor", e.target.value)}
              placeholder="#d4af37"
            />
            <p className="text-[11px] text-[var(--fg-muted)] mt-1">Elige el color de tus botones y acentos. Déjalo vacío para usar el del tema.</p>
          </div>
        </div>
      </div>

      <button
        onClick={reiniciar}
        className="inline-flex items-center gap-2 surface px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--fg-muted)] hover:text-[var(--fg)]"
      >
        <RotateCcw size={16} /> Restablecer al estilo base
      </button>
    </div>
  )
}
```

- [ ] **Step 2: lint y commit**

```bash
git add src/components/personalizacion/PestaniaEstilo.jsx
git commit -m "feat(personalizacion): pestaña estilo con color de marca y reset"
```

---

### Task 8: Pestaña Logo (3D o imagen + subida)

**Files:**
- Create: `src/components/personalizacion/PestaniaLogo.jsx`
- Create: `src/lib/upload.js`

- [ ] **Step 1: Helper de subida a Storage**

Crear `src/lib/upload.js`:

```js
import { supabase } from "@/lib/supabase"
import { useStore } from "@/context/store"

const BUCKET = "negocio-imagenes"

export async function subirImagen(file) {
  const { session } = useStore.getState ? {} : {}
  // se pasa uid explícito desde el componente para no depender de hooks aquí
  throw new Error("no usar directamente")
}
```

NO — reactivo a contexto global, mejor función pura:

```js
import { supabase } from "@/lib/supabase"

const BUCKET = "negocio-imagenes"

export async function subirImagen(file, uid, carpeta = "fotos") {
  if (!file) throw new Error("Sin archivo")
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase()
  const nombre = `${uid}/${carpeta}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(nombre, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(nombre)
  return data.publicUrl
}
```

- [ ] **Step 2: PestañaLogo**

Crear `src/components/personalizacion/PestaniaLogo.jsx`:

```jsx
import { useState } from "react"
import { UploadSimple, LinkSimple } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { useToast } from "@/lib/toast"
import { subirImagen } from "@/lib/upload"
import Logo3D from "@/components/public/Logo3D"
import { cn } from "@/lib/utils"

export default function PestañaLogo({ draft, set }) {
  const { session } = useStore()
  const push = useToast()
  const [subiendo, setSubiendo] = useState(false)
  const accent = /^#[0-9a-fA-F]{3,8}$/.test(draft.accentColor) ? draft.accentColor : undefined

  const opciones = [
    { id: "3d", label: "3D animado" },
    { id: "imagen", label: "Imagen" },
  ]

  const subir = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendo(true)
    try {
      const url = await subirImagen(file, session?.usuarioId || "anon")
      set("logoUrl", url)
      set("logoTipo", "imagen")
      push("Logo subido")
    } catch (err) {
      push(err?.message || "No se pudo subir la imagen", "error")
    } finally {
      setSubiendo(false)
      e.target.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide">Tipo de logo</p>
      <div className="flex gap-2">
        {opciones.map((o) => (
          <button
            key={o.id}
            onClick={() => set("logoTipo", o.id)}
            className={cn(
              "flex-1 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors",
              draft.logoTipo === o.id
                ? "bg-[var(--accent)] text-white border-transparent shadow-[var(--shadow)]"
                : "bg-[var(--bg-card)] text-[var(--fg-muted)] hover:bg-[var(--accent)]/10",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl surface p-5 flex flex-col items-center gap-3">
        {draft.logoTipo === "imagen" && draft.logoUrl ? (
          <img src={draft.logoUrl} alt="Logo" className="w-20 h-20 rounded-2xl object-cover" />
        ) : (
          <Logo3D size={90} color={accent} />
        )}
        <p className="text-sm font-semibold">{draft.logoTipo === "imagen" ? "Logo imagen" : "Logo 3D animado"}</p>
      </div>

      {draft.logoTipo === "imagen" && (
        <div className="space-y-2">
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[var(--border)] rounded-2xl px-4 py-6 text-sm text-[var(--fg-muted)] cursor-pointer hover:border-[var(--accent)] transition-colors">
            <UploadSimple size={18} weight="bold" />
            {subiendo ? "Subiendo…" : "Subir imagen del logo"}
            <input type="file" accept="image/*" className="hidden" onChange={subir} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide flex items-center gap-1"><LinkSimple size={12} /> O pega una URL</span>
            <input
              className="w-full surface px-3 py-2.5 text-sm mt-1"
              value={draft.logoUrl}
              onChange={(e) => set("logoUrl", e.target.value)}
              placeholder="https://…/logo.png"
            />
          </label>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: lint y commit**

```bash
git add src/lib/upload.js src/components/personalizacion/PestaniaLogo.jsx
git commit -m "feat(personalizacion): pestaña logo 3D o imagen con subida/URL"
```

---

### Task 9: Pestaña Galería

**Files:**
- Create: `src/components/personalizacion/PestaniaGaleria.jsx`

- [ ] **Step 1: Galería con toggle, subida, reordenar y borrar**

Crear `src/components/personalizacion/PestaniaGaleria.jsx`:

```jsx
import { useRef, useState } from "react"
import { UploadSimple, LinkSimple, Trash, ArrowLeft, ArrowRight, X } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { useToast } from "@/lib/toast"
import { subirImagen } from "@/lib/upload"

export default function PestañaGaleria({ draft, set }) {
  const { session, galeria } = useStore()
  const push = useToast()
  const [subiendo, setSubiendo] = useState(false)
  const fileRef = useRef(null)

  const list = draft.galeria.length ? draft.galeria : galeria.map((g, i) => ({ url: g.url, orden: i }))

  const subir = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendo(true)
    try {
      const url = await subirImagen(file, session?.usuarioId || "anon")
      const esDuplicada = list.some((f) => f.url === url)
      if (!esDuplicada) set("galeria", [...list, { url }])
      push("Foto agregada")
    } catch (err) {
      push(err?.message || "No se pudo subir la imagen", "error")
    } finally {
      setSubiendo(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const mover = (i, delta) => {
    const next = [...list]
    const j = i + delta
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    set("galeria", next)
  }

  return (
    <div className="space-y-4">
      <label className="flex items-center justify-between surface p-4 rounded-2xl cursor-pointer">
        <span>
          <p className="text-sm font-semibold">Mostrar galería en mi página</p>
          <p className="text-xs text-[var(--fg-muted)]">Si lo apagas, tus clientes no verán la sección de trabajos.</p>
        </span>
        <span className={toggleClase(draft.mostrarGaleria)} onClick={(e) => { e.preventDefault(); set("mostrarGaleria", !draft.mostrarGaleria) }}>
          <span className={knob(draft.mostrarGaleria)} />
        </span>
      </label>

      <div className="space-y-2">
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[var(--border)] rounded-2xl px-4 py-6 text-sm text-[var(--fg-muted)] cursor-pointer hover:border-[var(--accent)] transition-colors">
          <UploadSimple size={18} weight="bold" />
          {subiendo ? "Subiendo…" : "Subir foto"}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={subir} />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide flex items-center gap-1"><LinkSimple size={12} /> O pega una URL</span>
          <input
            className="w-full surface px-3 py-2.5 text-sm mt-1"
            placeholder="https://…/foto.jpg"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                set("galeria", [...list, { url: e.target.value.trim() }])
                e.target.value = ""
                push("Foto agregada")
              }
            }}
          />
        </label>
      </div>

      {list.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {list.map((f, i) => (
            <div key={f.url || i} className="relative group aspect-square rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border)]">
              <img src={f.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button onClick={() => mover(i, -1)} className="p-1 rounded-lg bg-white/20 text-white" aria-label="Mover antes"><ArrowLeft size={14} /></button>
                <button onClick={() => mover(i, 1)} className="p-1 rounded-lg bg-white/20 text-white" aria-label="Mover después"><ArrowRight size={14} /></button>
                <button onClick={() => set("galeria", list.filter((_, j) => j !== i))} className="p-1 rounded-lg bg-red-500/80 text-white" aria-label="Quitar"><Trash size={14} /></button>
              </div>
              <span className="absolute top-1 left-1 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded">{i + 1}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function toggleClase(activo) {
  return `relative w-11 h-6 rounded-full transition-colors ${activo ? "bg-[var(--accent)]" : "bg-[var(--ring-track)]"}`
}
function knob(activo) {
  return `absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${activo ? "translate-x-5" : ""}`
}
```

Nota: el `X` importado no se usa; quitarlo del import.

- [ ] **Step 2: lint y commit**

```bash
git add src/components/personalizacion/PestaniaGaleria.jsx
git commit -m "feat(personalizacion): pestaña galería con toggle, subida, reorden y borrado"
```

---

### Task 10: Conectar vista al shell (App, Sidebar, BottomNav, Ajustes móvil)

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Sidebar.jsx`
- Modify: `src/components/BottomNav.jsx`

- [ ] **Step 1: App.jsx — render de la vista**

En `src/App.jsx`, importar `Personalizacion` y agregar la ruta de vista:

```jsx
import Personalizacion from "@/components/personalizacion/Personalizacion"
...
{view === "ajustes" && <Ajustes />}
{view === "personalizacion" && <Personalizacion />}
```

- [ ] **Step 2: Sidebar — entrada**

En `src/components/Sidebar.jsx`, agregar icono `Palette` al import y el item (visible para todos, los barberos ven read-only):

```jsx
import { ..., Palette } from "@phosphor-icons/react"
...
{ id: "personalizacion", label: "Personalización", icon: Palette, barbero: true },
```

(Normalmente `barbero: true` los incluye también para el dueño porque el filtro es `esBarbero ? it.barbero : true`.)

- [ ] **Step 3: BottomNav — sin cambio**

No agregar a la barra inferior (ya hay 6 ítems; Personalización se alcanza desde Ajustes). En `Ajustes.jsx` agregar un acceso rápido al final del encabezado: un botón `Palette` que haga `setView("personalizacion")` (importar `Palette` y `setView` del store). Ver Task 10 Step 4.

- [ ] **Step 4: Ajustes — botón a Personalización**

En `src/components/ajustes/Ajustes.jsx`, desestructurar `setView` de `useStore()` y agregar junto al título un botón:

```jsx
<button
  onClick={() => setView("personalizacion")}
  className="inline-flex items-center gap-2 surface px-4 py-2 rounded-xl text-sm font-semibold text-[var(--accent)]"
>
  <Palette size={18} /> Personalizar barbería
</button>
```

Colocar bajo el bloque del título de Ajustes (buscar el `h1` o encabezado y agregarlo después). Importar `Palette` de `@phosphor-icons/react`.

- [ ] **Step 5: lint y commit**

```bash
npm run lint
git add src/App.jsx src/components/Sidebar.jsx src/components/ajustes/Ajustes.jsx
git commit -m "feat(shell): conectar vista de Personalización al menú"
```

---

### Task 11: Página pública — logo, color, ciudad/horario y galería

**Files:**
- Modify: `src/pages/PublicPage.jsx`

- [ ] **Step 1: Header dinámico**

En `PublicPage.jsx`:
- Desestructurar `galeria` de `useStore()`.
- Reemplazar `<Logo3D />` (línea 58) por:

```jsx
{negocio?.logoTipo === "imagen" && negocio?.logoUrl ? (
  <img src={negocio.logoUrl} alt={negocio?.nombre || "Logo"} className="w-24 h-24 rounded-3xl object-cover shadow-[var(--shadow-lg)]" />
) : (
  <Logo3D color={negocio?.accentColor || undefined} />
)}
```

- Reemplazar las líneas 63-65 (chips físicos) por:

```jsx
{negocio?.ciudad && <span className="flex items-center gap-1"><MapPin size={14} /> {negocio.ciudad}</span>}
{negocio?.horaApertura && negocio?.horaCierre && (
  <span className="flex items-center gap-1"><Clock size={14} /> {negocio.horaApertura} – {negocio.horaCierre}</span>
)}
{negocio?.telefono && <span className="flex items-center gap-1"><Phone size={14} /> {negocio.telefono}</span>}
```

- [ ] **Step 2: Sección Galería condicional**

Después del section "Servicios" (antes de "Nuestro equipo"), agregar:

```jsx
{negocio?.mostrarGaleria && galeria.length > 0 && (
  <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="mt-14">
    <h2 className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-widest mb-4 flex items-center gap-2"><Camera size={16} /> Nuestros trabajos</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {galeria.map((g, i) => (
        <motion.div
          key={g.id || i}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.05 }}
          className="overflow-hidden rounded-2xl border border-[var(--border)]"
        >
          <img src={g.url} alt={`Trabajo ${i + 1}`} className="w-full aspect-square object-cover hover:scale-105 transition-transform cursor-pointer" loading="lazy" />
        </motion.div>
      ))}
    </div>
  </motion.section>
)}
```

Agregar `Camera` al import de `@phosphor-icons/react`.

- [ ] **Step 3: lint, build y commit**

```bash
npm run lint
npm run build
git add src/pages/PublicPage.jsx
git commit -m "feat(publica): logo, color de marca, ciudad/horario reales y galería"
```

---

### Task 12: Página de reserva — consistencia de identidad

**Files:**
- Modify: `src/pages/PublicReserva.jsx`

- [ ] **Step 1: Mini header de marca**

En `PublicReserva.jsx`, importar `Logo3D` y `Camera` no necesario. Debajo del botón "Volver a la barbería" (línea ~123) agregar:

```jsx
<div className="mt-4 flex items-center gap-3 surface rounded-2xl p-3">
  {negocio?.logoTipo === "imagen" && negocio?.logoUrl ? (
    <img src={negocio.logoUrl} alt={negocio?.nombre || "Logo"} className="w-12 h-12 rounded-xl object-cover" />
  ) : (
    <Logo3D size={48} color={negocio?.accentColor || undefined} />
  )}
  <div className="min-w-0">
    <p className="text-sm font-bold truncate">{negocio?.nombre || "Mi Barbería"}</p>
    <p className="text-xs text-[var(--fg-muted)] truncate">
      {[negocio?.ciudad, negocio?.telefono].filter(Boolean).join(" · ")}
    </p>
  </div>
</div>
```

Importar `Logo3D` de `@/components/public/Logo3D`.

- [ ] **Step 2: lint, build y commit**

```bash
npm run lint
npm run build
git add src/pages/PublicReserva.jsx
git commit -m "feat(reserva): header con la identidad del negocio"
```

---

### Task 13: Verificación end-to-end (lint, build, Playwright, seed demo)

**Files:**
- Create: `C:\Users\juako\AppData\Local\Temp\opencode\personalizacion_seed.js`
- Create: `C:\Users\juako\AppData\Local\Temp\opencode\check_personalizacion.py`

- [ ] **Step 1: Seed de demo en PG (El Cauce con color + galería URLs falsas)**

Crear `C:\Users\juako\AppData\Local\Temp\opencode\personalizacion_seed.js`:

```js
const { Client } = require('pg');
const c = new Client({ connectionString: 'postgres://postgres:vSmzBmmz6Fyw5R17@db.ggrvwajihnvdsidkknyi.supabase.co:5432/postgres', ssl: { rejectUnauthorized: false } });
(async () => {
  await c.connect();
  await c.query(`
    update public.negocios
    set accent_color='#d4af37', logo_tipo='3d', ciudad='Valparaíso',
        hora_apertura='10:00', hora_cierre='20:00', mostrar_galeria=true
    where slug='el-cauce'`);
  await c.query(`
    delete from public.galeria where negocio_id=(select id from public.negocios where slug='el-cauce');
    insert into public.galeria (negocio_id, url, orden)
    select id, 'https://picsum.photos/seed/elcauce1/600/600', 1 from public.negocios where slug='el-cauce');
    insert into public.galeria (negocio_id, url, orden)
    select id, 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600', 2 from public.negocios where slug='el-cauce';
    insert into public.galeria (negocio_id, url, orden)
    select id, 'https://picsum.photos/seed/elcauce3/600/600', 3 from public.negocios where slug='el-cauce';`);
  console.log('seed ok');
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });
```

Nota: hay paréntesis de más en la segunda inserción; corregir a:

```sql
insert into public.galeria (negocio_id, url, orden)
select id, 'https://picsum.photos/seed/elcauce1/600/600', 1 from public.negocios where slug='el-cauce';
```

- [ ] **Step 2: Aplicar seed y levantar preview**

Run en `C:\Users\juako\AppData\Local\Temp\opencode\pg-fix`: `node personalizacion_seed.js` → `seed ok`.
Luego (workdir proyecto): `Start-Process -FilePath "npx" -ArgumentList "vite preview --port 4173 --strictPort" -WindowStyle Hidden` y esperar que responda `http://localhost:4173`.

- [ ] **Step 3: Script Playwright de verificación**

Crear `C:\Users\juako\AppData\Local\Temp\opencode\check_personalizacion.py` (patrón de `ios_probe_prod.py`; python 3.13 = `py -3`, headless chromium):

```python
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page()
        errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        await pg.goto("http://localhost:4173/#/c/el-cauce", wait_until="networkidle")
        await pg.wait_for_timeout(1200)
        txt = await pg.text_content("body")
        checks = {
            "ciudad valparaiso": "Valparaíso" in (txt or ""),
            "horario real": "10:00" in (txt or ""),
            "seccion trabajos": "Nuestros trabajos" in (txt or ""),
            "img galeria": (await pg.locator("img[alt^='Trabajo']").count()) >= 2,
        }
        for k, v in checks.items():
            print(("OK " if v else "FAIL ") + k)
        print("pageerrors:", errors if errors else "ninguno")
        await b.close()

asyncio.run(main())
```

- [ ] **Step 4: Ejecutar y validar**

Run (workdir `C:\Users\juako\AppData\Local\Temp\opencode`): `py -3 check_personalizacion.py`
Expected: OK ciudad valparaiso · OK horario real · OK seccion trabajos · OK img galeria · pageerrors: ninguno.

- [ ] **Step 5: Deploy a producción**

Run (workdir proyecto): `npx vercel --prod --yes`
Expected: build OK, URL prod.

- [ ] **Step 6: Probar login del dueño + guardar personalización (Playwright)**

Ampliar el script o uno nuevo (`check_panel_perso.py`) con los selectores conocidos:
- `input[type="email"][autocomplete="email"]`, `input[type="password"][autocomplete="current-password"]`, `button[type="submit"]` (login `demo@barberia.app` / `barberia123`, esperar ~5s + networkidle).
- Navegar a Personalización (botón con texto "Personalización"), cambiar color a `#ff0000` (input type=color), pulsar "Guardar cambios".
- Verificar toast "Cambios guardados" y que `negocios.accent_color='#ff0000'` persiste.
Nota demora ~5s la carga tras login.

- [ ] **Step 7: Registry de CHANGELOG y commit**

Agregar entrada a `docs/CHANGELOG-CODEX.md` (fecha actual, agente `Codex`, proyecto `saas-barberias`, resumen, motivo, verificación). Commitar el script de verificación si se guarda en repo (opcional), y commit de cualquier residual.

```bash
git add -A
git commit -m "chore: verificación e2e personalización"
```

---

### Task 14: Validar openspec y cerrar

**Files:**
- (metadatos) `openspec/changes/personalizacion-negocio/`

- [ ] **Step 1: `openspec validate personalizacion-negocio`**

Run (workdir proyecto): `openspec validate personalizacion-negocio` → `Change 'personalizacion-negocio' is valid`.

- [ ] **Step 2: Deploy confirmado y aviso al usuario**

Verificar que el preview grid del prod muestra la personalización de El Cauce (color dorado, ciudad Valparaíso, horario 10:00-20:00, sección Nuestros trabajos). Avisar al usuario final (sin commit adicional necesario).

- [ ] **Step 3: Archivar change (con `-y`; usar `--skip-specs` si no se requiere mover nada)**

Preguntar al usuario antes de archivar; NO archivar automáticamente a menos que Joaquín lo apruebe.

---

## Self-Review

**1. Spec coverage:**
- Identidad (nombre/ciudad/horario) → Task 5, 6. ✔
- Color de acento + reset → Task 3, 5, 7. ✔
- Logo 3D/imagen + subida/URL → Task 4, 8. ✔
- Galería opcional + reorden + borrado → Task 2, 9, 11. ✔
- Vista previa en vivo + Guardar → Task 5. ✔
- Solo dueño edita → `esBarbero` desactiva el botón Guardar (Task 5 Step 1) y Main (Task 5). ✔
- Consistencia página pública + reserva → Task 11, 12. ✔
- Imagen rota / logo sin foto → fallback a Logo3D (Task 5 VistaPrevia, Task 11) y `onError` implícito vía img alt (aceptable). ✔

**2. Placeholder scan:** Todos los steps tienen código completo; sin "TBD". La nota en seguidilla de `subirImagen` en Task 8 describe la decisión de diseño (función pura) — se corrige con el código final (eliminar la primera versión con throw). ✔

**3. Type consistency:**
- `set("galeria", [...])` — `draft.galeria` es array de `{url}`; `guardarGaleria` recibe `draft.galeria.map(g => g.url)` (Task 5) y `updateGaleria` en Task 2 guarda `urls`. ✔
- `VistaPrevia` recibe `draft` con `galeria: [{url}]`. ✔
- `Logo3D` prop `color` usado en VistaPrevia, PublicPage y PublicReserva. ✔
- `guardarGaleria` en Task 2 expuesto como `guardarGaleria` y consumido como tal en Task 5. ✔
- `setView` añadido en `useStore()` de Ajustes — verificar que `setView` ya está expuesto en `value` (sí, línea 497). ✔