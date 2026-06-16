import { SalesPerYearReportPage } from "@/features/powerBI/SalesPerYearReportPage";

type PageProps = {
  params: Promise<{
    groupId: string;
    datasetId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { groupId, datasetId } = await params;

  return <SalesPerYearReportPage datasetId={datasetId} workspaceId={groupId} />;
}
