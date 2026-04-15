"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { type UUIDVersion, genUUID, formatTime } from "@/lib/uuid";

const GridCanvas = dynamic(() => import("./GridCanvas"), { ssr: false });

interface Entry {
  id: string;
  uuid: string;
  ts: string;
  version: UUIDVersion;
}

function UUIDDisplay({ uuid, dim }: { uuid: string; dim?: boolean }) {
  const parts = uuid.split("-");
  const base = dim ? "rgba(255,255,255,0.58)" : "rgba(255,255,255,0.92)";
  const accent = dim ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,1)";

  return (
    <span
      style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.04em" }}
    >
      {parts.map((part, pi) => {
        const chars = part.split("");
        return (
          <span key={pi}>
            {chars.map((ch, ci) => {
              const isSpecial =
                (pi === 2 && ci === 0) || (pi === 3 && ci === 0);
              return (
                <span key={ci} style={{ color: isSpecial ? accent : base }}>
                  {ch}
                </span>
              );
            })}
            {pi < 4 && (
              <span style={{ color: "rgba(255,255,255,0.35)" }}>-</span>
            )}
          </span>
        );
      })}
    </span>
  );
}

type Mode = "single" | "bulk";
const BULK_PRESETS = [10, 25, 50, 100] as const;

export default function UUIDCard() {
  const [mode, setMode] = useState<Mode>("single");
  const [version, setVersion] = useState<UUIDVersion>("v4");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [justGenId, setJustGenId] = useState<string | null>(null);

  const [bulkCount, setBulkCount] = useState<number>(10);
  const [bulkUUIDs, setBulkUUIDs] = useState<string[]>([]);
  const [bulkCopied, setBulkCopied] = useState(false);
  const [bulkCopiedIdx, setBulkCopiedIdx] = useState<number | null>(null);

  const generate = useCallback(
    (ver?: UUIDVersion) => {
      const v = ver ?? version;
      const uuid = genUUID(v);
      const id = String(Date.now());
      setEntries((prev) => [
        { id, uuid, ts: formatTime(new Date()), version: v },
        ...prev.slice(0, 6),
      ]);
      setJustGenId(id);
      setTimeout(() => setJustGenId(null), 600);
    },
    [version],
  );

  const generateBulk = useCallback(() => {
    const uuids = Array.from({ length: bulkCount }, () => genUUID(version));
    setBulkUUIDs(uuids);
    setBulkCopied(false);
    setBulkCopiedIdx(null);
  }, [bulkCount, version]);

  const copy = useCallback((uuid: string, id: string) => {
    navigator.clipboard.writeText(uuid).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  }, []);

  const copyAll = useCallback(() => {
    if (entries.length === 0) return;
    const text = entries.map((e) => e.uuid).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId("__all__");
      setTimeout(() => setCopiedId(null), 1800);
    });
  }, [entries]);

  const copyBulkAll = useCallback(() => {
    if (bulkUUIDs.length === 0) return;
    navigator.clipboard.writeText(bulkUUIDs.join("\n")).then(() => {
      setBulkCopied(true);
      setTimeout(() => setBulkCopied(false), 1800);
    });
  }, [bulkUUIDs]);

  const copyBulkOne = useCallback((uuid: string, idx: number) => {
    navigator.clipboard.writeText(uuid).then(() => {
      setBulkCopiedIdx(idx);
      setTimeout(() => setBulkCopiedIdx(null), 1800);
    });
  }, []);

  useEffect(() => {
    generate();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.code === "Space" || e.key === "g") {
        e.preventDefault();
        if (mode === "bulk") generateBulk();
        else generate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [generate, generateBulk, mode]);

  const latest = entries[0] ?? null;

  return (
    <>
      <GridCanvas />

      <main
        style={{
          position: "relative",
          zIndex: 10,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 20px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "600px" }}>
          <h1
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "26px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: "20px",
            }}
          >
            Universal Unique
            <br />
            Identifier
          </h1>

          <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
            {(["v4", "v7"] as UUIDVersion[]).map((v) => {
              const active = version === v;
              return (
                <button
                  key={v}
                  onClick={() => setVersion(v)}
                  style={{
                    padding: "5px 16px",
                    borderRadius: "5px",
                    border: "1px solid",
                    borderColor: active
                      ? "rgba(255,255,255,0.45)"
                      : "rgba(255,255,255,0.1)",
                    background: active
                      ? "rgba(255,255,255,0.09)"
                      : "transparent",
                    color: active
                      ? "rgba(255,255,255,0.88)"
                      : "rgba(255,255,255,0.35)",
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                    transition: "all 0.18s",
                  }}
                >
                  {v.toUpperCase()}
                </button>
              );
            })}
            <span
              style={{
                alignSelf: "center",
                marginLeft: "6px",
                fontFamily: "var(--font-geist-mono)",
                fontSize: "11px",
                color: "rgba(255,255,255,0.42)",
                letterSpacing: "0.04em",
                flex: 1,
              }}
            >
              {version === "v4"
                ? "Random · RFC 4122"
                : "Time-ordered · RFC 9562"}
            </span>
            {(["single", "bulk"] as Mode[]).map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: "5px",
                    border: "1px solid",
                    borderColor: active
                      ? "rgba(255,255,255,0.45)"
                      : "rgba(255,255,255,0.1)",
                    background: active
                      ? "rgba(255,255,255,0.09)"
                      : "transparent",
                    color: active
                      ? "rgba(255,255,255,0.88)"
                      : "rgba(255,255,255,0.35)",
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                    transition: "all 0.18s",
                  }}
                >
                  {m.toUpperCase()}
                </button>
              );
            })}
          </div>

          {mode === "single" ? (
            <>

              <div
                style={{
                  background: "rgba(0,0,0,0.45)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "24px 22px",
                  marginBottom: "14px",
                  backdropFilter: "blur(14px)",
                  transition: "border-color 0.3s",
                  borderColor: justGenId
                    ? "rgba(255,255,255,0.22)"
                    : "rgba(255,255,255,0.1)",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: "10px",
                    letterSpacing: "0.14em",
                    color: "rgba(255,255,255,0.45)",
                    marginBottom: "12px",
                  }}
                >
                  LATEST
                </p>
                {latest ? (
                  <div
                    style={{
                      fontSize: "15px",
                      wordBreak: "break-all",
                      cursor: "pointer",
                    }}
                    onClick={() => copy(latest.uuid, latest.id)}
                    title="Click to copy"
                  >
                    <UUIDDisplay uuid={latest.uuid} />
                  </div>
                ) : (
                  <span
                    style={{
                      fontFamily: "var(--font-geist-mono)",
                      fontSize: "15px",
                      color: "rgba(255,255,255,0.2)",
                    }}
                  >
                    —
                  </span>
                )}

                {latest && (
                  <p
                    style={{
                      fontFamily: "var(--font-geist-mono)",
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.4)",
                      marginTop: "14px",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {copiedId === latest.id ? (
                      <span style={{ color: "rgba(255,255,255,0.6)" }}>
                        COPIED TO CLIPBOARD
                      </span>
                    ) : (
                      "CLICK TO COPY"
                    )}
                  </p>
                )}
              </div>

              <button
                onClick={() => generate()}
                style={{
                  width: "100%",
                  padding: "15px 20px",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: "8px",
                  color: "rgba(255,255,255,0.82)",
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: "12px",
                  letterSpacing: "0.12em",
                  cursor: "pointer",
                  marginBottom: "14px",
                  transition: "background 0.18s, border-color 0.18s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.11)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
                }}
              >
                GENERATE{" "}
                <span
                  style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}
                >
                  [SPACE]
                </span>
              </button>

              {entries.length > 1 && (
                <div
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "10px",
                    overflow: "hidden",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 16px",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        fontSize: "10px",
                        color: "rgba(255,255,255,0.45)",
                        letterSpacing: "0.12em",
                      }}
                    >
                      HISTORY
                      <span
                        style={{
                          marginLeft: "8px",
                          color: "rgba(255,255,255,0.32)",
                        }}
                      >
                        {entries.length - 1}
                      </span>
                    </span>
                    <button
                      onClick={copyAll}
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        fontSize: "10px",
                        color:
                          copiedId === "__all__"
                            ? "rgba(255,255,255,0.85)"
                            : "rgba(255,255,255,0.45)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        letterSpacing: "0.1em",
                        transition: "color 0.2s",
                      }}
                    >
                      {copiedId === "__all__" ? "COPIED ALL" : "COPY ALL"}
                    </button>
                  </div>

                  {entries.slice(1).map((entry, idx, arr) => (
                    <div
                      key={entry.id}
                      onClick={() => copy(entry.uuid, entry.id)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "11px 16px",
                        borderBottom:
                          idx < arr.length - 1
                            ? "1px solid rgba(255,255,255,0.04)"
                            : "none",
                        cursor: "pointer",
                        background:
                          copiedId === entry.id
                            ? "rgba(255,255,255,0.05)"
                            : "transparent",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (copiedId !== entry.id)
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.03)";
                      }}
                      onMouseLeave={(e) => {
                        if (copiedId !== entry.id)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span style={{ fontSize: "12px" }}>
                        <UUIDDisplay uuid={entry.uuid} dim />
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          flexShrink: 0,
                          marginLeft: "12px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-geist-mono)",
                            fontSize: "10px",
                            color: "rgba(255,255,255,0.35)",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {entry.version.toUpperCase()}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-geist-mono)",
                            fontSize: "10px",
                            color: "rgba(255,255,255,0.35)",
                          }}
                        >
                          {entry.ts}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-geist-mono)",
                            fontSize: "10px",
                            color:
                              copiedId === entry.id
                                ? "rgba(255,255,255,0.85)"
                                : "rgba(255,255,255,0.35)",
                            letterSpacing: "0.06em",
                            transition: "color 0.2s",
                            minWidth: "36px",
                            textAlign: "right",
                          }}
                        >
                          {copiedId === entry.id ? "COPIED" : "COPY"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  marginBottom: "14px",
                }}
              >
                {BULK_PRESETS.map((n) => {
                  const active = bulkCount === n;
                  return (
                    <button
                      key={n}
                      onClick={() => setBulkCount(n)}
                      style={{
                        padding: "5px 16px",
                        borderRadius: "5px",
                        border: "1px solid",
                        borderColor: active
                          ? "rgba(255,255,255,0.45)"
                          : "rgba(255,255,255,0.1)",
                        background: active
                          ? "rgba(255,255,255,0.09)"
                          : "transparent",
                        color: active
                          ? "rgba(255,255,255,0.88)"
                          : "rgba(255,255,255,0.35)",
                        fontFamily: "var(--font-geist-mono)",
                        fontSize: "11px",
                        letterSpacing: "0.08em",
                        cursor: "pointer",
                        transition: "all 0.18s",
                      }}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={generateBulk}
                style={{
                  width: "100%",
                  padding: "15px 20px",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: "8px",
                  color: "rgba(255,255,255,0.82)",
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: "12px",
                  letterSpacing: "0.12em",
                  cursor: "pointer",
                  marginBottom: "12px",
                  transition: "background 0.18s, border-color 0.18s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.11)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
                }}
              >
                GENERATE {bulkCount}{" "}
                <span
                  style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}
                >
                  [SPACE]
                </span>
              </button>

              {bulkUUIDs.length > 0 && (
                <div
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "10px",
                    overflow: "hidden",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 16px",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        fontSize: "10px",
                        color: "rgba(255,255,255,0.45)",
                        letterSpacing: "0.12em",
                      }}
                    >
                      RESULTS
                      <span
                        style={{
                          marginLeft: "8px",
                          color: "rgba(255,255,255,0.32)",
                        }}
                      >
                        {bulkUUIDs.length}
                      </span>
                    </span>
                    <button
                      onClick={copyBulkAll}
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        fontSize: "10px",
                        color: bulkCopied
                          ? "rgba(255,255,255,0.85)"
                          : "rgba(255,255,255,0.45)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        letterSpacing: "0.1em",
                        transition: "color 0.2s",
                      }}
                    >
                      {bulkCopied ? "COPIED ALL" : "COPY ALL"}
                    </button>
                  </div>

                  <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                    {bulkUUIDs.map((uuid, idx) => (
                      <div
                        key={idx}
                        onClick={() => copyBulkOne(uuid, idx)}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 16px",
                          borderBottom:
                            idx < bulkUUIDs.length - 1
                              ? "1px solid rgba(255,255,255,0.04)"
                              : "none",
                          cursor: "pointer",
                          background:
                            bulkCopiedIdx === idx
                              ? "rgba(255,255,255,0.05)"
                              : "transparent",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (bulkCopiedIdx !== idx)
                            e.currentTarget.style.background =
                              "rgba(255,255,255,0.03)";
                        }}
                        onMouseLeave={(e) => {
                          if (bulkCopiedIdx !== idx)
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span style={{ fontSize: "12px" }}>
                          <UUIDDisplay uuid={uuid} dim />
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-geist-mono)",
                            fontSize: "10px",
                            color:
                              bulkCopiedIdx === idx
                                ? "rgba(255,255,255,0.85)"
                                : "rgba(255,255,255,0.35)",
                            letterSpacing: "0.06em",
                            transition: "color 0.2s",
                            flexShrink: 0,
                            marginLeft: "12px",
                          }}
                        >
                          {bulkCopiedIdx === idx ? "COPIED" : "COPY"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
