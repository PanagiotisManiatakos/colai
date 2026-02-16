export type DiscountRequest = {
    id: number;
    uid: string;
    barcode: string | null;
    dateOfSyntagi: string | null;
    dateIn: string | null;
    type: string;
    type_descr: string;
    group_EOPPY: string;
    customer_name: string | null;
    customer_amka: string | null;
    doctor_name: string | null;
    doctor_amka: string | null;
    sellerCode: string | null;
    sellerName: string | null;
    statusId: number;
    kostos: number;
    symmPercentage: number;
    posoSymmetoxis: number;
    posoDiscounted: number;
    calculatedDiscPercent: number;
    isDiscountApproved: number;
    dateDiscountReviewed: string | null;
    discountReviewedByName: string | null;
    discount_reason: string | null
    group_EOPPY_id: number

}