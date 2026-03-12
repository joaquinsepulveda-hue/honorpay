import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDays,
  Users,
  FileText,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
} from "lucide-react";

const steps = [
  { icon: CalendarDays, title: "1. Crea el evento", desc: "Ingresa nombre, fecha y lugar. En minutos tienes tu evento listo." },
  { icon: Users, title: "2. Invita trabajadores", desc: "Busca por RUT o email. Los garzones reciben su invitación y aceptan desde el celular." },
  { icon: FileText, title: "3. Emite boletas", desc: "Cada trabajador emite su boleta de honorarios con un clic. Folio generado automáticamente." },
  { icon: CreditCard, title: "4. Pago masivo + F29", desc: "Aprueba el pago con la retención ya calculada. El F29 se genera solo." },
];

const features = [
  { icon: Zap, title: "Retención automática", desc: "10.75% calculado al centavo en cada boleta. Sin errores manuales." },
  { icon: Shield, title: "Cumplimiento SII", desc: "Folios en formato HP-AAAA-XXXXXX. F29 listo para copiar al portal del SII." },
  { icon: BarChart3, title: "Control total", desc: "Dashboard en tiempo real con ingresos, pagos y estado de cada evento." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">H</span>
            </div>
            <span className="text-xl font-bold text-primary">HonorPay</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Iniciar sesión</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Comenzar gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <CheckCircle className="h-4 w-4" />
          Diseñado para el rubro de eventos en Chile
        </div>
        <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
          Boletas de honorarios<br />
          <span className="text-primary">sin dolores de cabeza</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          HonorPay automatiza el flujo completo: crea eventos, invita garzones, emite boletas al SII y procesa pagos masivos con retención calculada.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Empezar ahora — es gratis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">Ya tengo cuenta</Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card border-y border-border py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Cómo funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Por qué HonorPay</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <Card key={feat.title}>
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground">{feat.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Roles */}
      <section className="bg-card border-y border-border py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Para cada rol del equipo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Empresa / Banquetera</h3>
              </div>
              {["Crea y gestiona múltiples eventos", "Invita trabajadores por RUT o email", "Aprueba pagos masivos con un clic", "Genera el F29 automáticamente"].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Trabajador / Garzón</h3>
              </div>
              {["Recibe y acepta invitaciones desde el celular", "Emite su boleta con un toque", "Ve su historial de ingresos netos", "Configura sus datos bancarios para recibir pagos"].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Listo para simplificar tus boletas</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Únete a HonorPay y olvídate del papeleo manual.
        </p>
        <Link href="/register">
          <Button size="lg" className="gap-2">
            Crear cuenta gratis
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">H</span>
            </div>
            <span className="font-medium text-foreground">HonorPay</span>
          </div>
          <p>© {new Date().getFullYear()} HonorPay. Para el rubro de eventos en Chile.</p>
        </div>
      </footer>
    </div>
  );
}
