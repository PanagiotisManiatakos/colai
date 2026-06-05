import type {
  ApiFailure,
  ApiSuccess,
  ConsentUploadDataObject,
  PagingResults,
  ToastMessage,
} from "./common";
import type { SellerSalesWC } from "./sqlData";
import type {
  APLAT_Sales_Order,
  AddressAndPersonDto,
  ApiUserInfo,
  COLAI_T_CUSTOMER_PERSONAL_INFO,
  COLAI_T_DOCTORS,
  CustomerContactItem,
  CustomerLastOrdersInfoResp,
  DashboardVM,
  DiscountReq_OrderVM,
  EopyDoc_ErpMappedProduct,
  ListDiscountRequestsResp,
  OrderEditItemResp,
  OrderPreviewVM,
  ReadEoppyDocumentAIResp,
  SearchAddresses_Response,
  SearchCustomers_Response,
  SearchDoctors_Response,
  SearchErpContactsResponse,
  StaticDataResp,
  WCdiadikasiaGetDataVM,
} from "./schemas";

type Success<T> = Extract<T, { ok: true }>;

/** `GET /api/orders` */
export type GetOrdersResponse =
  | ApiSuccess<{ orders: APLAT_Sales_Order[]; paging: PagingResults | null }>
  | ApiFailure;

/** `POST /api/orders` */
export type PostOrderResponse = ApiSuccess<ToastMessage> | ApiFailure;

/** `GET /api/orders/[id]` — proxy spreads `OrderPreviewVM` fields at top level. */
export type GetOrderViewResponse = ApiSuccess<OrderPreviewVM> | ApiFailure;

/** `DELETE /api/orders/[id]` */
export type DeleteOrderResponse = ApiSuccess<ToastMessage> | ApiFailure;

/** `GET /api/orders/edit` — proxy spreads full backend payload. */
export type GetOrderEditResponse = ApiSuccess<OrderEditItemResp> | ApiFailure;

/** `GET /api/customers/[gid]/addresses` */
export type GetCustomerAddressesResponse =
  | ApiSuccess<SearchAddresses_Response>
  | ApiFailure;

/** `GET /api/customers` */
export type SearchCustomersApiResponse =
  | ApiSuccess<SearchCustomers_Response>
  | ApiFailure;

/** `POST /api/load-last-customer-order-info` */
export type LoadLastCustomerOrderInfoResponse =
  | ApiSuccess<CustomerLastOrdersInfoResp>
  | ApiFailure;

/** `GET /api/search-erp-contacts` — raw backend body (no `ok` wrapper). */
export type SearchErpContactsApiResponse = SearchErpContactsResponse;

/** `GET /api/search-customer-tels` */
export type SearchCustomerTelsResponse =
  | ApiSuccess<{ data: CustomerContactItem; statusCode?: number | null }>
  | ApiFailure;

/** `GET /api/products` */
export type SearchProductsApiResponse =
  | ApiSuccess<{ items: EopyDoc_ErpMappedProduct[] }>
  | ApiFailure;

/** `GET /api/doctors` */
export type SearchDoctorsApiResponse =
  | ApiSuccess<{ listDoctors: COLAI_T_DOCTORS[] }>
  | ApiFailure;

/** `POST /api/orders/runai` — returns raw `ReadEoppyDocumentAIResp` (no `ok` wrapper). */
export type RunAiApiResponse = ReadEoppyDocumentAIResp & {
  ok?: boolean;
  result?: boolean;
  message?: string;
};

/** `POST /api/orders/file` */
export type FileUploadApiResponse = ApiSuccess<
  ToastMessage & { dataobject?: ConsentUploadDataObject | null }
> | ApiFailure;

/** `GET /api/dashboard` */
export type GetDashboardResponse = ApiSuccess<DashboardVM> | ApiFailure;

/** `GET /api/staticData` */
export type GetStaticDataResponse = ApiSuccess<StaticDataResp> | ApiFailure;

/** `GET /api/discountRequests` */
export type GetDiscountRequestsResponse =
  | ApiSuccess<{
      data: ListDiscountRequestsResp["data"];
      userCanMakeAction?: boolean;
    }>
  | ApiFailure;

/** `POST /api/discountRequests/review` */
export type ReviewDiscountRequestResponse =
  | ApiSuccess<
      ToastMessage & {
        id?: number;
        isapproved?: number;
      }
    >
  | ApiFailure;

/** `GET /api/wc-diadikasia/calendar` */
export type GetWcCalendarResponse = ApiSuccess<WCdiadikasiaGetDataVM> | ApiFailure;

/** `GET /api/wc/order-list` */
export type GetWcOrderListResponse =
  | ApiSuccess<{ records: SellerSalesWC[] }>
  | ApiFailure;

/** `POST /api/auth/login` */
export type LoginApiResponse =
  | ApiSuccess<{
      accessToken?: string;
      expiresIn?: number;
      userInfos?: ApiUserInfo;
      statusCode?: number;
    }>
  | ApiFailure;

/** `GET /api/auth/me` */
export type AuthMeResponse =
  | ApiSuccess<{
      authenticated: boolean;
      user?: { username?: string };
    }>
  | ApiFailure;

export type GetOrdersSuccess = Success<GetOrdersResponse>;
export type PostOrderSuccess = Success<PostOrderResponse>;
export type GetOrderViewSuccess = Success<GetOrderViewResponse>;
export type DeleteOrderSuccess = Success<DeleteOrderResponse>;
export type GetOrderEditSuccess = Success<GetOrderEditResponse>;
export type GetCustomerAddressesSuccess = Success<GetCustomerAddressesResponse>;
export type SearchCustomersSuccess = Success<SearchCustomersApiResponse>;
export type LoadLastCustomerOrderInfoSuccess =
  Success<LoadLastCustomerOrderInfoResponse>;
export type SearchCustomerTelsSuccess = Success<SearchCustomerTelsResponse>;
export type SearchProductsSuccess = Success<SearchProductsApiResponse>;
export type SearchDoctorsSuccess = Success<SearchDoctorsApiResponse>;
export type FileUploadSuccess = Success<FileUploadApiResponse>;
export type GetDashboardSuccess = Success<GetDashboardResponse>;
export type GetStaticDataSuccess = Success<GetStaticDataResponse>;
export type GetDiscountRequestsSuccess = Success<GetDiscountRequestsResponse>;
export type ReviewDiscountRequestSuccess = Success<ReviewDiscountRequestResponse>;
export type GetWcCalendarSuccess = Success<GetWcCalendarResponse>;
export type GetWcOrderListSuccess = Success<GetWcOrderListResponse>;
export type LoginSuccess = Success<LoginApiResponse>;
export type AuthMeSuccess = Success<AuthMeResponse>;
/** Re-export commonly used schema aliases for consumers. */
export type CustomerSearchResult = COLAI_T_CUSTOMER_PERSONAL_INFO;
export type ErpContact = AddressAndPersonDto;
export type DoctorSearchResult = COLAI_T_DOCTORS;
export type ProductSearchResult = EopyDoc_ErpMappedProduct;
export type DiscountRequestItem = DiscountReq_OrderVM;
export type { OrderPreviewVM, OrderEditItemResp, ReadEoppyDocumentAIResp };
