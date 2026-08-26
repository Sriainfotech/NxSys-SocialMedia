import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white overflow-hidden p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white to-white" />
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-gradient-to-br from-blue-400/30 to-blue-300/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] bg-gradient-to-br from-blue-400/20 to-pink-400/20 rounded-full blur-3xl" />

      <div className="relative text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/40">
          <Share2 className="w-7 h-7 text-white" />
        </div>
        <h1 className="mb-3 text-7xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          404
        </h1>
        <p className="mb-6 text-xl text-slate-600">We couldn't find that page.</p>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white rounded-full px-6 h-11 shadow-md shadow-blue-500/30"
        >
          <a href="/">
            <ArrowLeft className="w-4 h-4" />
            Return home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
