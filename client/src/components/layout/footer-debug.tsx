import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function FooterDebug() {
  return (
    <footer 
      className="bg-red-900 border-t border-red-500 py-16 px-4 sm:px-6 lg:px-8 flex-shrink-0" 
      data-testid="footer-debug"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center text-white">
          <h3>DEBUG FOOTER - This should only appear once</h3>
          <p>If you see this twice, there's a React rendering issue</p>
        </div>
      </div>
    </footer>
  );
}