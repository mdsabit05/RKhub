import React, { useEffect, useState } from "react";
import { api } from "./api";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { AdminPage } from "./pages/AdminPage";
import { Home } from "./pages/Home";
import { ResourcePage } from "./pages/ResourcePage";

export function App() {
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
    const onPopState = (event) => {
      if (event.state?.rkhubPage) {
        setPage(event.state.rkhubPage);
      } else {
        setPage("home");
      }
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

  const submit = async (customContext = {}) => {
    if (!prompt.trim() && !customContext.attachmentName) {
      setNotice("Type what you need or attach context first.");
      return;
    }

    setNotice("Searching RKhub resources with AI...");

    try {
      const result = await api.chat(prompt.trim(), customContext);
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
      ) : (
        <ResourcePage type={page} go={go} />
      )}
      <Footer />
    </div>
  );
}

export default App;
