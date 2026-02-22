import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveIdColumn } from '@/lib/utils/public-id'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET: Retrieve evidence photos for a visit
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: visitId } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!userProfile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
  }

  // Verify visit belongs to the promotor
  const { data: visit, error: visitError } = await supabase
    .from('visits')
    .select('id')
    .eq(resolveIdColumn(visitId), visitId)
    .eq('promotor_id', userProfile.id)
    .is('deleted_at', null)
    .single()

  if (visitError || !visit) {
    return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
  }

  // Fetch evidence
  const { data: evidence, error } = await supabase
    .from('visit_evidence')
    .select('*')
    .eq('visit_id', visit.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching evidence:', error)
    return NextResponse.json({ error: 'Error fetching evidence' }, { status: 500 })
  }

  return NextResponse.json({ evidence: evidence || [] })
}

// POST: Upload evidence photo
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: visitId } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('id, tenant_id')
    .eq('user_id', user.id)
    .single()

  if (!userProfile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
  }

  // Verify visit belongs to the promotor and is in progress
  const { data: visit, error: visitError } = await supabase
    .from('visits')
    .select('id, visit_status')
    .eq(resolveIdColumn(visitId), visitId)
    .eq('promotor_id', userProfile.id)
    .is('deleted_at', null)
    .single()

  if (visitError || !visit) {
    return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
  }

  if (visit.visit_status !== 'in_progress') {
    return NextResponse.json({ error: 'Visit must be in progress to upload evidence' }, { status: 400 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const evidenceStage = formData.get('evidence_stage') as string
    const evidenceType = formData.get('evidence_type') as string | null
    const caption = formData.get('caption') as string | null
    const captureLatitude = formData.get('capture_latitude') as string | null
    const captureLongitude = formData.get('capture_longitude') as string | null

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    if (!evidenceStage) {
      return NextResponse.json({ error: 'Evidence stage is required' }, { status: 400 })
    }

    // Generate unique file name (use resolved UUID for storage path)
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 10)
    const fileName = `${visit.id}/${evidenceStage}/${timestamp}-${randomId}.${fileExt}`

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('visit-evidence')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return NextResponse.json({ error: 'Error uploading file', details: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('visit-evidence')
      .getPublicUrl(uploadData.path)

    // Save metadata to database
    const { data: evidence, error: insertError } = await supabase
      .from('visit_evidence')
      .insert({
        visit_id: visit.id,
        tenant_id: userProfile.tenant_id,
        evidence_stage: evidenceStage,
        evidence_type: evidenceType || null,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size_bytes: file.size,
        mime_type: file.type,
        caption: caption || null,
        capture_latitude: captureLatitude ? parseFloat(captureLatitude) : null,
        capture_longitude: captureLongitude ? parseFloat(captureLongitude) : null,
        captured_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error saving evidence metadata:', insertError)
      // Try to delete the uploaded file since we couldn't save metadata
      await supabase.storage.from('visit-evidence').remove([uploadData.path])
      return NextResponse.json({ error: 'Error saving evidence metadata', details: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ evidence })
  } catch (error) {
    console.error('Error processing evidence upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Remove evidence photo (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id: visitId } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!userProfile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const evidenceId = searchParams.get('evidence_id')

  if (!evidenceId) {
    return NextResponse.json({ error: 'Evidence ID is required' }, { status: 400 })
  }

  // Verify visit belongs to the promotor
  const { data: visit } = await supabase
    .from('visits')
    .select('id')
    .eq(resolveIdColumn(visitId), visitId)
    .eq('promotor_id', userProfile.id)
    .is('deleted_at', null)
    .single()

  if (!visit) {
    return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
  }

  // Soft delete the evidence
  const { error: deleteError } = await supabase
    .from('visit_evidence')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', evidenceId)
    .eq('visit_id', visit.id)

  if (deleteError) {
    console.error('Error deleting evidence:', deleteError)
    return NextResponse.json({ error: 'Error deleting evidence' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
