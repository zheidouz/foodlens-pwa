export interface ReviewRequest {
    product_name: string;
    ingredients: string[];
    nutriments: Record<string, number>;
    nova_group: number | null;
    additives: string[];
    allergens: string[];
}
export interface DeepSeekReview {
    health_score: number;
    nutriscore_estimate: string;
    good_points: {
        point: string;
        reason: string;
    }[];
    bad_points: {
        point: string;
        reason: string;
    }[];
    allergen_warnings: string[];
    alternatives: {
        name: string;
        reason: string;
    }[];
    summary: string;
}
export declare function generateReview(data: ReviewRequest): Promise<DeepSeekReview>;
