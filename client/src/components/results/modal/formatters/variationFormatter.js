export function formatVariation(value) {
  if (!value || typeof value !== "object") return "-";

  const lines = [];

  if (value.location) {
    const { type, sequence_id, interval } = value.location;

    if (type) {
      lines.push(`Location type: ${humanize(type)}`);
    }

    if (sequence_id) {
      lines.push(`Sequence Id: ${sequence_id}`);
    }

    if (interval?.start?.value != null && interval?.end?.value != null) {
      lines.push("Sequence interval:");
      lines.push(`  Start: ${interval.start.value}`);
      lines.push(`  End: ${interval.end.value}`);
    }
  }

  if (value.alternateBases) {
    lines.push(`Alternate bases: ${value.alternateBases}`);
  }

  if (value.referenceBases) {
    lines.push(`Reference bases: ${value.referenceBases}`);
  }

  if (value.variantType) {
    lines.push(`Variant type: ${value.variantType}`);
  }

  return lines.length ? lines.join("\n") : "-";
}

function humanize(value) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}
