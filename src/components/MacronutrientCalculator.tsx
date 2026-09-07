import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/lib/firebase";
import type { MacroPercentages } from "@/lib/macronutrients";
import MacroPlanner from "./MacroPlanner";

export default function MacronutrientCalculator({ tdee }: { tdee: number }) {
  const { user, refreshUser } = useAuth();
  if (!user) return null;
  const save = async (percentages: MacroPercentages) => {
    await updateUserProfile(user.uid, { macroPercentages: percentages });
    await refreshUser();
  };
  return <MacroPlanner key={user.uid} tdee={tdee} saved={user.macroPercentages} onSave={save} />;
}
