import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import PatientCalculator from "@/components/PatientCalculator";

export default function CaseWorkspace() {
  const { lang } = useLanguage();
  return <div className="page-stack"><div className="page-heading"><div><p className="eyebrow">CALNUT / {lang === "id" ? "RUANG KASUS" : "CASE WORKSPACE"}</p><h1>{lang === "id" ? "Dari perhitungan ke pemahaman." : "From calculation to understanding."}</h1><p className="muted">{lang === "id" ? "Ruang terpisah untuk praktik profesional dan pembelajaran gizi." : "A separate space for professional practice and nutrition teaching."}</p></div><Link className="btn-text" to="/dashboard">{lang === "id" ? "Dasbor pribadi" : "Personal dashboard"} →</Link></div><PatientCalculator /></div>;
}
