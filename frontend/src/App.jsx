import React, { useEffect, useState } from "react";
import { api } from "./api";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { Home } from "./pages/Home";
import { ResourcePage } from "./pages/ResourcePage";

export function App({ hasClerkKey }) {
  const [page, setPage] = useState("home");
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
    const CLERK_HASHES = ["/sso-callback", "/continue", "/verify", "/factor-one", "/factor-two", "/reset-password", "/sign-in", "/sign-up"];

    const isClerkHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      return CLERK_HASHES.some((h) => hash.startsWith(h));
    };

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
