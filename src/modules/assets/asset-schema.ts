import { z } from "zod";
import { Paise } from "../../shared/types/money";

export const AssetTypeEnum = z.enum([
  "WATER_JAR_20L",
  "TIFFIN_BOX_STEEL",
  "MILK_CRATE",
]);

export type AssetType = z.infer<typeof AssetTypeEnum>;

export interface AssetHolding {
  tenantId: string;
  customerId: string;
  assetType: AssetType;
  holdingCount: number; // Number of physical containers customer currently holds
  depositPerUnitPaise: Paise;
  totalDepositHeldPaise: Paise;
  updatedAt: string;
}

export interface AssetLedgerEntry {
  id: string;
  tenantId: string;
  customerId: string;
  assetType: AssetType;
  quantityDelivered: number;
  quantityCollected: number;
  netDelta: number;
  resultingHoldingCount: number;
  fulfillmentId?: string;
  notes?: string;
  createdAt: string;
}

export const RecordAssetExchangeSchema = z.object({
  tenantId: z.string().min(1),
  customerId: z.string().min(1),
  assetType: AssetTypeEnum,
  quantityDelivered: z.number().int().min(0).default(0),
  quantityCollected: z.number().int().min(0).default(0),
  fulfillmentId: z.string().optional(),
  notes: z.string().optional(),
});

export type RecordAssetExchangeInput = z.infer<typeof RecordAssetExchangeSchema>;
