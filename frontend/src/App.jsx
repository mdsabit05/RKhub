import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { api } from "./api";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { Home } from "./pages/Home";
import { ResourcePage } from "./pages/ResourcePage";

// Clerk uses these hash paths during OAuth and MFA flows
const CLERK_HASHES = [
  "/sso-callback",
  "/continue",
  "/verify",
  "/factor-one",
  "/factor-two",
  "/reset-password",
];

function isClerkHash() {
  const hash = window.location.hash.replace(/^#/, "");
  return CLERK_HASHES.some((h) => hash.startsWith(h));
}

// Navigates to home as soon as Clerk establishes a session on the auth pages
function AuthRedirect({ page, go }) {
  const { isLoaded, isSignedIn } = useAuth();
  const navigated = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && (page === "login" || page === "register")) {
      if (!navigated.current) {
        navigated.current = true;
        go("home");
      }
    } else if (!isSignedIn) {
      navigated.current = false;
    }
  }, [isLoaded, isSignedIn, page, go]);

  return null;
}

export function App() {
  // Start on "login" if the app is loaded mid OAuth callback so
  // <SignIn routing="hash"> is mounted to process #/sso-callback
  const [page, setPage] = useState(() => (isClerkHash() ? "login" : "home"));
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
      // Don't interfere while Clerk is handling its hash flow
      if (isClerkHash()) return;
      setPage(event.state?.rkhubPage || "home");
      setMenu(false);
      setNotice("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

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
      <AuthRedirect page={page} go={go} />
      <Header page={page} menu={menu} setMenu={setMenu} go={go} />
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
        <AuthPage mode={page} go={go} />
      ) : (
        <ResourcePage type={page} go={go} />
      )}
      <Footer />
    </div>
  );
}

export default App;
