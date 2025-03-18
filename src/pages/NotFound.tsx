
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center glass-effect p-8 rounded-2xl animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
          <span className="text-2xl font-bold">404</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-gradient">Page Not Found</h1>
        
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link to="/">
          <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
            <ArrowLeft className="mr-2 h-4 w-4" /> 
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
