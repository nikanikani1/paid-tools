/**
 * Renders a JSON-LD block. The payload is serialized and `<` is escaped so user-facing
 * copy can never terminate the script tag early.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
