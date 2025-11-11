import { createClient } from "@/lib/supabase/client";
import type {
  CreatePurchaseRequest,
  CreatePurchaseResponse,
  CreateVisitRequest,
  CreateVisitResponse,
} from "../types/visits";

type AssessmentProduct = {
  product_id: string;
  stock: number;
  price: number;
  notes?: string;
};

export class VisitService {
  private supabase = createClient();

  async createVisit(data: CreateVisitRequest): Promise<CreateVisitResponse> {
    // Generar número de visita secuencial
    const visitNumber = await this.generateVisitNumber();

    const { data: visit, error } = await this.supabase
      .from("visits")
      .insert({
        ...data,
        visit_number: visitNumber,
        status: "in_progress",
        start_time: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { visit_id: "", status: "error", message: error.message };
    }

    return { visit_id: visit.id, status: "success" };
  }

  async updateAssessment(visitId: string, products: AssessmentProduct[]) {
    const assessments = products.map((product) => ({
      visit_id: visitId,
      ...product,
    }));

    const { error } = await this.supabase
      .from("visit_assessments")
      .upsert(assessments, {
        onConflict: "tenant_id,visit_id,product_id",
      });

    if (error) throw error;
    return true;
  }

  async createPurchases(
    data: CreatePurchaseRequest
  ): Promise<CreatePurchaseResponse> {
    // Crear compras
    const purchases = data.items.map((item) => ({
      visit_id: data.visit_id,
      ...item,
      subtotal: item.quantity * item.unit_price,
      total_amount:
        item.quantity * item.unit_price - (item.discount_amount || 0),
    }));

    const { data: createdPurchases, error: purchaseError } = await this.supabase
      .from("visit_purchases")
      .insert(purchases)
      .select();

    if (purchaseError) {
      return {
        purchase_ids: [],
        applied_promotions: [],
        total_amount: 0,
        final_amount: 0,
        status: "error",
      };
    }

    // Aplicar promociones si se solicita
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let appliedPromotions: any[] = [];
    if (data.apply_promotions) {
      appliedPromotions = await this.applyPromotions(
        data.visit_id,
        createdPurchases
      );
    }

    const totalAmount = createdPurchases.reduce(
      (sum, p) => sum + p.total_amount,
      0
    );
    const totalDiscount = appliedPromotions.reduce(
      (sum, p) => sum + p.discount_amount,
      0
    );

    return {
      purchase_ids: createdPurchases.map((p) => p.id),
      applied_promotions: appliedPromotions,
      total_amount: totalAmount,
      final_amount: totalAmount - totalDiscount,
      status: "success",
    };
  }

  private async generateVisitNumber(): Promise<string> {
    // Implementar lógica de número secuencial
    const today = new Date().toISOString().split("T")[0];
    const { count } = await this.supabase
      .from("visits")
      .select("*", { count: "exact", head: true })
      .eq("visit_date", today);

    return `V${today.replace(/-/g, "")}-${(count || 0) + 1}`;
  }

  private async applyPromotions(
    visitId: string,
    purchases: unknown[]
  ): Promise<unknown[]> {
    // Lógica para aplicar promociones automáticamente
    // Esto se implementará en detalle en días posteriores
    return [];
  }
}
