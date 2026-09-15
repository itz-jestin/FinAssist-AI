function SourceBadge({ label = "Account Data" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        backgroundColor: "#E6F4EA",
        color: "#1E7B34",
        fontSize: "12px",
        fontWeight: 600,
        padding: "2px 10px",
        borderRadius: "999px",
        marginTop: "6px",
      }}
    >
      📊 {label}
    </span>
  );
}

export default SourceBadge;