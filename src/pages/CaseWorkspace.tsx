import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import PatientCalculator from "@/components/PatientCalculator";
import HelpTip from "@/components/HelpTip";

export default function CaseWorkspace() {
  const { lang } = useLanguage();
  const idn = lang === "id";
  return <div className="page-stack"><div className="page-heading"><div><p className="eyebrow">CALNUT / {idn ? "RUANG KASUS" : "CASE WORKSPACE"}</p><h1>{idn ? "Kalkulator kasus" : "Case calculator"} <HelpTip label={idn ? "Kalkulator kasus" : "Case calculator"}>{idn ? "Untuk skenario pembelajaran dewasa. Data kasus hanya ada di layar ini dan tidak disimpan ke Firebase." : "For adult teaching scenarios. Case measurements stay on this screen and are not saved to Firebase."}</HelpTip></h1></div><Link className="btn-text" to="/dashboard">{idn ? "Dasbor pribadi" : "Personal dashboard"} →</Link></div><PatientCalculator /></div>;
}
