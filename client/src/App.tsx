import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import EmotionAI from "@/pages/EmotionAI";
import Chatbot from "@/pages/Chatbot";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/emotion" component={EmotionAI} />
      <Route path="/chatbot" component={Chatbot} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-grow">
          <Router />
        </main>
        <Footer />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
