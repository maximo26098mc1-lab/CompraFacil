-- ==============================================================================
-- CompraFácil v2 - Migración: Tabla 'listings' y Políticas de Supabase Storage
-- ==============================================================================
-- Este archivo crea la tabla 'listings' con RLS estricto y configura el bucket
-- 'listing-photos' en Supabase Storage con permisos de escritura para el dueño.
-- ==============================================================================

-- 1. TABLA DE ANUNCIOS (LISTINGS)
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_name TEXT,
    title TEXT NOT NULL CHECK (char_length(title) >= 5),
    description TEXT,
    category TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    condition TEXT NOT NULL CHECK (condition IN ('nuevo', 'usado')),
    province TEXT NOT NULL,
    city TEXT NOT NULL,
    whatsapp TEXT NOT NULL CHECK (whatsapp ~ '^[0-9]{10,15}$'), -- Formato numérico internacional E.164
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

-- Índices para optimizar consultas frecuentes en catálogo y panel
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);

-- Habilitar RLS (Row Level Security) en listings
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS PARA 'listings':

-- 1.1 Lectura: Los usuarios con sesión iniciada pueden ver los anuncios publicados ('disponible', 'vendido') y sus propios anuncios
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver anuncios publicados" ON public.listings;
CREATE POLICY "Usuarios autenticados pueden ver anuncios publicados"
    ON public.listings
    FOR SELECT
    TO authenticated
    USING (status IN ('disponible', 'vendido') OR auth.uid() = user_id);

-- 1.2 Inserción: Los usuarios autenticados pueden crear sus propios anuncios
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear sus anuncios" ON public.listings;
CREATE POLICY "Usuarios autenticados pueden crear sus anuncios"
    ON public.listings
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 1.3 Modificación: Solo el autor puede editar su propio anuncio
DROP POLICY IF EXISTS "Solo el autor puede editar sus anuncios" ON public.listings;
CREATE POLICY "Solo el autor puede editar sus anuncios"
    ON public.listings
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 1.4 Eliminación: Solo el autor puede eliminar su propio anuncio
DROP POLICY IF EXISTS "Solo el autor puede eliminar sus anuncios" ON public.listings;
CREATE POLICY "Solo el autor puede eliminar sus anuncios"
    ON public.listings
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- ==============================================================================
-- 2. POLÍTICAS DE ACCESO PARA BUCKET PRIVADO (listing-photos)
-- ==============================================================================
-- El bucket 'listing-photos' debe crearse previamente como PRIVADO desde el panel
-- de Supabase (Storage > New bucket > Nombre: listing-photos, Public bucket: OFF).

-- 2.1 Lectura Privada:
--     - El dueño puede ver todas sus fotos (en su carpeta user_id/)
--     - Otros usuarios con sesión activa SOLO pueden ver fotos vinculadas a anuncios visibles ('disponible' o 'vendido')
DROP POLICY IF EXISTS "Lectura publica de fotos de anuncios" ON storage.objects;
DROP POLICY IF EXISTS "Lectura de fotos para dueño y usuarios con sesión en anuncios visibles" ON storage.objects;
CREATE POLICY "Lectura de fotos para dueño y usuarios con sesión en anuncios visibles"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'listing-photos'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR
            EXISTS (
                SELECT 1 FROM public.listings
                WHERE listings.image_url = storage.objects.name
                  AND listings.status IN ('disponible', 'vendido')
                  AND listings.user_id::text = (storage.foldername(storage.objects.name))[1]
            )
        )
    );

-- 2.2 Inserción: Solo el dueño autenticado puede subir fotos a su propia carpeta (prefijo: user_id/)
DROP POLICY IF EXISTS "Solo el dueño puede subir fotos a su carpeta" ON storage.objects;
CREATE POLICY "Solo el dueño puede subir fotos a su carpeta"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'listing-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 2.3 Modificación: Solo el dueño autenticado puede actualizar fotos en su carpeta
DROP POLICY IF EXISTS "Solo el dueño puede actualizar sus fotos" ON storage.objects;
CREATE POLICY "Solo el dueño puede actualizar sus fotos"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'listing-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 2.4 Eliminación: Solo el dueño autenticado puede eliminar fotos de su carpeta
DROP POLICY IF EXISTS "Solo el dueño puede eliminar sus fotos" ON storage.objects;
CREATE POLICY "Solo el dueño puede eliminar sus fotos"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'listing-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
