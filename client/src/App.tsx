import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import { History, Profile, Recommendation, UploadCrop } from "@/pages/CropPages";
import Gallery from "@/pages/Gallery";
import About, { Contact } from "@/pages/InfoPages";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/login" component={() => <AuthPage mode="login" />} />
    <Route path="/register" component={() => <AuthPage mode="register" />} />
    <Route path="/dashboard" component={Dashboard} />
    <Route path="/upload" component={UploadCrop} />
    <Route path="/recommendation/:id" component={Recommendation} />
    <Route path="/history" component={History} />
    <Route path="/gallery" component={Gallery} />
    <Route path="/profile" component={Profile} />
    <Route path="/about" component={About} />
    <Route path="/contact" component={Contact} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
