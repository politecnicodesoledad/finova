import { useEffect, useState } from "react";
import { LoginScreen } from "@/components/login/LoginScreen";
import { StudentDashboard } from "@/components/student/StudentDashboard";
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard";
import { ModalHost } from "@/components/ui-finova/ModalHost";
import { Toasts } from "@/components/ui-finova/Toasts";
import { useAppStore } from "@/store/appStore";

/** Top-level controller: login, teacher panel or student dashboard (same as renderApp()). */
export function FinovaApp() {
  // The app state lives in the browser (localStorage), so render after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const user = useAppStore((s) => s.currentUser);

  return (
    <>
      <Toasts />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {!mounted ? null : !user ? <LoginScreen /> : user.role === "teacher" ? <TeacherDashboard /> : <StudentDashboard />}
      </div>
      {mounted ? <ModalHost /> : null}
    </>
  );
}
