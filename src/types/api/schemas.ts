/**
 * Swagger schema types from AMSA REST API v1.
 * Source: https://sales.amsaworks.gr/apidocs/swagger/v1/swagger.json
 */

export type APLAT_Sales_FileItem = {
  id: number;
  uid?: string | null;
  orderId?: number | null;
  orderUID?: string | null;
  originalFileName?: string | null;
  name?: string | null;
  friendlyName?: string | null;
  fileType?: string | null;
  fileSize?: string | null;
  documentCategory?: string | null;
  extractedText?: string | null;
  dateIn?: string | null;
  sellerComments?: string | null;
  adminComments?: string | null;
  useInAI?: number | null;
  position?: number | null;
  hasValidData?: number | null;
  scoreFromAI?: number | null;
  scoreFromPlatform?: number | null;
};

export type APLAT_Sales_Order = {
  id: number;
  uid?: string | null;
  type?: string | null;
  userId?: number | null;
  loggedUserSellerCode?: string | null;
  sellerCode?: string | null;
  group_EOPPY_id?: number | null;
  group_EOPPY?: string | null;
  seller_GID?: string | null;
  sellerPerson_GID?: string | null;
  sellerName?: string | null;
  dateIn?: string | null;
  customer_amka?: string | null;
  customer_passport?: string | null;
  customer_name?: string | null;
  customer_address?: string | null;
  customer_city?: string | null;
  customer_tk?: string | null;
  customer_mobile?: string | null;
  customer_mobile2?: string | null;
  customer_tel?: string | null;
  customer_Notes?: string | null;
  customer_email?: string | null;
  customer_dob?: string | null;
  customer_tel_otp?: string | null;
  amka_origin?: string | null;
  customer_ErpGID?: string | null;
  customerPerson_ErpGID?: string | null;
  person_ErpGID?: string | null;
  address_ErpGID?: string | null;
  shipTo_other_address?: number | null;
  customer_other_address?: string | null;
  customer_other_city?: string | null;
  customer_other_tk?: string | null;
  has_other_recipient?: number | null;
  recipient_relation_id?: number | null;
  recipient_relation?: string | null;
  recipient_reason_id?: number | null;
  recipient_reason?: string | null;
  recipient_passport?: string | null;
  recipient_amka?: string | null;
  recipient_afm?: string | null;
  recipient_name?: string | null;
  recipient_address?: string | null;
  recipient_city?: string | null;
  recipient_tk?: string | null;
  recipient_mobile?: string | null;
  recipient_mobile2?: string | null;
  recipient_tel?: string | null;
  recipient_Notes?: string | null;
  recipient_CreatedPersonErpGID?: string | null;
  recipient_CreatedAddressErpGID?: string | null;
  doctor_amka?: string | null;
  doctor_name?: string | null;
  doctor_afm?: string | null;
  doctor_Domi?: string | null;
  doctor_DomiTypos?: string | null;
  doctor_ErpGID?: string | null;
  has_suggested_doctor?: number | null;
  doctorSuggested_amka?: string | null;
  doctorSuggested_name?: string | null;
  doctorSuggested_afm?: string | null;
  doctorSuggested_domi?: string | null;
  doctorSuggested_tel?: string | null;
  doctorSuggested_ErpGID?: string | null;
  dateOfSyntagi?: string | null;
  dateIsxyeiApo?: string | null;
  dateIsxyeiEos?: string | null;
  barcode?: string | null;
  katigoriaParoxis?: string | null;
  symm?: string | null;
  symmPercentage?: number | null;
  kostos?: number | null;
  kostos_EOPPY?: number | null;
  kostos_RETAIL?: number | null;
  posoSymmetoxis?: number | null;
  posoDiscounted?: number | null;
  calculatedDiscPercent?: number | null;
  dateDiscountReviewed?: string | null;
  discountReviewedByUID?: string | null;
  discountReviewedByName?: string | null;
  isDiscountApproved?: number | null;
  discount_reason_id?: number | null;
  discount_reason?: string | null;
  dateDiscountNotify?: string | null;
  eidos_Egkrisis?: number | null;
  varos?: string | null;
  ipsos?: string | null;
  contact_personid?: number | null;
  is_signed?: number | null;
  date_signed?: string | null;
  signedBy?: string | null;
  dateUpdated?: string | null;
  statusId?: number | null;
  erpId?: string | null;
  erpDocCode?: string | null;
  dateErpLinked?: string | null;
  sellerComments?: string | null;
  retakeFromOrderId?: number | null;
  retakeFromOrderUID?: string | null;
  eoppy_Diagnosi_Code?: string | null;
  eoppy_Diagnosi_Name?: string | null;
  eoppy_Diagnosi2_Code?: string | null;
  eoppy_Diagnosi2_Name?: string | null;
  diagnosi1_GID?: string | null;
  diagnosi2_GID?: string | null;
  countYlika?: number | null;
  payFullOrDiscount?: number | null;
  hasUploadedConsentForm?: number | null;
  finalPaymentAmount?: number | null;
  shipMethodId?: number | null;
  shipMethodName?: string | null;
  shipMethod_GID?: string | null;
  warningInfos?: string | null;
  origin?: string | null;
  isRecurringOrder?: number | null;
  deliverySaturday?: number | null;
  deliveryMorning?: number | null;
  eopyyVerifyNoParticipation?: number | null;
  appliedPriceList?: string | null;
  searchKeywords?: string | null;
  posoPlafon?: number | null;
  ypervasiPlafon?: number | null;
  symmetoxiPlafon?: number | null;
  symmetoxiEoppy?: number | null;
  appVersion?: string | null;
  fContactGID?: string | null;
  personIsSameCustomer?: number | null;
  personErp_name?: string | null;
  addressErp_name?: string | null;
  recipient_ErpContact_PersonGID?: string | null;
  recipient_ErpContact_AddressGID?: string | null;
  recipient_ErpContact_Must_Link?: number | null;
  hasConfirmedMidenikiPliromi?: boolean | null;
  shouldUpdateRecipientInfos?: number | null;
  updateRecipient_amka?: string | null;
  updateRecipient_afm?: string | null;
  updateRecipient_passport?: string | null;
  updateRecipient_address?: string | null;
  updateRecipient_tk?: string | null;
  updateRecipient_mobile?: string | null;
  seriesCode?: string | null;
  sellerSiteCode?: string | null;
};

export type APLAT_Sales_OrderItem = {
  id: number;
  uid?: string | null;
  orderId: number;
  orderUID?: string | null;
  lineNum?: number | null;
  dateIn?: string | null;
  dateUpdated?: string | null;
  erpGid?: string | null;
  erpCode?: string | null;
  erpName?: string | null;
  qty?: number | null;
  price?: number | null;
  adhesiveType?: string | null;
  thicknessType?: string | null;
  eoppy_Code?: string | null;
  eoppy_Name?: string | null;
  eoppy_Diagnosi_Code?: string | null;
  eoppy_Diagnosi_Name?: string | null;
  eoppy_Symmetoxi?: string | null;
  eoppy_AnatomPerioxi?: string | null;
  eoppy_DiarkiaTherapias?: string | null;
  eoppy_SynPosotita?: string | null;
  eoppy_Sxolia?: string | null;
  eoppy_Diagnosi2_Code?: string | null;
  eoppy_Diagnosi2_Name?: string | null;
  eoppy_CleanName?: string | null;
  eoppy_SlugName?: string | null;
  erp_Price?: number | null;
  erp_EoppyPrice?: number | null;
  aiMatchedErpGid?: string | null;
  aiMatchedBy?: string | null;
  fuzzyMatched?: number | null;
};

export type SaveOrderReq = {
  order: APLAT_Sales_Order;
  ylika?: APLAT_Sales_OrderItem[] | null;
  isTempSave?: number | null;
};

export type SaleOrder_ErrorMode = 0 | 1 | 400 | 500;

export type SaleOrderIssueCode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type SaleOrder_CheckItem = {
  name?: string | null;
  errorMode?: SaleOrder_ErrorMode;
  issueCode?: SaleOrderIssueCode;
  showInWarnings: boolean;
  isOk: boolean;
  bgColor?: string | null;
  faIcon?: string | null;
};

export type OrderPreviewVM = {
  order: APLAT_Sales_Order;
  items?: APLAT_Sales_OrderItem[] | null;
  files?: APLAT_Sales_FileItem[] | null;
  check_errors?: SaleOrder_CheckItem[] | null;
};

export type OrderEditVM = {
  isSuccess: boolean;
  message?: string | null;
  errorMessage?: string | null;
  sellerCode?: string | null;
  sellerName?: string | null;
  order: APLAT_Sales_Order;
  items?: APLAT_Sales_OrderItem[] | null;
  files?: APLAT_Sales_FileItem[] | null;
  list_GroupEoppy?: import("./common").SelectListItem[] | null;
  list_LogosParalipti?: import("./common").SelectListItem[] | null;
  list_SygeniaParalipti?: import("./common").SelectListItem[] | null;
  list_TroposApostolis?: import("./common").SelectListItem[] | null;
  list_DiscountReasons?: import("./common").SelectListItem[] | null;
  wcFilterItems?: WcDiadikasiaFilterAccessItems | null;
  list_KatigoriesParoxis?: import("./common").KatigoriaParoxisItem[] | null;
  showIpsosVaros: boolean;
  /** Present in some edit responses; not in swagger but used by the app. */
  ai_ylika?: EopyDoc_Ylika[] | null;
};

export type OrderEditItemResp = {
  statusCode?: number | null;
  message?: string | null;
  detailedMessage?: string | null;
  data: OrderEditVM;
};

export type OrderViewItemResp = {
  statusCode?: number | null;
  message?: string | null;
  detailedMessage?: string | null;
  data: OrderPreviewVM;
};

export type OrdersQuickStats = {
  newCustomers: number;
  newPersons: number;
  ordersTotal: number;
  ordersSentToERP: number;
  ordersPending: number;
  ordersSubmitted: number;
};

export type OrderGetItemsVM = {
  search?: string | null;
  start?: string | null;
  end?: string | null;
  orderby?: string | null;
  statusid?: number | null;
  groupid?: number | null;
  discountstatusid?: number | null;
  descriptionForDates?: string | null;
  page: number;
  pagesize: number;
  mydata?: APLAT_Sales_Order[] | null;
  quickStats?: OrdersQuickStats;
  paging_item?: import("./common").PagingResults | null;
};

export type ListOrdersResp = {
  statusCode?: number | null;
  message?: string | null;
  detailedMessage?: string | null;
  data: OrderGetItemsVM;
};

export type AddressDto = {
  address_ErpGID?: string | null;
  address?: string | null;
  city?: string | null;
  tk?: string | null;
  isAddressPreselected: boolean;
};

export type AddressAndPersonDto = {
  person_ErpGID?: string | null;
  personName?: string | null;
  personVatNumber?: string | null;
  personAMKA?: string | null;
  personIDCode?: string | null;
  personPassport?: string | null;
  personMobile1?: string | null;
  personMobile2?: string | null;
  personTel1?: string | null;
  addresses?: AddressDto[] | null;
  isCustomer: boolean;
  isPersonPreselected: boolean;
  textDisplay?: string | null;
};

export type SearchAddresses_Response = {
  isSuccess: boolean;
  message?: string | null;
  errorMessage?: string | null;
  addresses?: AddressAndPersonDto[] | null;
  customerAMKA?: string | null;
  customerName?: string | null;
  customerAddress?: string | null;
  customer_GID?: string | null;
  preselected_address_GID?: string | null;
  preselected_person_GID?: string | null;
};

export type COLAI_T_CUSTOMER_PERSONAL_INFO = {
  tR_GID: string;
  tR_Code?: string | null;
  tR_Name?: string | null;
  tR_StringField5?: string | null;
  tR_fPersonCodeGID?: string | null;
  iS_CERTIFIED_PHONE?: number | null;
  tR_REMARKS?: string | null;
  pE_GID?: string | null;
  pE_Code?: string | null;
  pE_NAME?: string | null;
  pE_ActivityCode?: string | null;
  pE_TaxRegNum?: string | null;
  pE_DEAD_ALIVE?: number | null;
  pE_REMARKS?: string | null;
  peS_FSiteGID?: string | null;
  peS_Address1?: string | null;
  peS_CityCode?: string | null;
  peS_Area?: string | null;
  peS_FPOSTALCODE?: string | null;
  peS_STATUS?: number | null;
  peS_KindSite?: number | null;
  tR_Name_Greeklish?: string | null;
  peS_TEL_1?: string | null;
  telephone1?: string | null;
  taytothta?: string | null;
};

export type OrderPlatformPreviousDto = {
  id: number;
  barcode?: string | null;
  customer_ErpGID?: string | null;
  customerPerson_ErpGID?: string | null;
  person_ErpGID?: string | null;
  address_ErpGID?: string | null;
  customer_amka?: string | null;
  customer_name?: string | null;
  customer_passport?: string | null;
  customer_mobile?: string | null;
  customer_mobile2?: string | null;
  customer_tel?: string | null;
  customer_email?: string | null;
  customer_dob?: string | null;
  customer_address?: string | null;
  customer_city?: string | null;
  customer_tk?: string | null;
  shipMethodId?: number | null;
  customer_Notes?: string | null;
  shipTo_other_address?: number | null;
  customer_other_address?: string | null;
  customer_other_city?: string | null;
  customer_other_tk?: string | null;
  has_other_recipient?: number | null;
  recipient_reason_id?: number | null;
  recipient_relation_id?: number | null;
  recipient_name?: string | null;
  recipient_passport?: string | null;
  recipient_amka?: string | null;
  recipient_afm?: string | null;
  recipient_mobile?: string | null;
  recipient_mobile2?: string | null;
  recipient_tel?: string | null;
  recipient_address?: string | null;
  recipient_city?: string | null;
  recipient_tk?: string | null;
  recipient_Notes?: string | null;
  has_suggested_doctor?: number | null;
  doctorSuggested_amka?: string | null;
  doctorSuggested_name?: string | null;
  doctorSuggested_afm?: string | null;
  doctorSuggested_domi?: string | null;
  doctorSuggested_tel?: string | null;
  doctorSuggested_ErpGID?: string | null;
  recipient_CreatedPersonErpGID?: string | null;
  recipient_CreatedAddressErpGID?: string | null;
  dateIn?: string | null;
};

export type OrderErpPreviousDto = {
  customerGID?: string | null;
  customerPersonGID?: string | null;
  deliveryPersonGID?: string | null;
  deliveryAddressGID?: string | null;
  suggestedDoctorGID?: string | null;
  customerAMKA?: string | null;
  suggestedDoctor_amka?: string | null;
  suggestedDoctor_name?: string | null;
  suggestedDoctor_afm?: string | null;
  suggestedDoctor_domi?: string | null;
  suggestedDoctor_tel?: string | null;
  registrationDate?: string | null;
  documentCode?: string | null;
};

export type SearchCustomers_Response = {
  isSuccess: boolean;
  message?: string | null;
  errorMessage?: string | null;
  listCustomers?: COLAI_T_CUSTOMER_PERSONAL_INFO[] | null;
  mode?: string | null;
  searchTerm?: string | null;
  lastCustomerWebOrder?: OrderPlatformPreviousDto | null;
  lastErpOrder?: OrderErpPreviousDto | null;
};

export type SearchErpContactsResponse = {
  isSuccess: boolean;
  message?: string | null;
  errorMessage?: string | null;
  contacts?: AddressAndPersonDto[] | null;
};

export type COLAI_T_DOCTORS = {
  code?: string | null;
  codE2?: string | null;
  doctoR_CODE?: string | null;
  doctoR_NAME?: string | null;
  greeklisH_DOCT_NAME?: string | null;
  speC_ID?: string | null;
  eidikotita?: string | null;
  domI_ID?: string | null;
  domi?: string | null;
  gid?: string | null;
  doctoR_AMKA?: string | null;
  doctoR_AFM?: string | null;
  mobile1?: string | null;
  mobile2?: string | null;
};

export type SearchDoctors_Response = {
  isSuccess: boolean;
  message?: string | null;
  errorMessage?: string | null;
  listDoctors?: COLAI_T_DOCTORS[] | null;
  mode?: string | null;
  searchTerm?: string | null;
};

export type EopyDoc_ErpMappedProduct = {
  erp_gid?: string | null;
  erp_code?: string | null;
  erp_name?: string | null;
  erp_price?: number | null;
  erp_eoppyprice?: number | null;
  matched_by?: string | null;
  fuzzy_matched?: number | null;
};

export type SearchErpItems_Response = {
  isSuccess: boolean;
  message?: string | null;
  errorMessage?: string | null;
  items?: EopyDoc_ErpMappedProduct[] | null;
};

export type LoadLastCustomerOrderReq = {
  customer_gid?: string | null;
  customer_amka?: string | null;
  order_eopyy_group_id?: number | null;
};

export type CustomerLastOrdersInfoResp = {
  statusCode?: number | null;
  message?: string | null;
  detailedMessage?: string | null;
  last_web_order?: OrderPlatformPreviousDto | null;
  last_erp_order?: OrderErpPreviousDto | null;
};

export type PhoneContactItem = {
  name?: string | null;
  phone?: string | null;
  isFromCustomer: boolean;
};

export type CustomerContactItem = {
  customerAMKA?: string | null;
  customerGID?: string | null;
  customerName?: string | null;
  telephones?: PhoneContactItem[] | null;
  emails?: string[] | null;
};

export type CustomerContactInfoResp = {
  statusCode?: number | null;
  message?: string | null;
  detailedMessage?: string | null;
  data?: CustomerContactItem | null;
};

export type StoxoiMina = {
  count_paragg_new: number;
  count_paragg_repeat: number;
  amount_paragg_new: number;
  amount_paragg_repeat: number;
};

export type DashboardVM = {
  statusCode?: number | null;
  message?: string | null;
  detailedMessage?: string | null;
  totalOrders_month: number;
  totalOrders_prev_month: number;
  totalOrders_month_perc: number;
  pendingReviews: number;
  next10DaysSyntages: number;
  lastOrders?: APLAT_Sales_Order[] | null;
  wC_stoixoi_mina?: StoxoiMina | null;
};

export type StaticDataResp = {
  statusCode?: number | null;
  message?: string | null;
  detailedMessage?: string | null;
  list_GroupEoppy?: import("./common").SelectListItem[] | null;
  list_OtherRecipientReason?: import("./common").SelectListItem[] | null;
  list_OtherRecipientRelationship?: import("./common").SelectListItem[] | null;
  list_ShipMethod?: import("./common").SelectListItem[] | null;
  list_DiscountReasons?: import("./common").SelectListItem[] | null;
  list_Order_Statuses?: import("./common").SelectListItem[] | null;
  list_Discount_Statuses?: import("./common").SelectListItem[] | null;
  list_Order_Types?: import("./common").SelectListItem[] | null;
  list_Order_EidosEgkrisis?: import("./common").SelectListItem[] | null;
  list_Order_PriceList?: import("./common").SelectListItem[] | null;
  list_DocumentTypes?: import("./common").SelectListItem[] | null;
  /** Returned by backend in practice; used by order wizard static lists. */
  list_KatigoriesParoxis?: import("./common").KatigoriaParoxisItem[] | null;
};

export type DiscountReq_OrderVM = {
  id: number;
  uid?: string | null;
  barcode?: string | null;
  dateOfSyntagi?: string | null;
  dateIn?: string | null;
  type?: string | null;
  type_descr?: string | null;
  group_EOPPY?: string | null;
  customer_name?: string | null;
  customer_amka?: string | null;
  doctor_name?: string | null;
  doctor_amka?: string | null;
  sellerCode?: string | null;
  sellerName?: string | null;
  statusId?: number | null;
  kostos?: number | null;
  symmPercentage?: number | null;
  posoSymmetoxis?: number | null;
  posoDiscounted?: number | null;
  calculatedDiscPercent?: number | null;
  isDiscountApproved?: number | null;
  dateDiscountReviewed?: string | null;
  discountReviewedByName?: string | null;
  discount_reason?: string | null;
};

export type DiscountRequestsGetItemsVM = {
  search?: string | null;
  start?: string | null;
  end?: string | null;
  orderby?: string | null;
  discountstatus?: number | null;
  groupid?: number | null;
  descriptionForDates?: string | null;
  page: number;
  pagesize: number;
  mydata?: DiscountReq_OrderVM[] | null;
  userCanMakeAction: boolean;
  paging_item?: import("./common").PagingResults | null;
};

export type ListDiscountRequestsResp = {
  statusCode?: number | null;
  message?: string | null;
  detailedMessage?: string | null;
  data: DiscountRequestsGetItemsVM;
};

export type DiscountReviewReq = {
  id: number;
  uid?: string | null;
  isapproved: number;
  overrideamount?: number | null;
};

export type APLAT_T_WC_DIADIKASIA_CALENDAR = {
  customerCode?: string | null;
  customerName?: string | null;
  peL_GRLSH?: string | null;
  amka?: string | null;
  sellerCode?: string | null;
  sellerName?: string | null;
  lastPAEO?: string | null;
  tasK_CODE?: string | null;
  lastOrderDate?: string | null;
  expectedNextOrderDate?: string | null;
  datesInfo?: string | null;
  daysUntilReminder?: number | null;
  doctoR_SINTAGHS?: string | null;
  docT_GRLSH?: string | null;
  items?: string | null;
  totalTurnover?: number | null;
  pasy?: number | null;
  totaL_EXP?: number | null;
  ordersCount?: number | null;
  plethos?: number | null;
  team?: string | null;
  area?: string | null;
  statuS_EA?: string | null;
};

export type AplatReportCustomerStatus = {
  statusId: number;
  statusUID?: string | null;
  title?: string | null;
  dateIn?: string | null;
  dateUpdated?: string | null;
  displayRank?: number | null;
};

export type WCdiadikasiaGetDataVM = {
  statusCode?: number | null;
  message?: string | null;
  detailedMessage?: string | null;
  showActions: boolean;
  listData?: APLAT_T_WC_DIADIKASIA_CALENDAR[] | null;
  listStatuses?: AplatReportCustomerStatus[] | null;
};

export type AplatAKKViewTravmaSellers = {
  code?: string | null;
  name?: string | null;
  area?: string | null;
  team?: string | null;
  approver?: string | null;
  siteCode?: string | null;
  siteDescr?: string | null;
  p_TARGET?: number | null;
  t_BUDGET?: number | null;
  misc1?: Record<string, string | null> | null;
};

export type WcDiadikasiaFilterAccessItems = {
  sellers?: AplatAKKViewTravmaSellers[] | null;
  isSuperAdmin: boolean;
  isCityAdmin: boolean;
  isSimpleSeller: boolean;
  isManager: boolean;
  loggedSellerCode?: string | null;
  sellerCodes?: string[] | null;
  sellerCodesForDiscountApprove?: string[] | null;
};

export type EopyDoc_Iatros = {
  onomateponymo_iatrou?: string | null;
  afm_iatrou?: string | null;
  eidikotita?: string | null;
  amka_iatrou?: string | null;
  ygeionomiki_domi?: string | null;
  tilefono?: string | null;
  typos_domis?: string | null;
  doctor_erpid?: string | null;
  load_info_message?: string | null;
};

export type EopyDoc_Gnomateusi = {
  imerominia_gnomateusis?: string | null;
  diarkeia_isxyos_apo?: string | null;
  diarkeia_isxyos_eos?: string | null;
  diarkeia_therapeias_mines?: number | null;
  aa_gnomateusis_mines?: number | null;
  katigoria_paroxis?: string | null;
  eidos_egkrisis?: number | null;
  kodikos_diagnosis?: string | null;
  perigrafi_diagnosis?: string | null;
  kodikos_diagnosis2?: string | null;
  perigrafi_diagnosis2?: string | null;
  symmetoxi?: string | null;
  diagnosi1_gid?: string | null;
  diagnosi2_gid?: string | null;
  symmetoxi_percentage?: number | null;
  max_poso_symmetoxis?: number | null;
  gift_poso_symmetoxis?: number | null;
  max_poso_symm_reasoning?: string | null;
};

export type EopyDoc_Ylika = {
  kodikos_ylikou?: string | null;
  perigrafi_ylikou?: string | null;
  anatomiki_perioxi?: string | null;
  synoliki_posotita_eidous?: number | null;
  diarkeia_therapeias_se_mines?: number | null;
  mhniaia_posotita_tmx?: number | null;
  symmetoxi?: string | null;
  sxolia?: string | null;
  kodikos_diagnosis?: string | null;
  perigrafi_diagnosis?: string | null;
  xronia_pathisi?: string | null;
  diagnosi_pros_ayds?: string | null;
  kodikos_diagnosis2?: string | null;
  perigrafi_diagnosis2?: string | null;
  slug_name?: string | null;
  clean_name?: string | null;
  erp_products?: EopyDoc_ErpMappedProduct[] | null;
};

export type EopyDocument = {
  barcode?: string | null;
  otp?: string | null;
  amka_eksetazomenou?: string | null;
  onomateponymo_eksetazomenou?: string | null;
  imerominia_gennisis?: string | null;
  diefthinsi_eksetazomenou?: string | null;
  tk_eksetazomenou?: string | null;
  poli_eksetazomenou?: string | null;
  tilefono_eksetazomenou?: string | null;
  email_eksetazomenou?: string | null;
  iatros?: EopyDoc_Iatros | null;
  last_order_hassuggested_doc?: number | null;
  systinon_iatros?: EopyDoc_Iatros | null;
  gnomateusi?: EopyDoc_Gnomateusi | null;
  ylika?: EopyDoc_Ylika[] | null;
  hasAnoia: boolean;
  customer_erpid?: string | null;
  person_erpid?: string | null;
  address_erpid?: string | null;
  last_order_info?: OrderPlatformPreviousDto | null;
  loaded_custinfo_from?: string | null;
  /** Present in some responses; not in swagger but used by the app. */
  last_web_order?: OrderPlatformPreviousDto | Record<string, unknown> | null;
  customer_tel?: string | null;
};

export type ReadEoppyDoc_Response = {
  isSuccess: boolean;
  message?: string | null;
  errorMessage?: string | null;
  jsonDoc?: EopyDocument | null;
  jsonError?: string | null;
  detailedError?: string | null;
  logId?: number | null;
  orderExists: boolean;
  orderExistsMessage?: string | null;
};

export type ReadEoppyDocumentAIResp = {
  statusCode?: number | null;
  message?: string | null;
  detailedMessage?: string | null;
  data?: ReadEoppyDoc_Response | null;
};

export type RunAIFileAnalysisReq = {
  order_uid?: string | null;
  catid: number;
  aiclient?: string | null;
};

export type FileUploadReq = {
  order_uid?: string | null;
  document_category?: string | null;
  position?: number | null;
  base64file?: string | null;
  base64filename?: string | null;
  customer_name?: string | null;
  recipient_name?: string | null;
  has_other_recipient?: number | null;
  aiclient?: string | null;
};

export type ApiAccessSellerItem = {
  sellerCode?: string | null;
  sellerName?: string | null;
};

export type ApiAvailableAiClient = {
  name: string;
  code: string;
  priority: number;
};

export type ApiUserInfo = {
  userID: number;
  userUID?: string | null;
  username?: string | null;
  fname?: string | null;
  lname?: string | null;
  area?: string | null;
  team?: string | null;
  isSuperAdmin: boolean;
  isSalesAdmin: boolean;
  isSeller: boolean;
  isManager: boolean;
  sellerCode?: string | null;
  listAccessSellers?: ApiAccessSellerItem[] | null;
};

/** AMSA `/api/login` payload. */
export type LoginReq = {
  username?: string | null;
  password?: string | null;
};

/** AMSA `/api/login` response body (also returned by `/api/auth/login` with `ok: true`). */
export type LoginResp = {
  statusCode?: number | null;
  message?: string | null;
  detailedMessage?: string | null;
  accessToken?: string | null;
  tokenType?: string | null;
  expiresIn?: number | null;
  userInfos?: ApiUserInfo | null;
  warningMessage?: string | null;
  availableAiClients?: ApiAvailableAiClient[] | null;
};
