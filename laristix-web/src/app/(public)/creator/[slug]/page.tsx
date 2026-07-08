import { PublicCreatorProfile } from "@/components/features/public/public-creator-profile";

interface PublicCreatorPageProps {
  params: { slug: string };
}

export default function PublicCreatorPage({ params }: PublicCreatorPageProps) {
  return <PublicCreatorProfile slug={params.slug} />;
}
