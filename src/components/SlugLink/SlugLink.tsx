import { useState } from "react";

import styles from "./SlugLink.module.css";
import { siteUrl, type SlugKind } from "../../utils/slug";

interface SlugLinkProps {
  kind: SlugKind;
  slug?: string | null;
  // В таблицах слаг показываем компактно, в карточках — с подписью
  compact?: boolean;
}

/*
 * Слаг записи и кнопка «скопировать ссылку на сайт».
 * У записей, созданных до появления слага, его нет — бэкенд достроит
 * при первом PATCH, до тех пор показываем прочерк.
 */
const SlugLink = ({ kind, slug, compact = false }: SlugLinkProps) => {
  const [copied, setCopied] = useState(false);

  if (!slug) {
    return (
      <span className={styles.missing} title="Слаг появится после первой правки">
        без адреса
      </span>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(siteUrl(kind, slug));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className={styles.wrapper}>
      <code className={styles.slug}>
        {compact ? slug : `/${kind}/${slug}`}
      </code>
      <button
        type="button"
        className={styles.copyBtn}
        onClick={handleCopy}
        title="Скопировать ссылку на сайт"
      >
        {copied ? "✓" : "🔗"}
      </button>
    </span>
  );
};

export default SlugLink;
