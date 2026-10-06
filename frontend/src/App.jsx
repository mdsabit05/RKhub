import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { api } from "./api";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { Home } from "./pages/Home";
import { ResourcePage } from "./pages/ResourcePage";

// Watches Clerk's auth state and navigates away from auth pages once signed in
function ClerkAuthHandler({ page, go }) {
  const { isSignedIn, isLoaded } = useAuth();
  const didNavigate = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && (page === "login" || page === "register") && !didNavigate.current) {
      didNavigate.current = true;
      go("home");
    }
    if (!isSignedIn) {
      didNavigate.current = false;
    }
  }, [isSignedIn, isLoaded, page, go]);

  return null;
}

export function App() {
  const hasClerkKey = true; // ClerkProvider is always mounted (see main.jsx)
  const CLERK_HASHES = ["/sso-callback", "/continue", "/verify", "/factor-one", "/factor-two", "/reset-password"];
  const isClerkHash = () => CLERK_HASHES.some((h) => window.location.hash.replace(/^#/, "").startsWith(h));

  // If the page loads mid Clerk OAuth flow, show the login page so
  // <SignIn routing="hash"> is mounted and can process #/sso-callback
  const [page, setPage] = useState(() => isClerkHash() ? "login" : "home");
  const [menu, setMenu] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [notice, setNotice] = useState("");
  const [aiResult, setAiResult] = useState(null);

  const go = (nextPage) => {
    if (nextPage !== page) {
      window.history.pushState({ rkhubPage: nextPage }, "");
    }
    setPage(nextPage);
    setMenu(false);
    setNotice("");
    setAiResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onPopState = (event) => {
      // Ignore Clerk's internal hash routing — let ClerkProvider handle it
      if (isClerkHash()) return;

      if (event.state?.rkhubPage) {
        setPage(event.state.rkhubPage);
      } else {
        setPage("home");
      }
      setMenu(false);
      setNotice("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // On initial load, don't overwrite state if Clerk is mid-flow
    if (!window.history.state?.rkhubPage && !isClerkHash()) {
      window.history.replaceState({ rkhubPage: "home" }, "");
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const submit = async () => {
    const query = prompt.trim();
    if (!query) {
      setNotice("Type what you need first.");
      return;
    }

    setPrompt("");
    setNotice("Searching RKhub resources with AI...");

    try {
      const result = await api.chat(query);
      setAiResult(result);
      setNotice(result?.message || "I couldn't find that material in the RKhub college resources.");
    } catch (error) {
      setAiResult(null);
      setNotice(error.message || "I couldn't find that material in the RKhub college resources.");
    }
  };

  return (
    <div className="app-shell">
      <ClerkAuthHandler page={page} go={go} />
      <Header
        page={page}
        menu={menu}
        setMenu={setMenu}
        go={go}
        hasClerkKey={hasClerkKey}
      />
      {page === "home" ? (
        <Home
          prompt={prompt}
          setPrompt={setPrompt}
          notice={notice}
          submit={submit}
          go={go}
          aiResult={aiResult}
        />
      ) : page === "admin" ? (
        <AdminPage go={go} />
      ) : page === "login" || page === "register" || page === "account" ? (
        <AuthPage mode={page} go={go} hasClerkKey={hasClerkKey} />
      ) : (
        <ResourcePage type={page} go={go} />
      )}
      <Footer />
    </div>
  );
}

export default App;
