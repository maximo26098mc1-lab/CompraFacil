-- ==============================================================================
-- CompraFácil v2 - Esquema de Base de Datos y Políticas RLS (Supabase / PostgreSQL)
-- ==============================================================================

-- 0. TABLA DE PERFILES DE USUARIOS (SUPABASE AUTH)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role = 'user'), -- Impide elevar permisos
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS estricto en perfiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política 1: Un usuario solo puede consultar su propio perfil (impide consultar perfiles ajenos)
CREATE POLICY "Los usuarios solo pueden consultar su propio perfil"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Política 2: Un usuario solo puede actualizar su propio perfil (nombre y teléfono)
CREATE POLICY "Los usuarios solo pueden actualizar su propio perfil"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Trigger del sistema (SECURITY DEFINER) para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        'user' -- Siempre usuario común
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 1. TABLA DE ANUNCIOS CLASIFICADOS
CREATE TABLE IF NOT EXISTS public.anuncios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(title) >= 5),
    description TEXT,
    category TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    condition TEXT NOT NULL CHECK (condition IN ('nuevo', 'usado')),
    province TEXT NOT NULL,
    city TEXT NOT NULL,
    whatsapp TEXT NOT NULL CHECK (whatsapp ~ '^[0-9]{10,15}$'), -- Número normalizado internacional
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    status TEXT NOT NULL DEFAULT 'disponible' CHECK (status IN ('disponible', 'vendido', 'retirado')),
    image_url TEXT,
    terms_accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    terms_version TEXT NOT NULL DEFAULT 'v2.0-draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security (RLS) en anuncios
ALTER TABLE public.anuncios ENABLE ROW LEVEL SECURITY;

-- Lectura pública: cualquiera puede ver anuncios disponibles o vendidos
CREATE POLICY "Lectura pública de anuncios vigentes"
    ON public.anuncios
    FOR SELECT
    USING (status IN ('disponible', 'vendido'));

-- Inserción: usuarios autenticados pueden crear sus anuncios
CREATE POLICY "Usuarios autenticados pueden publicar anuncios"
    ON public.anuncios
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Modificación: sólo el propietario puede editar o cambiar estado de su anuncio
CREATE POLICY "Propietarios pueden modificar sus propios anuncios"
    ON public.anuncios
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Eliminación: sólo el propietario puede retirar su anuncio
CREATE POLICY "Propietarios pueden eliminar sus anuncios"
    ON public.anuncios
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- 2. TABLA DE REPORTES DE PUBLICACIÓN (Enviados por usuarios)
CREATE TABLE IF NOT EXISTS public.reportes_publicaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anuncio_id UUID NOT NULL REFERENCES public.anuncios(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('bien_sospechoso', 'datos_falsos', 'estafa_previa', 'otro')),
    details TEXT NOT NULL CHECK (char_length(details) >= 10),
    reporter_email TEXT,
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'analizado', 'descartado')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reportes_publicaciones ENABLE ROW LEVEL SECURITY;

-- Cualquier visitante puede enviar un reporte
CREATE POLICY "Visitantes pueden enviar reportes de anuncios"
    ON public.reportes_publicaciones
    FOR INSERT
    WITH CHECK (true);


-- 3. MÓDULO RESTRINGIDO PARA AUTORIDADES ACREDITADAS
-- Tabla de Fichas de Bienes Buscados (Datos Ficticios en Desarrollo)
CREATE TABLE IF NOT EXISTS public.fichas_seguridad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_reference TEXT NOT NULL,
    organism TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    color TEXT,
    serial_number TEXT,
    photo_url TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'activa' CHECK (status IN ('activa', 'recuperado', 'archivada')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fichas_seguridad ENABLE ROW LEVEL SECURITY;

-- Solo usuarios con rol institucional 'authority' en app_metadata pueden ver/crear fichas
CREATE POLICY "Acceso restringido a autoridades para fichas de seguridad"
    ON public.fichas_seguridad
    FOR ALL
    TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'authority')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'authority');


-- 4. TABLA DE ALERTAS Y COINCIDENCIAS PRIVADAS
CREATE TABLE IF NOT EXISTS public.coincidencias_alertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ficha_id UUID NOT NULL REFERENCES public.fichas_seguridad(id) ON DELETE CASCADE,
    anuncio_id UUID NOT NULL REFERENCES public.anuncios(id) ON DELETE CASCADE,
    match_type TEXT NOT NULL CHECK (match_type IN ('identificador_exacto', 'similitud_texto')),
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'revisada', 'descartada')),
    evidence_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coincidencias_alertas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso restringido a autoridades para alertas de coincidencias"
    ON public.coincidencias_alertas
    FOR ALL
    TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'authority')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'authority');
