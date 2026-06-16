import SellerReportsPage from "@/features/powerBI/SellerReportsPage";

type PageProps = {
  params: Promise<{
    groupId: string;
    datasetId: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ params, searchParams }: PageProps) {
  const [routeParams, queryParams] = await Promise.all([params, searchParams]);

  return (
    <SellerReportsPage
      workspaceId={routeParams.groupId}
      datasetId={routeParams.datasetId}
      groupName={getSearchParam(queryParams, "groupName")}
      datasetName={getSearchParam(queryParams, "datasetName")}
    />
  );
}
