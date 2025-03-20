
import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();
  const [errorDetails, setErrorDetails] = useState<any>(null);

  useEffect(() => {
    // Try to parse error details from the URL if available
    try {
      const searchParams = new URLSearchParams(location.search);
      const errorParam = searchParams.get("error");
      if (errorParam) {
        setErrorDetails(JSON.parse(decodeURIComponent(errorParam)));
      }
    } catch (error) {
      console.error("Error parsing error details:", error);
    }

    // Log the error for debugging
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      errorDetails
    );
  }, [location, errorDetails]);

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md p-6 bg-white shadow-lg">
        <div className="text-center">
          <div className="bg-red-100 text-red-500 rounded-full p-3 inline-flex mb-4">
            <AlertCircle size={32} />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Página não encontrada</h1>
          <p className="text-gray-600 mb-6">
            A página que você está tentando acessar não existe ou ocorreu um erro.
          </p>

          {errorDetails && (
            <div className="mb-6 p-3 bg-gray-100 rounded-lg text-left">
              <p className="font-medium text-gray-800">Detalhes do erro:</p>
              <p className="text-sm text-gray-600 mt-1">
                Código: {errorDetails.code || "Desconhecido"}
              </p>
              {errorDetails.message && (
                <p className="text-sm text-gray-600 mt-1">
                  Mensagem: {errorDetails.message}
                </p>
              )}
              {errorDetails.id && (
                <p className="text-sm text-gray-600 mt-1">
                  ID: {errorDetails.id}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={goBack}
            >
              <ArrowLeft size={16} />
              Voltar
            </Button>
            <Button 
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
              asChild
            >
              <Link to="/dashboard">
                <Home size={16} />
                Ir para Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
