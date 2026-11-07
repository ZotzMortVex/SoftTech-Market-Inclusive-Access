function getMeaningfulParam(params: URLSearchParams, name: string): string | null {
  const value = params.get(name)?.trim();
  if (!value || value.toLowerCase() === "null" || value.toLowerCase() === "undefined") {
    return null;
  }
  return value;
}

export function parseMercadoPagoReturn(search: string): {
  status: string | null;
  paymentId: string | null;
  externalReference: string | null;
} {
  const params = new URLSearchParams(search);
  const paymentId = [params.get("payment_id"), params.get("collection_id")]
    .map((value) => value?.trim() ?? "")
    .find((value) => /^\d{1,32}$/.test(value)) ?? null;
  const externalReference = getMeaningfulParam(params, "external_reference");

  return {
    status:
      getMeaningfulParam(params, "status") ??
      getMeaningfulParam(params, "collection_status"),
    paymentId,
    externalReference:
      externalReference && externalReference.length <= 128
        ? externalReference
        : null,
  };
}
