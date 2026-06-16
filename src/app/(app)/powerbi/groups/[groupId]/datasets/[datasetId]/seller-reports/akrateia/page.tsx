import { AkrateiaReportPage } from "@/features/powerBI/AkrateiaReportPage";

type PageProps = {
  params: Promise<{
    groupId: string;
    datasetId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { groupId, datasetId } = await params;

  return <AkrateiaReportPage datasetId={datasetId} workspaceId={groupId} />;
}
