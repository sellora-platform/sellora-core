import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AIAssistant from "./pages/AIAssistant";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Discounts from "./pages/Discounts";
import Settings from "./pages/Settings";
import Storefront from "./pages/Storefront";
import ProductCreate from "./pages/ProductCreate";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Onboarding from "./pages/Onboarding";
import Marketplace from "./pages/Marketplace";
import Domains from "./pages/Domains";
import ExportData from "./pages/ExportData";
import Features from "./pages/Features";
import Benefits from "./pages/Benefits";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import { useState, useEffect } from "react";

function Router() {
  const hostname = window.location.hostname;
  
  // Extract subdomain if on raaenai.com (e.g. "wazewear" from "wazewear.raaenai.com")
  const PLATFORM_ROOT = "raaenai.com";
  const isExactPlatformDomain = hostname === PLATFORM_ROOT || hostname === `www.${PLATFORM_ROOT}`;
  const isSubdomainOfPlatform = !isExactPlatformDomain && hostname.endsWith(`.${PLATFORM_ROOT}`);
  const storeSubdomain = isSubdomainOfPlatform 
    ? hostname.replace(`.${PLATFORM_ROOT}`, "") 
    : null;

  // Core platform domains: localhost, vercel.app, or the root raaenai.com
  const isPlatformDomain = 
    hostname === "localhost" || 
    hostname === "127.0.0.1" || 
    hostname.includes("vercel.app") || 
    isExactPlatformDomain;

  // CASE 1: Subdomain of platform (e.g. wazewear.raaenai.com) → Storefront
  if (storeSubdomain) {
    return (
      <Switch>
        <Route path={"/"}>
          {() => <Storefront params={{ slug: storeSubdomain }} />}
        </Route>
        <Route path={"/cart"} component={Cart} />
        <Route path={"/checkout"} component={Checkout} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // CASE 2: Custom domain (e.g. wazewear.com) → Storefront via domain lookup
  if (!isPlatformDomain) {
    return (
      <Switch>
        <Route path={"/"} component={Storefront} />
        <Route path={"/cart"} component={Cart} />
        <Route path={"/checkout"} component={Checkout} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/reset-password"} component={ResetPassword} />
      <Route path={"/features"} component={Features} />
      <Route path={"/benefits"} component={Benefits} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/ai-assistant"} component={AIAssistant} />
      <Route path={"/products"} component={Products} />
      <Route path={"/products/new"} component={ProductCreate} />
      <Route path={"/orders"} component={Orders} />
      <Route path={"/customers"} component={Customers} />
      <Route path={"/discounts"} component={Discounts} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/domains"} component={Domains} />
      <Route path={"/store/:slug"} component={Storefront} />
      <Route path={"/storefront"} component={Storefront} />
      <Route path={"/cart"} component={Cart} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/onboarding"} component={Onboarding} />
      <Route path={"/marketplace"} component={Marketplace} />
      <Route path={"/export-data"} component={ExportData} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
