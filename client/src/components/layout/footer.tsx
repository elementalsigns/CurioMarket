import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-red-900 border-t border-white py-8 px-4" data-testid="footer">
      <div className="container mx-auto text-center">
        <h3 className="text-white text-xl mb-2">SINGLE FOOTER TEST</h3>
        <p className="text-white">This should appear only ONCE. If you see this twice, there's a duplication bug.</p>
      </div>
    </footer>
  );
}
