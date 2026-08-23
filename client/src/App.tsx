import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { runMigration } from "@/entities/migration/runMigration";
import AgentBuilderPage from "@/pages/AgentBuilderPage";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";


function Router() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/agents"} component={AgentBuilderPage} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  // One-time, idempotent v1 -> v2 data migration (Phase 2 of the Harness Studio
  // architecture work). Reads existing localStorage only, writes the "harness-studio-*-v2"
  // keys that /agents (Phase 3) reads.
  useEffect(() => {
    runMigration();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
