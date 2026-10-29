
import { useState } from "react";
import PhotoboothPage from "./pages/photoboothpage";
import ResultPage from "./pages/resultpage";
import DownloadPage from "./pages/downloadpage";
import "./App.css";

export default function App() {
  const [result, setResult] = useState(null);

  const isDownloadPage = window.location.pathname === "/download";

  if (isDownloadPage) {
    return <DownloadPage />;
  }

  return (
    <main className="app-shell">
      {result ? (
        <ResultPage
          result={result}
          onRestart={() => setResult(null)}
        />
      ) : (
        <PhotoboothPage onComplete={setResult} />
      )}
    </main>
  );
}
