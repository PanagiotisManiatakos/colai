export type Order = {
  id: number;
  uid: string;
  type: string;
  userId: number;
  sellerCode: string;
  groupid: number;
  group_EOPPY_id: number;
  group_EOPPY: string;
  seller_GID: string;
  sellerPerson_GID: string;
  sellerName: string;
  dateIn: string; // ISO datetime
  customer_amka: string;
  customer_passport: string;
  customer_name: string;
  customer_address: string;
  customer_city: string;
  customer_tk: string;
  customer_tel: string;
  customer_email: string;
  customer_dob: string;
  customer_tel_otp: string;
  amka_origin: string;
  customer_ErpGID: string;
  person_ErpGID: string;
  address_ErpGID: string;
  shipTo_other_address: number; // 0/1
  customer_other_address: string;
  customer_other_city: string;
  customer_other_tk: string;
  has_other_recipient: number; // 0/1
  recipient_relation_id: number;
  recipient_relation: string;
  recipient_reason_id: number;
  recipient_reason: string;
  recipient_passport: string;
  recipient_amka: string;
  recipient_afm: string;
  recipient_name: string;
  recipient_address: string;
  recipient_city: string;
  recipient_tk: string;
  recipient_tel: string;
  recipient_ErpGID: string;
  doctor_amka: string;
  doctor_name: string;
  doctor_afm: string;
  doctor_Domi: string;
  doctor_DomiTypos: string;
  doctor_ErpGID: string;
  has_suggested_doctor: number; // 0/1
  doctorSuggested_amka: string;
  doctorSuggested_name: string;
  doctorSuggested_afm: string;
  doctorSuggested_ErpGID: string;
  dateOfSyntagi: string; // ISO datetime
  dateIsxyeiApo: string; // ISO datetime
  dateIsxyeiEos: string; // ISO datetime
  barcode: string;
  katigoriaParoxis: string;
  symm: string;
  symmPercentage: number;
  kostos: number;
  kostos_EOPPY: number;
  kostos_RETAIL: number;
  posoSymmetoxis: number;
  posoDiscounted: number | string;
  calculatedDiscPercent: number;
  dateDiscountReviewed: string; // ISO datetime
  discountReviewedByUID: string;
  discountReviewedByName: string;
  isDiscountApproved: number; // 0/1
  discount_reason_id: number;
  discount_reason: string;
  dateDiscountNotify: string; // ISO datetime
  eidos_Egkrisis: number;
  varos: string;
  ipsos: string;
  contact_personid: number;
  is_signed: number; // 0/1
  date_signed: string; // ISO datetime
  signedBy: string;
  dateUpdated: string; // ISO datetime
  statusId: number;
  erpId: string;
  dateErpLinked: string; // ISO datetime
  sellerComments: string;
  retakeFromOrderId: number;
  retakeFromOrderUID: string;
  eoppy_Diagnosi_Code: string;
  eoppy_Diagnosi_Name: string;
  eoppy_Diagnosi2_Code: string;
  eoppy_Diagnosi2_Name: string;
  diagnosi1_GID: string;
  diagnosi2_GID: string;
  countYlika: number;
  payFullOrDiscount: number;
  hasUploadedConsentForm: number;
  finalPaymentAmount: number;
  shipMethodId: number;
  shipMethodName: string;
  shipMethod_GID: string;
  warningInfos: string;
  origin: string;
  isRecurringOrder: number;
  deliverySunday: number;
  deliveryMorning: number;
  appliedPriceList: string;
  shipToOtherAddressBool: boolean;
  hasOtherRecipientBool: boolean;
  hasOtherSystinonIatroBool: boolean;
  isTempSave: number;
  aiCalculated: boolean;
  hasAnoia: boolean;
  eopyyVerifyNoParticipation: number;
};

export type OrderYlika = {
  id: number;
  uid?: string;
  orderId: number;
  orderUID?: string;
  lineNum?: number;
  erpGid?: string;
  erpCode?: string;
  erpName?: string;
  qty: number;
  price?: number;
  eoppy_Code?: string;
  eoppy_Diagnosi_Code?: string;
  eoppy_Diagnosi_Name?: string;
  eoppy_Symmetoxi?: string;
  eoppy_DiarkiaTherapias?: string;
  eoppy_SynPosotita?: string;
  eoppy_Sxolia?: string;
  eoppy_Diagnosi2_Code?: string;
  eoppy_Diagnosi2_Name?: string;
  eoppy_CleanName?: string;
  eoppy_SlugName?: string;
  eoppy_AnatomPerioxi?: string;
  erp_Price: number;
  erp_EoppyPrice: number;
  aiMatchedErpGid?: string;
  aiMatchedBy?: string;
  fuzzyMatched?: number;
};

export type OrderFile = {
  id?: number;
  uid?: string;
  orderId?: number;
  orderUID?: string;
  originalFileName?: string;
  name?: string;
  fileType?: string;
  fileSize?: string;
  documentCategory?: string;
  extractedText?: string;
  dateIn?: any;
  sellerComments?: string;
  adminComments?: string;
  useInAI?: number;
  position?: number;
  hasValidData?: number;
  document_category?: string;
  base64filename?: string
};

export type AIMaterials = {
  anatomiki_perioxi: string;
  clean_name: string;
  diagnosi_pos_ayds: string;
  diarkeia_therapeias_se_mines: string;
  erp_products: AIMaterialsErpProducts[];
  kodikos_diagnosis: string;
  kodikos_diagnosis2: string;
  kodikos_ylikou: string;
  mhniaia_posotita_tmx: string;
  perigrafi_diagnosis: string;
  perigrafi_diagnosis2: string;
  perigrafi_ylikou: string;
  slug_name: string;
  sxolia: string;
  symmetoxi: string;
  synoliki_posotita_eidous: string;
  xronia_pathisi: string;
  matched_by?: string;
  fuzzy_matched?: number;
}

export type AIMaterialsErpProducts = {
  erp_code: string;
  erp_eoppyprice: number;
  erp_gid: string;
  erp_name: string;
  erp_price: number;
  matched_by?: string;
  fuzzy_matched?: number;
}

export type OrdeListOfSelections = {
  disabled: boolean;
  selected: boolean;
  text: string;
  value: string;
}


export type OrderListOfAddressPersons = {
  person_ErpGID: string;
  personName: string;
  addresses: OrderAddress[];
  isCustomer: boolean;
}

export type OrderAddress = {
  address_ErpGID: string;
  address: string;
  city: string;
  tk: string;
}