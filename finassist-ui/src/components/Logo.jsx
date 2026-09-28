import logo from "../assets/logo.png";

function Logo({ size = 40, rounded = true }) {
  return (
    <img
      src={logo}
      alt="FinAssist"
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        borderRadius: rounded ? "50%" : "0",
        background: "rgba(255,255,255,0.2)",
        flexShrink: 0,
      }}
    />
  );
}

export default Logo;