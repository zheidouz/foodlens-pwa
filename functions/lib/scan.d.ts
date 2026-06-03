export interface ProductData {
    product_name: string;
    brands: string;
    nutriments: Record<string, number>;
    ingredients: string[];
    nova_group: number | null;
    additives: string[];
    allergens: string[];
    ecoscore: string | null;
    nutriscore: string | null;
    [key: string]: unknown;
}
export interface AnalyzedProduct {
    product_name: string;
    nutriments: Record<string, number>;
    ingredients: string[];
    nova_group: number | null;
    additives: string[];
}
export declare function lookUpBarcodeHandler(barcode: string): Promise<ProductData>;
export declare function analyzeFoodImageHandler(imageBase64: string, mimeType: string): Promise<AnalyzedProduct>;
