import Image from "next/image";
import styles from "./Footer.module.css";

interface FooterProps {
  style?: React.CSSProperties;
  className?: string;
}

export default function Footer({ style, className }: FooterProps) {
  return (
    <footer
      className={`${styles.footer}${className ? ` ${className}` : ""}`}
      style={style}
    >
      <span className={styles.prefix}>A</span>
      <a
        href="https://tech4good.soe.ucsc.edu/"
        target="_blank"
        rel="noreferrer"
        className={styles.link}
      >
        <Image
          src="/tech4good-smile-small.png"
          alt="Tech4Good Smile"
          width={18}
          height={18}
          className={styles.icon}
        />
        <span>TECH4GOOD LAB</span>
      </a>
      <span className={styles.suffix}>project</span>
    </footer>
  );
}

