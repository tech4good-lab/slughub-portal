import Image from "next/image";

interface FooterProps {
  style?: React.CSSProperties;
  className?: string;
}

export default function Footer({ style, className }: FooterProps) {
  return (
    <footer
      className={className}
      style={{
        textAlign: "center",
        fontSize: 16,
        fontWeight: 500,
        color: "#4b5563",
        marginTop: "auto",
        padding: "16px 0 28px",
        position: "relative",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        flexWrap: "wrap",
        ...style,
      }}
    >
      <span>A</span>
      <a
        href="https://tech4good.soe.ucsc.edu/"
        target="_blank"
        rel="noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "#1e1e1e",
          textDecoration: "none",
          fontFamily: "'Nunito Sans', 'Helvetica Neue', sans-serif",
          fontWeight: 700,
          fontSize: 17,
          letterSpacing: "-0.04em",
        }}
      >
        <Image
          src="/tech4good-smile-small.png"
          alt="Tech4Good Smile"
          width={22}
          height={22}
        />
        <span>TECH4GOOD LAB</span>
      </a>
      <span>project</span>
    </footer>
  );
}
