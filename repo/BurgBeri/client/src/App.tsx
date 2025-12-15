import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

function Router() {
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin/login">
        <AdminLogin onLogin={() => setIsAdminAuthed(true)} />
      </Route>
      <Route path="/admin">
        {isAdminAuthed ? (
          <AdminDashboard onLogout={() => setIsAdminAuthed(false)} />
        ) : (
          <AdminLogin onLogin={() => setIsAdminAuthed(true)} />
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
