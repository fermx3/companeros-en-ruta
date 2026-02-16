import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'image/webp',
]

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 2. Get user profile + brand role
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_roles!user_roles_user_profile_id_fkey(
          brand_id,
          role,
          status
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const brandRole = userProfile.user_roles.find(
      (r: { role: string; status: string }) =>
        r.status === 'active' && ['brand_manager', 'brand_admin'].includes(r.role)
    )

    if (!brandRole || !brandRole.brand_id) {
      return NextResponse.json({ error: 'Sin permisos de marca' }, { status: 403 })
    }

    const brandId = brandRole.brand_id

    // 3. Parse FormData
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })
    }

    // 4. Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Usa PNG, JPEG, SVG o WebP.' },
        { status: 400 }
      )
    }

    // 5. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'El archivo excede el tamaño máximo de 2MB.' },
        { status: 400 }
      )
    }

    // 6. Get current brand to check for existing logo in storage
    const { data: currentBrand } = await supabase
      .from('brands')
      .select('logo_url')
      .eq('id', brandId)
      .single()

    // 7. Upload file
    const fileExt = file.name.split('.').pop() || 'png'
    const timestamp = Date.now()
    const fileName = `${brandId}/${timestamp}-logo.${fileExt}`

    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('brand-logos')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading logo:', uploadError)
      return NextResponse.json(
        { error: 'Error al subir archivo', details: uploadError.message },
        { status: 500 }
      )
    }

    // 8. Get public URL
    const { data: urlData } = supabase.storage
      .from('brand-logos')
      .getPublicUrl(uploadData.path)

    const newLogoUrl = urlData.publicUrl

    // 9. Update brand record
    const { error: updateError } = await supabase
      .from('brands')
      .update({ logo_url: newLogoUrl, updated_at: new Date().toISOString() })
      .eq('id', brandId)

    if (updateError) {
      console.error('Error updating brand logo_url:', updateError)
      // Rollback: delete uploaded file
      await supabase.storage.from('brand-logos').remove([uploadData.path])
      return NextResponse.json(
        { error: 'Error al actualizar marca', details: updateError.message },
        { status: 500 }
      )
    }

    // 10. Delete old logo from storage (if it was in our bucket)
    if (currentBrand?.logo_url && currentBrand.logo_url.includes('/brand-logos/')) {
      try {
        const oldPath = currentBrand.logo_url.split('/brand-logos/')[1]
        if (oldPath) {
          await supabase.storage.from('brand-logos').remove([decodeURIComponent(oldPath)])
        }
      } catch {
        // Non-critical: old file cleanup failed, continue
        console.warn('Could not delete old logo file')
      }
    }

    return NextResponse.json({ logo_url: newLogoUrl })
  } catch (error) {
    console.error('Error in POST /api/brand/logo:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
