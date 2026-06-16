import { SalesPerMonthReportPage } from "@/features/powerBI/SalesPerMonthReportPage";

type PageProps = {
  params: Promise<{
    groupId: string;
    datasetId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { groupId, datasetId } = await params;

  return <SalesPerMonthReportPage datasetId={datasetId} workspaceId={groupId} />;
}
