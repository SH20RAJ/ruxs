import { z } from "zod";
import { Paise, toPaise } from "../../shared/types/money";

export const ServiceCategoryEnum = z.enum([
  "TIFFIN",
  "WATER",
  "MILK",
  "NEWSPAPER",
  "FLOWERS",
  "LAUNDRY",
  "CAR_CLEANING",
  "WASTE_SCRAP",
]);

export const ProductUnitTypeEnum = z.enum([
  "MEAL",
  "LITER",
  "JAR",
  "PIECE",
  "KG",
  "VISIT",
]);

export const CreateServiceInputSchema = z.object({
  tenantId: z.string().min(1, "Tenant ID is required"),
  category: ServiceCategoryEnum,
  name: z.string().min(2, "Service name is required").max(100).trim(),
  description: z.string().max(300).optional().or(z.literal("")),
  cutoffTimeStr: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Cutoff time must be HH:MM in 24-hour format (e.g. 09:30)")
    .default("09:00"),
  pollTimeStr: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Poll time must be HH:MM in 24-hour format (e.g. 08:30)")
    .default("08:30"),
  lateCancellationFeePercent: z.number().int().min(0).max(100).default(50),
  requiresAssetTracking: z.boolean().default(false),
  allowsQuantityAdjustment: z.boolean().default(true),
  allowsSkip: z.boolean().default(true),
  productName: z.string().min(2, "Product/SKU name is required").max(100).trim(),
  unitType: ProductUnitTypeEnum,
  priceInRupees: z.number().positive("Price must be greater than zero"),
});

export type CreateServiceInput = z.infer<typeof CreateServiceInputSchema>;

export interface ServiceProductItem {
  id: string;
  name: string;
  unitType: z.infer<typeof ProductUnitTypeEnum>;
  basePricePaise: Paise;
  isAddon: boolean;
  isActive: boolean;
}

export interface ServiceDefinition {
  id: string;
  tenantId: string;
  category: z.infer<typeof ServiceCategoryEnum>;
  name: string;
  description?: string;
  cutoffTimeStr: string;
  pollTimeStr: string;
  lateCancellationFeePercent: number;
  requiresAssetTracking: boolean;
  allowsQuantityAdjustment: boolean;
  allowsSkip: boolean;
  products: ServiceProductItem[];
  isActive: boolean;
  createdAt: string;
}
