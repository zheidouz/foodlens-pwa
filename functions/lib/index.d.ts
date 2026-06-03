import * as functions from "firebase-functions/v1";
/**
 * Look up a product by barcode using the Open Food Facts API.
 */
export declare const lookUpBarcode: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Analyze a food image using the Gemini API.
 */
export declare const analyzeFoodImage: functions.HttpsFunction & functions.Runnable<any>;
