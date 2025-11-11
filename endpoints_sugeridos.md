// ============================================================================
// SUPABASE RPC FUNCTIONS & EDGE FUNCTIONS
// ============================================================================

// 1. Crear visita completa
// Edge Function: /api/visits/create
POST /api/visits/create
Input: CreateVisitRequest
Output: CreateVisitResponse

// 2. Actualizar assessment
// RPC Function: update_visit_assessment
CALL update_visit_assessment(visit_id, assessment_data)

// 3. Registrar compras con promociones
// Edge Function: /api/purchases/create
POST /api/purchases/create
Input: CreatePurchaseRequest
Output: CreatePurchaseResponse

// 4. Listar visitas del asesor
// Direct Supabase query
GET clients via Supabase client
Filter: asesor_id = current_user

// 5. Obtener promociones aplicables
// RPC Function: get_applicable_promotions
CALL get_applicable_promotions(client_id, brand_id, purchase_amount?)

// 6. Completar visita
// RPC Function: complete_visit
CALL complete_visit(visit_id)
