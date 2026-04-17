import { Outlet, Link } from "react-router-dom";
import { useTheme } from "../shared/context/ThemeContext";
import ThemeToggle from "../shared/components/ThemeToggle";

export default function AuthLayout() {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      {/* Panel izquierdo — visual (solo desktop) */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-2/5 relative flex-col justify-between p-10"
        style={{
          background:
            "linear-gradient(135deg, var(--color-brand-700) 0%, var(--color-brand-500) 60%, var(--color-brand-400) 100%)",
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Finmo
          </span>
        </Link>

        {/* Contenido central */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-snug">
              Toma el control de
              <br />
              tus finanzas personales
            </h2>
            <p className="mt-3 text-white/70 text-sm leading-relaxed max-w-xs">
              Registra ingresos y gastos, detecta patrones y recibe alertas
              inteligentes antes de que los problemas lleguen.
            </p>
          </div>

          {/* Testimonial / stats */}
          <div className="flex flex-col gap-3">
            {[
              {
                value: "43%",
                label: "de personas sienten estrés por sus finanzas",
              },
              {
                value: "IA",
                label: "Alertas preventivas con análisis de comportamiento",
              },
              { value: "100%", label: "Gratis para empezar" },
            ].map((s) => (
              <div
                key={s.value}
                className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3"
              >
                <span className="text-xl font-bold text-white min-w-[3rem]">
                  {s.value}
                </span>
                <span className="text-sm text-white/75">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} Finmo · ITM Proyecto de Grado
        </p>

        {/* Decoración */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute bottom-0 -left-12 w-48 h-48 rounded-full bg-white/5" />
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex flex-col">
        {/* Barra superior mobile */}
        <header className="flex items-center justify-between px-6 py-4 lg:justify-end">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--color-brand-500)" }}
            >
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <span
              className="font-bold text-base"
              style={{ color: "var(--fg)" }}
            >
              Finmo
            </span>
          </Link>
          <ThemeToggle />
        </header>

        {/* Formulario centrado */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm">
            <div
              className="rounded-2xl p-8 "
              // style={{
              //   background: "var(--surface)",
              //   border: "1px solid var(--border)",
              // }}
            >
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
