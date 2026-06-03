export interface Factor {
    label: string;
    score: number;
    type: "good" | "bad";
    icon?: string;
}
export interface HealthScoreResult {
    health_score: number;
    nutriscore: string;
    ecoscore: string | null;
    nova_group: number | null;
    good_factors: Factor[];
    bad_factors: Factor[];
}
interface ProductInput {
    nutriments: Record<string, number>;
    nova_group?: number | null;
    additives?: string[];
    nutriscore?: string | null;
    ecoscore?: string | null;
    ingredients?: string[];
}
export declare function calculateHealthScore(product: ProductInput): HealthScoreResult;
export {};
