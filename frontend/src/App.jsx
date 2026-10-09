import React, { useEffect, useState } from "react";
import { api } from "./api";
import { getSession } from "./lib/auth-client";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { Home } from "./pages/Home";
import { ResourcePage } from "./pages/ResourcePage";

export function App() {
  const [page, setPage] = useState(() => {
    return window.history.state?.rkhubPage || "home";
  });
  const [menu, setMenu] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [notice, setNotice] = useState("");
  const [aiResult, setAiResult] = useState(null);

  // Sync session on mount (essential for Google OAuth return)
  useEffect(() => {
    // 1. Check if token was provided in URL query or hash params from OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const returnedToken = urlParams.get("token") || hashParams.get("token");

    if (returnedToken) {
      localStorage.setItem("rkhub_auth_token", returnedToken);
      urlParams.delete("token");
      const cleanSearch = urlParams.toString() ? `?${urlParams.toString()}` : "";
      const cleanUrl = `${window.location.pathname}${cleanSearch}`;
      window.history.replaceState({ rkhubPage: "home" }, "", cleanUrl);
    }

    // 2. Fetch active session using Bearer auth token
    getSession()
      .then((res) => {
        if (res?.data?.token) {
          localStorage.setItem("rkhub_auth_token", res.data.token);
        }
        if (res?.data?.user) {
          localStorage.setItem("rkhub_user", JSON.stringify(res.data.user));
        }
      })
      .catch(() => {});
  }, []);

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
      setPage(event.state?.rkhubPage || "home");
      setMenu(false);
      setNotice("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!window.history.state?.rkhubPage) {
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
