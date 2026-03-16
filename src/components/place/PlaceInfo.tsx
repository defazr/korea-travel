import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceInfoProps {
  overview: string | null | undefined;
  tel: string | null | undefined;
  homepage: string | null | undefined;
  openTime: string | null | undefined;
  restDate: string | null | undefined;
  parking: string | null | undefined;
  useTime: string | null | undefined;
}

export default function PlaceInfo({
  overview,
  tel,
  homepage,
  openTime,
  restDate,
  parking,
  useTime,
}: PlaceInfoProps) {
  return (
    <section className="mb-8 space-y-6">
      {overview && (
        <div>
          <h2 className="mb-2 text-xl font-semibold">About</h2>
          <div
            className="text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: overview }}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {tel && <InfoRow label="Phone" value={tel} />}
          {homepage && (
            <InfoRow
              label="Website"
              value={homepage}
              isHtml
            />
          )}
          {openTime && <InfoRow label="Hours" value={openTime} isHtml />}
          {restDate && <InfoRow label="Closed" value={restDate} isHtml />}
          {parking && <InfoRow label="Parking" value={parking} isHtml />}
          {useTime && <InfoRow label="Fee" value={useTime} isHtml />}
        </CardContent>
      </Card>
    </section>
  );
}

function InfoRow({
  label,
  value,
  isHtml,
}: {
  label: string;
  value: string;
  isHtml?: boolean;
}) {
  return (
    <div>
      <dt className="text-sm font-medium">{label}</dt>
      {isHtml ? (
        <dd
          className="text-muted-foreground text-sm"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <dd className="text-muted-foreground text-sm">{value}</dd>
      )}
    </div>
  );
}
