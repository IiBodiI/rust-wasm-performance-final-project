import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";

const Home = lazy(() => import("./routes/Home"));
const Dashboard = lazy(() => import("./routes/Dashboard"));
const Benchmarks = lazy(() => import("./routes/Benchmarks"));
const About = lazy(() => import("./routes/About"));
const DocsPage = lazy(() => import("./routes/DocsPage"));
const NotFound = lazy(() => import("./routes/NotFound"));
const ImageDemo = lazy(() => import("./demos/ImageDemo"));
const CameraDemo = lazy(() => import("./demos/CameraDemo"));
const MandelbrotDemo = lazy(() => import("./demos/MandelbrotDemo"));
const HashDemo = lazy(() => import("./demos/HashDemo"));
const QrDemo = lazy(() => import("./demos/QrDemo"));
const CompressionDemo = lazy(() => import("./demos/CompressionDemo"));

function Loading() {
  return <div className="empty-state">Loading module...</div>;
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="benchmarks" element={<Benchmarks />} />
          <Route path="about" element={<About />} />
          <Route path="docs" element={<DocsPage />} />
          <Route path="demos/image" element={<ImageDemo />} />
          <Route path="demos/camera" element={<CameraDemo />} />
          <Route path="demos/mandelbrot" element={<MandelbrotDemo />} />
          <Route path="demos/hash" element={<HashDemo />} />
          <Route path="demos/qr" element={<QrDemo />} />
          <Route path="demos/compression" element={<CompressionDemo />} />
          <Route path="not-found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

